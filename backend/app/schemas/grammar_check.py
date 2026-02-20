from pydantic import BaseModel, Field, validator
from typing import List, Optional


class GrammarCheckContext(BaseModel):
    """Context settings for grammar check request"""
    maxSuggestions: int = Field(default=5, ge=1, le=20, description="Maximum number of suggestions to return")
    checkSpelling: bool = Field(default=True, description="Whether to check spelling")
    checkGrammar: bool = Field(default=True, description="Whether to check grammar")
    highlightOffsets: bool = Field(default=True, description="Whether to include character offsets")


class GrammarCheckRequest(BaseModel):
    """Request model for grammar check"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to check for grammar and spelling errors")
    language: str = Field(default="en", description="Language code (e.g., en, es, fr, de)")
    context: GrammarCheckContext = Field(default_factory=GrammarCheckContext, description="Check context and settings")
    
    @validator('text')
    def validate_text(cls, v):
        """Validate and clean text input"""
        if not v or not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        
        cleaned_text = v.strip()
        
        if len(cleaned_text) > 5000:
            raise ValueError('Text is too long (max 5000 characters)')
            
        return cleaned_text
    
    @validator('language')
    def validate_language(cls, v):
        """Validate language code"""
        supported_langs = {
            'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs', 'ro'
        }
        if v not in supported_langs:
            raise ValueError(f'Unsupported language: {v}. Supported languages: {", ".join(sorted(supported_langs))}')
        return v


class GrammarCorrection(BaseModel):
    """Individual grammar/spelling correction"""
    start: int = Field(..., description="Start character position of the error")
    end: int = Field(..., description="End character position of the error")
    error: str = Field(..., description="The original error text")
    suggestion: str = Field(..., description="Suggested correction")
    type: str = Field(..., description="Type of error (spelling, grammar, punctuation, style)")
    description: str = Field(..., description="Human-readable description of the error")
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Confidence score for the correction")


class GrammarCheckResponse(BaseModel):
    """Response model for grammar check"""
    corrections: List[GrammarCorrection] = Field(..., description="List of detected errors and suggestions")
    originalText: str = Field(..., description="Original input text")
    correctedText: Optional[str] = Field(default=None, description="Fully corrected text")
    language: str = Field(..., description="Language code used for checking")
    summary: Optional[dict] = Field(default=None, description="Summary statistics of corrections")


class GrammarCheckError(BaseModel):
    """Error response model for grammar check"""
    error: str = Field(..., description="Error message")
    details: Optional[str] = Field(None, description="Additional error details")
    code: Optional[str] = Field(None, description="Error code")
