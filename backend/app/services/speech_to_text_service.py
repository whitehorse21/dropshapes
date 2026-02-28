import logging
import tempfile
import os
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

_whisper_model = None


def _get_whisper_model():
    """Lazy-load faster-whisper model (shared across requests)."""
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
        except ImportError:
            raise ImportError(
                "faster-whisper is required for voice input. Install with: pip install faster-whisper"
            )
        model_size = getattr(settings, "WHISPER_MODEL_SIZE", "base") or "base"
        logger.info("Loading faster-whisper model: %s", model_size)
        _whisper_model = WhisperModel(model_size, device="cpu", compute_type="int8")
    return _whisper_model


def transcribe_audio(audio_bytes: bytes, filename: Optional[str] = None) -> str:
    """
    Transcribe audio to text using faster-whisper (local, no API key).
    Accepts common formats (webm, mp3, wav, etc.) via temp file.
    Returns transcribed text.
    """
    if not audio_bytes:
        return ""

    suffix = ".webm"
    if filename and "." in filename:
        suffix = "." + filename.rsplit(".", 1)[-1].lower()
    if suffix not in (".webm", ".mp3", ".wav", ".ogg", ".m4a", ".flac"):
        suffix = ".webm"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        try:
            tmp.write(audio_bytes)
            tmp.flush()
            path = tmp.name
            model = _get_whisper_model()
            segments, info = model.transcribe(path, language=None, beam_size=1)
            parts = [s.text for s in segments if s.text]
            return " ".join(parts).strip() if parts else ""
        finally:
            try:
                os.unlink(path)
            except OSError:
                pass
