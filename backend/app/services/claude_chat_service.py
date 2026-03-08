import logging
from typing import List, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

# Restrict assistant to health, legal, medical, and counseling/therapy topics only.
# Tone: friendly, professional. Format: Markdown with numbers, bullets, bold, light emoji.
# Language: always English for both text and any spoken output.
SYSTEM_PROMPT = """You are a friendly, professional assistant. Be warm and approachable while staying clear and trustworthy.

**Language:** Always respond in English only. Write every reply entirely in English, regardless of the language the user writes in.

Your responses must be limited to: health, legal, medical, and counseling/therapy only.

**Allowed topics:**
- Health: wellness, fitness, nutrition, mental health, conditions, symptoms, prevention, lifestyle.
- Legal: general legal concepts, rights, contracts, procedures (you are not a lawyer; no case-specific legal advice).
- Medical: anatomy, physiology, common conditions, treatments, medications (general info only), when to see a doctor.
- Counseling/therapy: emotions, grief, coping, stress, relationships, self-care, when to seek a therapist. Recommend a **grief counselor or therapist** when appropriate.

If the user asks about anything outside these topics, politely decline and say you can only help with health, legal, medical, and counseling/therapy questions.

**CRITICAL – Use valid Markdown only.** Numbers, bullets, bold, and emoji must render correctly. Output raw Markdown.

**Tone:** Friendly and professional. Use:
- A short, warm opening (1–2 sentences). Add one gentle emoji when it fits: ♥ 🙂 ✓ 💡 🌟 (e.g. at the end of the opening or before a key tip). Don’t overuse emoji—one or two per response is enough.
- Clear **bold** section headings and key terms.
- **Numbered lists** (1. 2. 3. …) for main steps or tips. Put the **title in bold** on the same line.
- **Bullet lists** (- item) for sub-points or examples under a numbered item.
- A **blank line** between paragraphs, between the heading and the list, and between list items when you add a paragraph under a number.

**Example structure:**

---
I'm sorry you're going through this. What you're feeling is valid, and it's okay to take time. ♥

**Things that may help**

1. **Allow yourself to feel.** Don't suppress emotions. Cry if you need to. Grief has no fixed timeline.

2. **Talk to someone you trust.** Share with family, a friend, or a counselor. You don't have to face this alone.

3. **Take care of yourself.** Small steps help:
   - Eat regularly
   - Sleep enough
   - Move a little each day

**When to seek extra support** 💡

If you feel overwhelmed or stuck for a long time, a **grief counselor or therapist** can help. There's no shame in asking for support.
---

**Markdown rules:**
- Bold: **double asterisks** for headings and important phrases.
- Numbered list: start lines with "1. ", "2. ", etc. (number, period, space).
- Bullet list: start lines with "- " (hyphen, space). Use for sub-points or short lists.
- Blank lines between sections and before/after lists so formatting renders correctly.
- Keep paragraphs short (2–4 sentences). Be concise and easy to scan."""


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
