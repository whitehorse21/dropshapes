from pydantic import BaseModel, Field, validator
from typing import List, Optional, Union
import base64


class WordTimestamp(BaseModel):
    """Word timestamp information for text highlighting"""
    word: str = Field(..., description="The spoken word")
    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")


class TextToSpeechRequest(BaseModel):
    """Request model for enhanced text-to-speech with voice selection and timing"""
    text: str = Field(..., min_length=1, max_length=3000, description="Text to convert to speech")
    lang: str = Field(default="en", description="Language code (e.g., en, es, fr, de)")
    pitch: float = Field(default=1.0, ge=0.5, le=2.0, description="Pitch modifier (0.5-2.0, 1.0 = normal)")
    rate: float = Field(default=1.0, ge=0.2, le=3.0, description="Speech rate modifier (0.2-3.0, 1.0 = normal)")
    voice: str = Field(default="alloy", description="Voice identifier")
    
    @validator('text')
    def validate_text(cls, v):
        """Validate and clean text input"""
        if not v or not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        
        # Remove or replace problematic characters that might cause SSML issues
        cleaned_text = v.strip()
        
        # Check for length after cleaning
        if len(cleaned_text) > 3000:
            raise ValueError('Text is too long (max 3000 characters)')
            
        return cleaned_text
    
    @validator('lang')
    def validate_language(cls, v):
        """Validate language code"""
        supported_langs = {
            'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi', 'cs', 'ro', 'is', 'cy', 'ca'
        }
        if v not in supported_langs:
            raise ValueError(f'Unsupported language: {v}. Supported languages: {", ".join(sorted(supported_langs))}')
        return v
    
    @validator('pitch')
    def validate_pitch(cls, v):
        """Validate pitch is within AWS Polly acceptable range"""
        if not (0.5 <= v <= 2.0):
            raise ValueError('Pitch must be between 0.5 and 2.0')
        return v
        
    @validator('rate')
    def validate_rate(cls, v):
        """Validate rate is within AWS Polly acceptable range"""
        if not (0.2 <= v <= 3.0):
            raise ValueError('Rate must be between 0.2 and 3.0')
        return v
    
    @validator('voice')
    def validate_voice(cls, v):
        """Validate voice identifier"""
        # List of supported voices - we'll map these to AWS Polly voices
        supported_voices = {
            'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer',  # OpenAI-style names for compatibility
            'joanna', 'matthew', 'ivy', 'justin', 'kendra', 'kimberly', 'salli', 'joey', 'mizuki', 'chantal', 'celine', 'lea', 'mathieu'  # AWS Polly native names
        }
        if v.lower() not in [voice.lower() for voice in supported_voices]:
            raise ValueError(f'Unsupported voice: {v}. Supported voices: {", ".join(sorted(supported_voices))}')
        return v.lower()


class TextToSpeechResponse(BaseModel):
    """Response model for text-to-speech with timestamps"""
    audio: str = Field(..., description="Base64 encoded audio data")
    timestamps: List[WordTimestamp] = Field(..., description="Word timing information for highlighting")
    duration: float = Field(..., description="Total audio duration in seconds")
    voice_used: str = Field(..., description="Voice that was actually used")
    language: str = Field(..., description="Language code used")


class AvailableVoicesResponse(BaseModel):
    """Response model for available voices"""
    voices: List[dict] = Field(..., description="List of available voices with their properties")


class VoiceInfo(BaseModel):
    """Information about a specific voice"""
    id: str = Field(..., description="Voice identifier")
    name: str = Field(..., description="Human-readable voice name")
    language: str = Field(..., description="Language code")
    gender: str = Field(..., description="Voice gender (Male/Female)")
    engine: str = Field(..., description="Speech engine (standard/neural)")
    description: Optional[str] = Field(None, description="Voice description")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    details: Optional[str] = Field(None, description="Additional error details")
