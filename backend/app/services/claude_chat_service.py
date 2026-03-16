import logging
from typing import List, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

# Restrict assistant to health, legal, medical, and counseling/therapy topics only.
# Tone: friendly, professional. Responses: SIMPLE and short so the user can easily ask for more.
# Language: always English for both text and any spoken output.
SYSTEM_PROMPT = """You are a friendly, professional assistant. Be warm and approachable while staying clear and trustworthy.

**Language:** Always respond in English only. Write every reply entirely in English, regardless of the language the user writes in.

Your responses must be limited to: health, legal, medical, and counseling/therapy only.

**Allowed topics:**
- Health: wellness, fitness, nutrition, mental health, conditions, symptoms, prevention, lifestyle.
- Legal: general legal concepts, rights, contracts, procedures (you are not a lawyer; no case-specific legal advice).
- Medical: anatomy, physiology, common conditions, treatments, medications (general info only), when to see a doctor.
- Counseling/therapy: emotions, grief, coping, stress, relationships, self-care, when to seek a therapist. Recommend a **grief counselor or therapist** when appropriate.

If the user asks about anything outside these topics, politely decline in one short sentence.

**Keep responses SIMPLE and SHORT:**
- Aim for 2-4 short paragraphs or a brief list (3-5 items max). Leave room for the user to ask for more detail.
- One warm opening sentence; then the main answer in plain language. Use **bold** only for key terms. One gentle emoji (♥ 🙂 ✓ 💡 🌟) per response is enough.
- Use valid Markdown: **bold**, short numbered or bullet lists only when they add clarity. Avoid long lists—if the user wants more, they can ask.
- End with a short invite when it fits (e.g. "Want me to go deeper on any of this?" or "I can give examples if that would help.") so the user feels encouraged to explain more or ask follow-ups.

**Use valid Markdown only.** Numbers, bullets, bold, and emoji must render correctly. Output raw Markdown."""


class ClaudeChatService:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is None:
            api_key = (settings.ANTHROPIC_API_KEY or "").strip()
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY is not set. Add it to backend .env to enable chat.")
            try:
                from anthropic import Anthropic
                self._client = Anthropic(api_key=api_key)
            except ImportError:
                raise ImportError("anthropic package is required. Install with: pip install anthropic")
        return self._client

    def chat(self, messages: List[Dict[str, str]], max_tokens: int = 4096) -> str:
        """
        Send messages to Claude and return the assistant's text response.
        messages: list of {"role": "user"|"assistant", "content": "..."}
        """
        if not messages:
            return ""
        client = self._get_client()
        # Ensure content is string (Anthropic expects text content as string)
        formatted = []
        for m in messages:
            role = (m.get("role") or "user").strip().lower()
            if role not in ("user", "assistant"):
                role = "user"
            content = m.get("content") or ""
            if isinstance(content, list):
                content = " ".join(
                    (c.get("text", c) if isinstance(c, dict) else str(c)) for c in content
                )
            formatted.append({"role": role, "content": str(content).strip() or "(empty)"})

        model = (getattr(settings, "CLAUDE_MODEL", None) or "claude-sonnet-4-6").strip()
        try:
            response = client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=SYSTEM_PROMPT,
                messages=formatted,
                temperature=0.7,
            )
            if response.content and len(response.content) > 0:
                block = response.content[0]
                if hasattr(block, "text"):
                    return block.text or ""
                if isinstance(block, dict) and "text" in block:
                    return block["text"] or ""
            return ""
        except Exception as e:
            logger.error("Claude API error: %s", e)
            raise