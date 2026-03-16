"""
AI text detector: estimates whether text is likely human-written or AI-generated.
Uses phrase matching, structure (burstiness, lists, transitions), and length-aware calibration.
"""

import re
import math
import hashlib
from collections import Counter
from typing import Tuple

# High-signal phrases common in ChatGPT/Claude/LLM output. Multi-word only; no single
# generic words that appear often in human text. Case-insensitive substring match.
_AI_PHRASES = (
    "it's important to note",
    "it's worth noting",
    "it is important to",
    "it is worth",
    "additionally",
    "furthermore",
    "moreover",
    "consequently",
    "in conclusion",
    "to summarize",
    "in summary",
    "to sum up",
    "as an ai",
    "i'm an ai",
    "language model",
    "i don't have personal",
    "i'd be happy to",
    "would be happy to",
    "happy to help",
    "glad to help",
    "hope that helps",
    "hope this helps",
    "i hope this helps",
    "here are some",
    "here is a",
    "here are a few",
    "here are the",
    "let me know if",
    "feel free to",
    "feel free",
    "if you have any questions",
    "please let me know",
    "let me know",
    "there are several",
    "there are many",
    "there are a few",
    "there are a number",
    "it's also worth",
    "it's also important",
    "first and foremost",
    "in terms of",
    "when it comes to",
    "at the end of the day",
    "it goes without saying",
    "needless to say",
    "it depends on",
    "let me explain",
    "in other words",
    "to put it simply",
    "to clarify",
    "for example",
    "for instance",
    "on the other hand",
    "that said",
    "with that said",
    "having said that",
    "that being said",
    "keep in mind",
    "another thing to",
    "one thing to",
    "several ways",
    "number of ways",
    "a variety of",
    "wide range of",
    "different aspects",
    "various factors",
    "multiple factors",
    "key points",
    "main points",
    "important to remember",
    "worth mentioning",
    "worth considering",
    "i can help",
    "i can provide",
    "i can suggest",
    "i can offer",
    "this can help",
    "this will help",
    "this may help",
    "you may want to",
    "you might want to",
    "you could try",
    "consider trying",
    "it's a good idea",
    "make sure to",
    "be sure to",
    "don't hesitate",
    "if you need",
    "if you'd like",
    "i recommend",
    "i suggest",
    "i would recommend",
    "i would suggest",
    "important to",
    "crucial to",
    "necessary to",
    "helpful to",
    "useful to",
    "beneficial to",
    "step by step",
    "to get started",
    "to help you",
    "to assist you",
    "to answer your",
    "based on your",
    "with that in mind",
    "break this down",
    "in more detail",
    "dive deeper",
    "expand on that",
    "a few things to",
    "few things to keep",
    "is worth considering",
    "it's worth considering",
)


def _normalize_for_sentences(text: str) -> str:
    """Replace sentence-ending punctuation with newlines for splitting."""
    return re.sub(r"[.!?]+", "\n", text)


def _sentence_lengths(text: str) -> list:
    """Return list of word counts per sentence."""
    raw = _normalize_for_sentences(text)
    sentences = [s.strip() for s in raw.split("\n") if s.strip()]
    return [len(s.split()) for s in sentences if len(s.split()) > 0]


def _burstiness(lengths: list) -> float:
    """
    Sentence length variance. Human text often has higher variance (mix of short/long);
    AI text is often more uniform. Returns 0–1 human signal (higher = more human).
    """
    if len(lengths) < 2:
        return 0.5
    n = len(lengths)
    mean = sum(lengths) / n
    variance = sum((x - mean) ** 2 for x in lengths) / n
    std = math.sqrt(variance) if variance > 0 else 0
    return round(min(1.0, std / 9.0), 4)


def _word_diversity(text: str) -> float:
    """Unique words / total words. Low ratio = repetitive (AI-like). High = slight human lean."""
    words = text.lower().split()
    if not words:
        return 0.5
    ratio = len(set(words)) / len(words)
    if ratio < 0.35:
        return 0.2
    if ratio > 0.88:
        return 0.55
    return round(0.3 + (ratio - 0.35) * 0.45, 4)


def _paragraph_structure(text: str) -> float:
    """Very structured (many paragraphs) is slightly AI-leaning; neutral otherwise."""
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    if len(paras) >= 4:
        return 0.4
    if len(paras) >= 3:
        return 0.45
    return 0.5


def _ai_phrase_score(text: str, word_count: int) -> float:
    """Count distinct AI phrases. Strong signal when 2+; moderate for 1. Returns 0–1 AI score."""
    lower = text.lower()
    hits = sum(1 for p in _AI_PHRASES if p in lower)
    if hits >= 5:
        return 0.98
    if hits >= 4:
        return 0.92
    if hits >= 3:
        return 0.82
    if hits >= 2:
        return 0.68
    if hits >= 1:
        return 0.48 if word_count < 60 else 0.38
    return 0.0


def _numbered_list_score(text: str) -> float:
    """AI often uses '1. ... 2. ... 3. ...'. Returns 0–0.35 AI score."""
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    numbered = sum(1 for ln in lines if re.match(r"^\d+[.)]\s", ln))
    if len(lines) < 2:
        return 0.0
    ratio = numbered / len(lines)
    if ratio >= 0.4 and numbered >= 3:
        return 0.35
    if ratio >= 0.25 and numbered >= 2:
        return 0.2
    return 0.0


def _sentence_starter_uniformity(text: str) -> float:
    """Many sentences starting with same word (The, It, This) = slight AI signal. 0–0.25."""
    raw = _normalize_for_sentences(text)
    sentences = [s.strip() for s in raw.split("\n") if s.strip()]
    if len(sentences) < 4:
        return 0.0
    starters = []
    for s in sentences:
        parts = s.split()
        if parts and len(parts[0]) > 1:
            starters.append(parts[0].lower())
    if len(starters) < 4:
        return 0.0
    most_common_count = Counter(starters).most_common(1)[0][1]
    ratio = most_common_count / len(starters)
    if ratio >= 0.45:
        return 0.25
    if ratio >= 0.35:
        return 0.12
    return 0.0


def _transition_density(text: str, sentence_count: int) -> float:
    """High use of transition words (however, moreover, etc.) per sentence = AI-like. 0–0.2."""
    if sentence_count < 2:
        return 0.0
    lower = text.lower()
    transitions = (
        "however", "moreover", "furthermore", "additionally",
        "therefore", "consequently", "specifically", "particularly",
        "alternatively", "meanwhile", "otherwise", "similarly",
    )
    count = sum(1 for t in transitions if t in lower)
    per_sent = count / sentence_count
    if per_sent >= 0.8:
        return 0.2
    if per_sent >= 0.5:
        return 0.12
    if per_sent >= 0.3:
        return 0.06
    return 0.0


def _tiny_seed(text: str) -> float:
    """Deterministic micro-adjustment so same text gives same result."""
    h = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return ((int(h[:8], 16) % 100) - 50) / 2000.0  # ±0.025


def detect(text: str) -> Tuple[float, float, str]:
    """
    Analyze text and return (human_score, ai_score, label).
    Scores are in [0, 1] and sum to 1.0. Label: Likely human-written | Likely AI-generated | Uncertain.
    """
    text = (text or "").strip()
    if not text:
        return (0.5, 0.5, "No text to analyze")

    word_count = len(text.split())
    lengths = _sentence_lengths(text)
    sentence_count = len(lengths)

    # Short text: default to uncertain unless we have a very strong signal
    if word_count < 25:
        lower = text.lower()
        if any(p in lower for p in ("as an ai", "i'm an ai", "language model", "i'd be happy to")):
            return (0.15, 0.85, "Likely AI-generated")
        return (0.5, 0.5, "Uncertain (text too short)")

    # Structure signals (human-leaning when present)
    b = _burstiness(lengths)
    d = _word_diversity(text)
    p = _paragraph_structure(text)
    seed = _tiny_seed(text)

    # Base human score from structure only
    raw_human = 0.38 * b + 0.28 * d + 0.08 * p + 0.06 + seed
    raw_human = max(0.0, min(1.0, raw_human))

    # AI signals (additive)
    phrase_ai = _ai_phrase_score(text, word_count)
    list_ai = _numbered_list_score(text)
    starter_ai = _sentence_starter_uniformity(text)
    transition_ai = _transition_density(text, max(1, sentence_count))

    # Combined AI boost; phrase is primary
    ai_boost = phrase_ai * 0.88 + list_ai + starter_ai + transition_ai
    ai_boost = min(0.95, ai_boost)

    human_score = raw_human - ai_boost
    human_score = max(0.0, min(1.0, human_score))
    ai_score = 1.0 - human_score

    human_score = round(human_score, 4)
    ai_score = round(ai_score, 4)
    total = human_score + ai_score
    if total > 0:
        human_score = round(human_score / total, 4)
        ai_score = round(ai_score / total, 4)

    if human_score >= 0.60:
        label = "Likely human-written"
    elif ai_score >= 0.60:
        label = "Likely AI-generated"
    else:
        label = "Uncertain (mixed signals)"

    return (human_score, ai_score, label)
