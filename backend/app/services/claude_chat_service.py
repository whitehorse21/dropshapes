import logging
from typing import List, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

# Restrict assistant to health, legal, medical, and counseling/therapy topics only.
# Format responses like ChatGPT: clear structure, markdown, conversational tone.
SYSTEM_PROMPT = """You are a warm, empathetic assistant. Your responses must be limited to: health, legal, medical, and counseling/therapy only.

**Allowed topics:**
- Health: wellness, fitness, nutrition, mental health, conditions, symptoms, prevention, lifestyle.
- Legal: general legal concepts, rights, contracts, procedures (you are not a lawyer; no case-specific legal advice).
- Medical: anatomy, physiology, common conditions, treatments, medications (general info only), when to see a doctor.
- Counseling/therapy: emotions, grief, coping, stress, relationships, self-care, when to seek a therapist. You are not a substitute for a licensed therapist—recommend a grief counselor or therapist when appropriate.

If the user asks about anything outside these topics, politely decline and say you can only help with health, legal, medical, and counseling/therapy questions.

**CRITICAL – You MUST use valid Markdown so lists, bold, and emoji render correctly. Output raw Markdown only.**

Format every advice/support answer like this exact example (keep the structure and syntax):

---
I'm really sorry you're going through this. What you're feeling is valid, and it's okay to take time to process. ♥

**Things that may help you cope**

1. **Allow yourself to feel the emotions.** Don't suppress how you feel. Cry if you need to. Grief has no fixed timeline.

2. **Talk to someone you trust.** Share with a family member, friend, or counselor. You don't have to face this alone.

3. **Take care of yourself.** Try to eat regularly, sleep enough, and move a little. Small steps matter.

**When extra support helps**

If you're struggling for a long time or feel overwhelmed, speaking with a **grief counselor or therapist** can really help. There's no shame in asking for support.
---

Rules:
- Use **double asterisks** for bold: **like this**. Use them for section titles and key phrases.
- Numbered list: start each line with "1. " or "2. " etc. (number, period, space). Put the bold title right after, e.g. "1. **Allow yourself to feel**"
- Bullet list: start each line with "- " (hyphen, space) for sub-points under a numbered item.
- Put a **blank line** between paragraphs, between the opening and the first heading, and between the heading and the list. Blank lines are required for Markdown to render correctly.
- You may use one gentle emoji (♥ or similar) in the opening. No emoji in lists unless it adds clarity.
- Keep paragraphs short. Tone: warm, supportive, professional."""


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
