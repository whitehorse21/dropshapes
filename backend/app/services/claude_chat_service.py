import logging
from typing import List, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)


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

    def chat(self, messages: List[Dict[str, str]], max_tokens: int = 2048) -> str:
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
                messages=formatted,
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
