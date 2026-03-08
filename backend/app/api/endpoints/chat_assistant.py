import logging
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Request, Form
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import settings
from app.core.auth import get_current_active_user, get_current_user_optional
from app.models.user import User
from app.models.chat import ChatConversation, ChatMessage
from app.schemas.chat import (
    ChatMessageCreate,
    ChatSendResponse,
    ChatMessageResponse,
    ConversationResponse,
    ConversationWithMessages,
    ConversationCreate,
    ConversationUpdate,
)
from anthropic import NotFoundError as AnthropicNotFoundError
from app.services.claude_chat_service import ClaudeChatService
from app.services.speech_to_text_service import transcribe_audio
from app.services.text_to_speech_service import TextToSpeechService
from app.core.auth import create_access_token
from jose import jwt, JWTError
from datetime import timedelta

logger = logging.getLogger(__name__)

# Playback token payload: {"mid": message_id, "exp": ...}
def _create_playback_token(message_id: int) -> str:
    return create_access_token(
        data={"mid": message_id, "sub": "chat_audio"},
        expires_delta=timedelta(hours=1),
    )

def _verify_playback_token(token: str, message_id: int) -> bool:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload.get("mid") == message_id and payload.get("sub") == "chat_audio"
    except JWTError:
        return False

router = APIRouter()
claude_service = ClaudeChatService()


def _title_from_message(text: str, max_len: int = 80) -> str:
    t = (text or "").strip().replace("\n", " ")
    return t[:max_len] + ("..." if len(t) > max_len else "") or "New Chat"


@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all chat conversations for the current user, newest first."""
    convos = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id)
        .order_by(ChatConversation.created_at.desc())
        .all()
    )
    return convos


@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessages)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a single conversation with all its messages."""
    convo = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == current_user.id,
        )
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    body: Optional[ConversationCreate] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Create a new chat conversation (new chat)."""
    title = (body and body.title) or "New Chat"
    convo = ChatConversation(user_id=current_user.id, title=title)
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return convo


@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: int,
    body: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update conversation title (e.g. rename). Only owner can update."""
    convo = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == current_user.id,
        )
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    convo.title = body.title.strip()
    db.commit()
    db.refresh(convo)
    return convo


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Delete a conversation and all its messages (clear all chats in this conversation)."""
    convo = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.id == conversation_id,
            ChatConversation.user_id == current_user.id,
        )
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(convo)
    db.commit()
    return None


@router.post("/message", response_model=ChatSendResponse)
def send_message(
    body: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Send a text message. If conversation_id is provided, append to that conversation;
    otherwise create a new conversation.
    """
    if body.conversation_id:
        convo = (
            db.query(ChatConversation)
            .filter(
                ChatConversation.id == body.conversation_id,
                ChatConversation.user_id == current_user.id,
            )
            .first()
        )
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        convo = ChatConversation(
            user_id=current_user.id,
            title=_title_from_message(body.message),
        )
        db.add(convo)
        db.commit()
        db.refresh(convo)

    # Persist user message (content = text for text messages)
    user_msg = ChatMessage(
        conversation_id=convo.id,
        role="user",
        content=body.message,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Build message history for Claude; user voice messages have content=URL -> use placeholder
    existing = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == convo.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    claude_messages = [
        {"role": m.role, "content": "[Voice message]" if (m.role == "user" and m.content.startswith("http")) else m.content}
        for m in existing
    ]

    try:
        assistant_text = claude_service.chat(claude_messages)
    except ValueError as e:
        # e.g. ANTHROPIC_API_KEY not set
        logger.warning("Chat config: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    except AnthropicNotFoundError as e:
        logger.warning("Claude model not found: %s", e)
        raise HTTPException(
            status_code=502,
            detail="Claude model not found. Set CLAUDE_MODEL in backend .env to a valid model (e.g. claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5).",
        )
    except Exception as e:
        logger.exception("Claude chat failed")
        detail = str(e)
        # Keep message short for client; avoid leaking internals
        if "api_key" in detail.lower() or "auth" in detail.lower():
            detail = "Invalid or missing chat API key. Check backend .env ANTHROPIC_API_KEY."
        raise HTTPException(status_code=502, detail=f"Chat assistant error: {detail}")

    assistant_msg = ChatMessage(
        conversation_id=convo.id,
        role="assistant",
        content=assistant_text,
    )
    db.add(assistant_msg)
    # Update conversation title if it's still the default and this is first exchange
    if convo.title == "New Chat" and len(existing) <= 1:
        convo.title = _title_from_message(body.message)
    db.commit()
    db.refresh(assistant_msg)
    db.refresh(convo)

    return ChatSendResponse(
        conversation_id=convo.id,
        user_message=ChatMessageResponse.model_validate(user_msg),
        assistant_message=ChatMessageResponse.model_validate(assistant_msg),
    )


def _get_message_and_verify_access(
    message_id: int, db: Session, user: User
) -> ChatMessage:
    msg = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    convo = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.id == msg.conversation_id,
            ChatConversation.user_id == user.id,
        )
        .first()
    )
    if not convo:
        raise HTTPException(status_code=404, detail="Message not found")
    return msg


@router.get("/messages/{message_id}/audio")
def get_message_audio(
    request: Request,
    message_id: int,
    t: Optional[str] = Query(None, description="Playback token from /audio-url"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Redirect to presigned S3 URL for voice playback.
    Auth: either query param t= (playback token) or Bearer token. Token allows cross-origin <audio> use.
    """
    if t:
        if not _verify_playback_token(t, message_id):
            raise HTTPException(status_code=401, detail="Invalid or expired playback token")
        msg = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
    else:
        if not current_user:
            raise HTTPException(status_code=401, detail="Playback token or authentication required")
        msg = _get_message_and_verify_access(message_id, db, current_user)
    audio_s3_key = (msg.audio_url or msg.content or "").strip()
    if not audio_s3_key.startswith("http"):
        raise HTTPException(status_code=404, detail="No audio for this message")
    if not settings.USE_S3_STORAGE:
        raise HTTPException(status_code=503, detail="Audio storage not available")
    from app.utils.storage import get_storage
    storage = get_storage()
    if not storage:
        raise HTTPException(status_code=503, detail="Audio storage not available")
    presigned = storage.generate_presigned_url(audio_s3_key, expires_in=3600)
    if not presigned:
        raise HTTPException(status_code=502, detail="Could not generate playback URL")
    return RedirectResponse(url=presigned, status_code=302)


@router.get("/messages/{message_id}/audio-url")
def get_message_audio_url(
    request: Request,
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Return a URL with a short-lived token so the client can use it as <audio src="...">.
    Use this when you have a message with audio and need a playable URL (e.g. cross-origin).
    """
    msg = _get_message_and_verify_access(message_id, db, current_user)
    has_audio = (msg.audio_url and msg.audio_url.strip()) or (msg.content and msg.content.strip().startswith("http"))
    if not has_audio:
        raise HTTPException(status_code=404, detail="No audio for this message")
    token = _create_playback_token(message_id)
    base = str(request.base_url).rstrip("/")
    url = f"{base}{settings.API_V1_STR}/chat/messages/{message_id}/audio?t={token}"
    return {"url": url}


# Voice for assistant TTS: female -> Joanna, male -> Matthew (AWS Polly)
CHAT_RESPONSE_VOICE_FEMALE = "Joanna"
CHAT_RESPONSE_VOICE_MALE = "Matthew"


@router.post("/audio", response_model=ChatSendResponse)
async def send_audio(
    audio: UploadFile = File(...),
    conversation_id: Optional[int] = Query(None),
    response_voice: Optional[str] = Form("female"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Upload audio: save to S3, create user message with content=audio S3 URL,
    transcribe for Claude, get assistant response, generate TTS audio, save to S3,
    create assistant message with content=text and audio_url=TTS S3 URL. Scoped to logged-in user.
    response_voice: "female" or "male" for assistant reply voice.
    """
    raw = await audio.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty audio file")

    try:
        transcribed_text = transcribe_audio(raw, filename=audio.filename)
    except Exception as e:
        logger.exception("Transcription failed")
        raise HTTPException(status_code=502, detail=f"Transcription error: {str(e)}")

    if not (transcribed_text and transcribed_text.strip()):
        raise HTTPException(status_code=400, detail="No speech detected in audio")

    # Save audio to S3; content for user message will be this URL
    audio_s3_url = None
    if settings.USE_S3_STORAGE:
        try:
            from app.utils.storage import get_storage
            storage = get_storage()
            if storage:
                key = f"chat_audio/{uuid.uuid4().hex}.webm"
                try:
                    audio_s3_url = storage.upload_file_content(
                        raw, key=key, content_type="audio/webm", public_read=True
                    )
                except Exception as acl_err:
                    logger.debug("Upload with public-read failed, storing private: %s", acl_err)
                    audio_s3_url = storage.upload_file_content(
                        raw, key=key, content_type="audio/webm", public_read=False
                    )
        except Exception as e:
            logger.warning("Failed to store voice recording: %s", e)

    if not audio_s3_url:
        raise HTTPException(status_code=503, detail="Audio storage not available; enable S3.")

    # Resolve or create conversation (owned by current user)
    if conversation_id is not None:
        convo = (
            db.query(ChatConversation)
            .filter(
                ChatConversation.id == conversation_id,
                ChatConversation.user_id == current_user.id,
            )
            .first()
        )
        if not convo:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        convo = ChatConversation(
            user_id=current_user.id,
            title=_title_from_message(transcribed_text.strip()),
        )
        db.add(convo)
        db.commit()
        db.refresh(convo)

    # Create user message: role=user, content=audio S3 URL
    user_msg = ChatMessage(
        conversation_id=convo.id,
        role="user",
        content=audio_s3_url,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Build Claude history: previous user voice messages (content=URL) -> "[Voice message]"; current turn -> transcribed text
    existing = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == convo.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    claude_messages = []
    for i, m in enumerate(existing):
        if m.role == "user" and m.content.strip().startswith("http"):
            content_for_claude = transcribed_text.strip() if (i == len(existing) - 1) else "[Voice message]"
        else:
            content_for_claude = m.content
        claude_messages.append({"role": m.role, "content": content_for_claude})

    try:
        assistant_text = claude_service.chat(claude_messages)
    except ValueError as e:
        logger.warning("Chat config: %s", e)
        raise HTTPException(status_code=503, detail=str(e))
    except AnthropicNotFoundError as e:
        logger.warning("Claude model not found: %s", e)
        raise HTTPException(
            status_code=502,
            detail="Claude model not found. Set CLAUDE_MODEL in backend .env to a valid model.",
        )
    except Exception as e:
        logger.exception("Claude chat failed")
        detail = str(e)
        if "api_key" in detail.lower() or "auth" in detail.lower():
            detail = "Invalid or missing chat API key. Check backend .env ANTHROPIC_API_KEY."
        raise HTTPException(status_code=502, detail=f"Chat assistant error: {detail}")

    assistant_audio_url = None
    if assistant_text and settings.USE_S3_STORAGE:
        voice = (response_voice or "female").strip().lower()
        polly_voice = CHAT_RESPONSE_VOICE_MALE if voice == "male" else CHAT_RESPONSE_VOICE_FEMALE
        text_for_tts = assistant_text[:3000] if len(assistant_text) > 3000 else assistant_text
        try:
            tts_service = TextToSpeechService()
            audio_bytes = await tts_service.synthesize_speech(
                text_for_tts, lang="en", voice_id=polly_voice
            )
            from app.utils.storage import get_storage
            storage = get_storage()
            if storage and audio_bytes:
                key = f"chat_audio/assistant_{uuid.uuid4().hex}.mp3"
                try:
                    assistant_audio_url = storage.upload_file_content(
                        audio_bytes, key=key, content_type="audio/mpeg", public_read=True
                    )
                except Exception as acl_err:
                    logger.debug("Upload assistant audio with public-read failed: %s", acl_err)
                    assistant_audio_url = storage.upload_file_content(
                        audio_bytes, key=key, content_type="audio/mpeg", public_read=False
                    )
        except Exception as e:
            logger.warning("TTS for chat assistant failed (continuing without audio): %s", e)

    assistant_msg = ChatMessage(
        conversation_id=convo.id,
        role="assistant",
        content=assistant_text,
        audio_url=assistant_audio_url,
    )
    db.add(assistant_msg)
    if convo.title == "New Chat" and len(existing) <= 1:
        convo.title = _title_from_message(transcribed_text.strip())
    db.commit()
    db.refresh(assistant_msg)
    db.refresh(convo)

    return ChatSendResponse(
        conversation_id=convo.id,
        user_message=ChatMessageResponse.model_validate(user_msg),
        assistant_message=ChatMessageResponse.model_validate(assistant_msg),
    )
