from fastapi import APIRouter, HTTPException, Response, Query, Body, UploadFile, File, Depends
from typing import Optional
from pydantic import BaseModel
import base64
from sqlalchemy.orm import Session
from app.services.text_to_speech_service import TextToSpeechService
from app.services.ai_credits_service import AICreditService
from app.core.auth import get_current_active_user
from app.models.user import User
from app.db.session import get_db
from app.schemas.text_to_speech import (
    TextToSpeechRequest, 
    TextToSpeechResponse, 
    AvailableVoicesResponse,
    ErrorResponse
)

router = APIRouter()

# Keep the legacy request class for backward compatibility
class LegacyTextToSpeechRequest(BaseModel):
    text: str
    lang: Optional[str] = "en"
    slow: Optional[bool] = False

@router.post("/", response_model=TextToSpeechResponse)
async def text_to_speech(
    request: TextToSpeechRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Enhanced text-to-speech endpoint with word timestamps and voice selection.
    
    Request Body:
    {
        "lang": "en",
        "pitch": 1.0,
        "rate": 1.0,
        "text": "I approach problem-solving with a systematic methodology...",
        "voice": "alloy"
    }
    
    Response:
    {
        "audio": "<base64-encoded-audio>",
        "timestamps": [
            {"word": "I", "start": 0.0, "end": 0.2},
            {"word": "approach", "start": 0.2, "end": 0.8},
            ...
        ],
        "duration": 15.5,
        "voice_used": "Joanna",
        "language": "en-US"
    }
    """
    try:
        # Check and deduct AI credits (1 credit per text-to-speech request)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        tts_service = TextToSpeechService()
        
        # Generate speech with timestamps
        audio_data, timestamps, duration, voice_used = await tts_service.synthesize_speech_with_timestamps(
            text=request.text,
            lang=request.lang,
            pitch=request.pitch,
            rate=request.rate,
            voice=request.voice
        )
        
        # Validate audio data
        if not audio_data or len(audio_data) == 0:
            raise Exception("No audio data generated")
        
        # Encode audio as base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        # Log for debugging
        print(f"Generated audio: {len(audio_data)} bytes, Base64: {len(audio_base64)} chars")
        print(f"Audio header: {audio_data[:10].hex() if len(audio_data) >= 10 else 'N/A'}")
        
        return TextToSpeechResponse(
            audio=audio_base64,
            timestamps=timestamps,
            duration=duration,
            voice_used=voice_used,
            language=request.lang
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio-file")
async def text_to_speech_file(
    request: TextToSpeechRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Enhanced text-to-speech endpoint that returns raw MP3 file for testing.
    """
    try:
        # Check and deduct AI credits (1 credit per text-to-speech request)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        tts_service = TextToSpeechService()
        
        # Generate speech with timestamps
        audio_data, timestamps, duration, voice_used = await tts_service.synthesize_speech_with_timestamps(
            text=request.text,
            lang=request.lang,
            pitch=request.pitch,
            rate=request.rate,
            voice=request.voice
        )
        
        # Return raw MP3 file
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f'attachment; filename="speech_{voice_used}.mp3"',
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*",
                "X-Audio-Duration": str(duration),
                "X-Voice-Used": voice_used,
                "X-Timestamps-Count": str(len(timestamps))
            }
        )
        
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices", response_model=AvailableVoicesResponse)
async def get_available_voices(lang: Optional[str] = Query(None, description="Filter voices by language code")):
    """
    Get list of available voices, optionally filtered by language.
    """
    try:
        tts_service = TextToSpeechService()
        voices = await tts_service.get_available_voices(lang)
        
        # Convert VoiceInfo objects to dict format for response
        voices_dict = [
            {
                "id": voice.id,
                "name": voice.name,
                "language": voice.language,
                "gender": voice.gender,
                "engine": voice.engine,
                "description": voice.description
            } for voice in voices
        ]
        
        return AvailableVoicesResponse(voices=voices_dict)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/debug")
async def debug_text_to_speech(request: TextToSpeechRequest):
    """
    Debug endpoint to test audio generation and return detailed info.
    """
    try:
        tts_service = TextToSpeechService()
        
        # Generate speech with timestamps
        audio_data, timestamps, duration, voice_used = await tts_service.synthesize_speech_with_timestamps(
            text=request.text,
            lang=request.lang,
            pitch=request.pitch,
            rate=request.rate,
            voice=request.voice
        )
        
        # Validate audio data
        if not audio_data or len(audio_data) == 0:
            raise Exception("No audio data generated")
        
        # Check if it's valid MP3
        is_valid_mp3 = audio_data[:3] == b'ID3' or audio_data[:2] == b'\xff\xfb'
        
        return {
            "success": True,
            "audio_size_bytes": len(audio_data),
            "audio_header_hex": audio_data[:10].hex() if len(audio_data) >= 10 else None,
            "is_valid_mp3": is_valid_mp3,
            "duration": duration,
            "voice_used": voice_used,
            "language": request.lang,
            "timestamps_count": len(timestamps),
            "first_few_timestamps": timestamps[:3],
            "message": "Audio generated successfully! Use /audio-file endpoint to download the MP3."
        }
        
    except ValueError as ve:
        return {"success": False, "error": "Validation Error", "detail": str(ve)}
    except Exception as e:
        return {"success": False, "error": "Generation Error", "detail": str(e)}

# Legacy endpoints for backward compatibility

@router.post("/legacy")
async def legacy_text_to_speech(
    request: Optional[LegacyTextToSpeechRequest] = Body(None),
    text: Optional[str] = Query(None, description="Text to convert to speech (fallback for query param)"),
    lang: str = Query(default="en", description="Language code (e.g., en, es, fr)"),
    slow: bool = Query(default=False, description="Slower speech rate")
):
    """Legacy text-to-speech endpoint that returns raw audio (for backward compatibility)."""
    try:
        # Prefer JSON body if provided
        if request and request.text:
            text_val = request.text
            lang_val = request.lang if request.lang is not None else lang
            slow_val = request.slow if request.slow is not None else slow
        elif text:
            text_val = text
            lang_val = lang
            slow_val = slow
        else:
            raise HTTPException(status_code=422, detail="'text' field is required in JSON body or as query parameter.")

        tts_service = TextToSpeechService()
        audio_content = await tts_service.synthesize_speech(text_val, lang=lang_val, slow=slow_val)
        
        # Return the audio content with appropriate headers for direct playback
        return Response(
            content=audio_content,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": 'attachment; filename="speech.mp3"',
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/play")
async def play_speech(
    text: str,
    lang: str = Query(default="en", description="Language code (e.g., en, es, fr)"),
    slow: bool = Query(default=False, description="Slower speech rate")
):
    """Generate speech from text using GET method - returns HTML with audio player"""
    try:
        tts_service = TextToSpeechService()
        audio_content = await tts_service.synthesize_speech(text, lang=lang, slow=slow)
        
        # Create an HTML response with an audio player
        html_content = f"""
        <html>
            <body>
                <audio controls autoplay>
                    <source src="/api/text-to-speech?text={text}&lang={lang}&slow={str(slow).lower()}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </body>
        </html>
        """
        return Response(
            content=html_content,
            media_type="text/html"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AdvancedTextToSpeechRequest(BaseModel):
    text: str
    lang: Optional[str] = "en"
    slow: Optional[bool] = False
    speed: Optional[float] = 1.0
    pitch: Optional[float] = 1.0
    volume: Optional[float] = 1.0
    emotion: Optional[str] = None
    voice_id: Optional[str] = None

@router.post("/advanced")
async def advanced_text_to_speech(
    request: AdvancedTextToSpeechRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate speech with advanced controls and custom voice."""
    try:
        # Check and deduct AI credits (1 credit per text-to-speech request)
        AICreditService.check_and_deduct_credits(db, current_user, 1)
        
        tts_service = TextToSpeechService()
        audio_content = await tts_service.synthesize_speech(
            text=request.text,
            lang=request.lang,
            slow=request.slow,
            speed=request.speed,
            pitch=request.pitch,
            volume=request.volume,
            emotion=request.emotion,
            voice_id=request.voice_id
        )
        return Response(
            content=audio_content,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": 'attachment; filename="speech.mp3"',
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-cache",
                "Access-Control-Allow-Origin": "*"
            }
        )
    except NotImplementedError as nie:
        raise HTTPException(status_code=501, detail=str(nie))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-voice")
async def upload_voice_sample(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload a voice sample for voice cloning."""
    try:
        # Save file to a temp location or storage, then register with TTS service
        temp_path = f"/tmp/{current_user.id}_{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        tts_service = TextToSpeechService()
        voice_id = tts_service.save_user_voice_sample(current_user.id, temp_path)
        return {"voice_id": voice_id, "message": "Voice sample uploaded successfully."}
    except NotImplementedError as nie:
        raise HTTPException(status_code=501, detail=str(nie))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
