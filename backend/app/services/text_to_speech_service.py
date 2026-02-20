import os
import logging
import io
import tempfile
import asyncio
import json
import base64
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.utils.storage import get_storage
from app.schemas.text_to_speech import WordTimestamp, VoiceInfo

# Import AWS base service
try:
    from app.services.aws_ai_base import AWSBaseAIService
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

"""
Text-to-Speech Service
======================
Powered by AWS Polly
- High-Quality Speech Synthesis
- Multiple voices and languages
- Real-Time Voice Generation

How It Works:
Step 1: Input Your Text
Step 2: Generate Speech (with instant playback and download)

Practical Applications:
- AI Assistant Voice Enhancement
- Educational Content Narration
- Healthcare Communication Support
- Customer Service Voice Solutions
- Accessibility Aid for Visual Impairments
"""
class TextToSpeechService:
    """
    AWS Polly Powered Text-to-Speech Service with Word Timestamps
    -----------------------------------------------------------
    Features:
    - High-quality speech synthesis
    - Multiple voices and languages
    - Real-time voice generation
    - Word-level timestamps for text highlighting
    - Voice selection and customization
    """
    
    # Voice mapping for compatibility with OpenAI-style names
    VOICE_MAPPING = {
        # OpenAI-style names mapped to AWS Polly voices
        'alloy': 'Matthew',      # Male, neutral American
        'echo': 'Justin',        # Male, young American
        'fable': 'Salli',        # Female, American
        'onyx': 'Joey',          # Male, American
        'nova': 'Joanna',        # Female, American (default)
        'shimmer': 'Ivy',        # Female, American, child-like
        
        # AWS Polly native names (pass through)
        'joanna': 'Joanna',      # Female, American
        'matthew': 'Matthew',    # Male, American
        'ivy': 'Ivy',            # Female, American, child-like
        'justin': 'Justin',      # Male, American, young
        'kendra': 'Kendra',      # Female, American
        'kimberly': 'Kimberly',  # Female, American
        'salli': 'Salli',        # Female, American
        'joey': 'Joey',          # Male, American
        'mizuki': 'Mizuki',      # Female, Japanese
        'chantal': 'Chantal',    # Female, Canadian French
        'celine': 'Celine',      # Female, French
        'lea': 'Lea',            # Female, French
        'mathieu': 'Mathieu',    # Male, French
    }
    
    # Language code mapping for AWS Polly compatibility
    LANGUAGE_CODE_MAPPING = {
        "en": "en-US",
        "es": "es-ES", 
        "fr": "fr-FR",
        "de": "de-DE",
        "it": "it-IT",
        "pt": "pt-PT",
        "ru": "ru-RU",
        "ja": "ja-JP",
        "ko": "ko-KR",
        "zh": "cmn-CN",
        "ar": "arb",
        "hi": "hi-IN",
        "tr": "tr-TR",
        "pl": "pl-PL",
        "nl": "nl-NL",
        "sv": "sv-SE",
        "da": "da-DK",
        "no": "nb-NO",
        "fi": "fi-FI",
        "cs": "cs-CZ",
        "ro": "ro-RO",
        "is": "is-IS",
        "cy": "cy-GB",
        "ca": "ca-ES"
    }
    
    def __init__(self):
        # Initialize AWS AI service
        self.aws_ai_service = None
        if AWS_AVAILABLE and settings.USE_AWS_AI:
            try:
                self.aws_ai_service = AWSBaseAIService()
                if self.aws_ai_service.is_available():
                    logger.info("AWS Polly service initialized successfully")
                else:
                    raise Exception("AWS Polly service not available")
            except Exception as e:
                logger.error(f"Failed to initialize AWS Polly service: {str(e)}")
                raise Exception("AWS Polly service is required but not available")
        else:
            raise Exception("AWS Polly service is required but not configured")

    async def synthesize_speech_with_timestamps(self, text: str, lang: str = "en", pitch: float = 1.0, rate: float = 1.0, voice: str = "alloy") -> Tuple[bytes, List[WordTimestamp], float, str]:
        """
        Generate speech with word-level timestamps for text highlighting
        
        Returns:
            Tuple of (audio_bytes, timestamps, duration, voice_used)
        """
        try:
            logger.info(f"Synthesizing speech with timestamps - Text: {text[:50]}..., Voice: {voice}, Lang: {lang}")
            
            if not text:
                raise Exception("Text input cannot be empty")
                
            # Map voice to AWS Polly voice
            polly_voice = self.VOICE_MAPPING.get(voice.lower(), 'Joanna')
            
            # Get language code for AWS Polly
            language_code = self._normalize_language_code(lang)
            
            # Generate both audio and speech marks (for timestamps) 
            audio_data, speech_marks = await self._aws_polly_synthesize_with_marks(
                text, polly_voice, language_code, pitch, rate
            )
            
            # Parse speech marks to extract word timestamps
            timestamps = self._parse_speech_marks_to_timestamps(speech_marks)
            
            # Calculate total duration from timestamps or estimate
            duration = timestamps[-1].end if timestamps else self._estimate_duration(text, rate)
            
            return audio_data, timestamps, duration, polly_voice
            
        except Exception as e:
            error_str = str(e)
            logger.error(f"Error in synthesize_speech_with_timestamps: {error_str}")
            
            # Provide more helpful error messages
            if "AccessDeniedException" in error_str and "polly:SynthesizeSpeech" in error_str:
                raise Exception("AWS Polly access denied. Please ensure your AWS IAM user has 'polly:SynthesizeSpeech' permission.")
            elif "ValidationException" in error_str and "languageCode" in error_str:
                raise Exception("Invalid language code for AWS Polly. Supported formats: en-US, es-ES, fr-FR, de-DE, etc.")
            elif "InvalidParameterValueException" in error_str:
                raise Exception(f"Invalid parameter for AWS Polly: {error_str}")
            elif "TextLengthExceededException" in error_str:
                raise Exception("Text is too long for AWS Polly. Maximum length is 3000 characters.")
            else:
                raise Exception(f"Text-to-speech service error: {error_str}")

    async def get_available_voices(self, language_code: str = None) -> List[VoiceInfo]:
        """
        Get list of available voices, optionally filtered by language
        """
        try:
            if not self.aws_ai_service or not self.aws_ai_service.polly_client:
                raise Exception("AWS Polly client not available")
                
            # Get voices from AWS Polly
            polly_voices = await self._get_polly_voices(language_code)
            
            # Convert to our VoiceInfo format and include mapped names
            voices = []
            
            # Add mapped voices (OpenAI-style names)
            for mapped_name, polly_name in self.VOICE_MAPPING.items():
                polly_voice = next((v for v in polly_voices if v['Id'] == polly_name), None)
                if polly_voice:
                    voices.append(VoiceInfo(
                        id=mapped_name,
                        name=f"{mapped_name.title()} ({polly_name})",
                        language=polly_voice.get('LanguageCode', 'en-US'),
                        gender=polly_voice.get('Gender', 'Unknown'),
                        engine=polly_voice.get('SupportedEngines', ['standard'])[0],
                        description=f"Compatible with {mapped_name} - AWS Polly {polly_name} voice"
                    ))
            
            # Add native AWS Polly voices not in mapping
            for polly_voice in polly_voices:
                if polly_voice['Id'] not in self.VOICE_MAPPING.values():
                    voices.append(VoiceInfo(
                        id=polly_voice['Id'].lower(),
                        name=polly_voice['Id'],
                        language=polly_voice.get('LanguageCode', 'en-US'),
                        gender=polly_voice.get('Gender', 'Unknown'),
                        engine=polly_voice.get('SupportedEngines', ['standard'])[0],
                        description=f"AWS Polly native voice"
                    ))
            
            return voices
            
        except Exception as e:
            logger.error(f"Error getting available voices: {str(e)}")
            raise Exception(f"Failed to get available voices: {str(e)}")

    async def _get_polly_voices(self, language_code: str = None) -> List[Dict]:
        """Get voices from AWS Polly"""
        try:
            polly_client = self.aws_ai_service.polly_client
            
            params = {}
            if language_code:
                params['LanguageCode'] = self._normalize_language_code(language_code)
                
            response = polly_client.describe_voices(**params)
            return response.get('Voices', [])
            
        except Exception as e:
            logger.error(f"Error getting Polly voices: {str(e)}")
            raise

    async def _aws_polly_synthesize_with_marks(self, text: str, voice_id: str, language_code: str, pitch: float = 1.0, rate: float = 1.0) -> Tuple[bytes, List[Dict]]:
        """
        Synthesize speech and get speech marks for timestamps using AWS Polly
        """
        try:
            polly_client = self.aws_ai_service.polly_client
            
            # Validate inputs
            if not text or not text.strip():
                raise ValueError("Text cannot be empty")
            
            if len(text) > 3000:
                raise ValueError("Text too long for AWS Polly (max 3000 characters)")
            
            # Validate rate and pitch values
            if not (0.2 <= rate <= 3.0):
                raise ValueError("Rate must be between 0.2 and 3.0")
            
            if not (0.5 <= pitch <= 2.0):
                raise ValueError("Pitch must be between 0.5 and 2.0")
            
            # Create SSML with prosody controls
            ssml_text = self._create_ssml_with_prosody(text, pitch, rate)
            logger.info(f"Generated SSML: {ssml_text[:100]}...")
            
            # Validate SSML format
            if not ssml_text.startswith('<speak>') or not ssml_text.endswith('</speak>'):
                raise ValueError("Invalid SSML format generated")
            
            # First, get the audio
            audio_response = polly_client.synthesize_speech(
                Text=ssml_text,
                TextType='ssml',
                VoiceId=voice_id,
                LanguageCode=language_code,
                OutputFormat='mp3'
            )
            audio_data = audio_response['AudioStream'].read()
            
            # Then, get speech marks for word timestamps
            marks_response = polly_client.synthesize_speech(
                Text=ssml_text,
                TextType='ssml',
                VoiceId=voice_id,
                LanguageCode=language_code,
                OutputFormat='json',
                SpeechMarkTypes=['word']
            )
            
            # Parse speech marks
            speech_marks_data = marks_response['AudioStream'].read().decode('utf-8')
            speech_marks = []
            
            for line in speech_marks_data.strip().split('\n'):
                if line.strip():
                    try:
                        mark = json.loads(line)
                        speech_marks.append(mark)
                    except json.JSONDecodeError:
                        continue
            
            logger.info(f"Successfully synthesized speech with {len(speech_marks)} word marks")
            return audio_data, speech_marks
            
        except Exception as e:
            error_str = str(e)
            logger.error(f"Error in AWS Polly synthesis with marks: {error_str}")
            
            # Handle specific SSML errors
            if "InvalidSsmlException" in error_str:
                # Try without SSML if SSML fails
                logger.warning("SSML failed, trying plain text")
                try:
                    # Fallback to plain text
                    audio_response = polly_client.synthesize_speech(
                        Text=text,
                        TextType='text',
                        VoiceId=voice_id,
                        LanguageCode=language_code,
                        OutputFormat='mp3'
                    )
                    audio_data = audio_response['AudioStream'].read()
                    
                    # Get speech marks with plain text
                    marks_response = polly_client.synthesize_speech(
                        Text=text,
                        TextType='text',
                        VoiceId=voice_id,
                        LanguageCode=language_code,
                        OutputFormat='json',
                        SpeechMarkTypes=['word']
                    )
                    
                    speech_marks_data = marks_response['AudioStream'].read().decode('utf-8')
                    speech_marks = []
                    
                    for line in speech_marks_data.strip().split('\n'):
                        if line.strip():
                            try:
                                mark = json.loads(line)
                                speech_marks.append(mark)
                            except json.JSONDecodeError:
                                continue
                    
                    logger.info(f"Fallback successful: synthesized speech with {len(speech_marks)} word marks")
                    return audio_data, speech_marks
                    
                except Exception as fallback_error:
                    logger.error(f"Fallback also failed: {str(fallback_error)}")
                    raise Exception(f"SSML synthesis failed and fallback failed: {str(fallback_error)}")
            
            raise

    def _create_ssml_with_prosody(self, text: str, pitch: float = 1.0, rate: float = 1.0) -> str:
        """
        Create SSML with prosody controls for pitch and rate
        """
        # Escape any XML special characters in the text
        import html
        escaped_text = html.escape(text)
        
        # Convert rate to percentage (AWS Polly format)
        rate_percent = f"{int(rate * 100)}%"
        
        # Convert pitch to semitones or percentage with proper bounds
        if pitch == 1.0:
            pitch_value = "+0%"
        elif pitch > 1.0:
            # Higher pitch - limit to reasonable range
            pitch_change = min((pitch - 1.0) * 50, 50)  # Max +50%
            pitch_value = f"+{int(pitch_change)}%"
        else:
            # Lower pitch - limit to reasonable range
            pitch_change = min((1.0 - pitch) * 50, 33)  # Max -33%
            pitch_value = f"-{int(pitch_change)}%"
        
        # Create clean SSML without extra whitespace
        ssml = f'<speak><prosody rate="{rate_percent}" pitch="{pitch_value}">{escaped_text}</prosody></speak>'
        
        return ssml

    def _parse_speech_marks_to_timestamps(self, speech_marks: List[Dict]) -> List[WordTimestamp]:
        """
        Parse AWS Polly speech marks into WordTimestamp objects
        """
        timestamps = []
        
        for i, mark in enumerate(speech_marks):
            if mark.get('type') == 'word':
                word = mark.get('value', '')
                start_time = mark.get('time', 0) / 1000.0  # Convert ms to seconds
                
                # Calculate end time (estimate based on next word or duration)
                if i + 1 < len(speech_marks):
                    end_time = speech_marks[i + 1].get('time', mark.get('time', 0)) / 1000.0
                else:
                    # Last word - estimate duration based on word length
                    word_duration = max(0.3, len(word) * 0.1)  # Minimum 0.3s, or 0.1s per character
                    end_time = start_time + word_duration
                
                timestamps.append(WordTimestamp(
                    word=word,
                    start=round(start_time, 2),
                    end=round(end_time, 2)
                ))
        
        return timestamps

    def _estimate_duration(self, text: str, rate: float = 1.0) -> float:
        """
        Estimate audio duration based on text length and rate
        """
        # Average speaking rate: ~150 words per minute
        words = len(text.split())
        base_duration = (words / 150.0) * 60.0  # Convert to seconds
        adjusted_duration = base_duration / rate  # Adjust for speech rate
        return round(adjusted_duration, 2)

    async def synthesize_speech(self, text: str, lang: str = "en", slow: bool = False, speed: float = 1.0, pitch: float = 1.0, volume: float = 1.0, emotion: str = None, voice_id: str = None):
        """
        Legacy method for backward compatibility
        Step 1: Input Your Text
        Step 2: Generate Speech
        - Returns: Audio bytes (MP3)
        """
        try:
            logger.info(f"Attempting to synthesize speech for text: {text}")
            if not text:
                raise Exception("Text input cannot be empty")
            
            # Use new method but only return audio
            audio_data, _, _, _ = await self.synthesize_speech_with_timestamps(
                text=text,
                lang=lang,
                pitch=pitch,
                rate=speed,
                voice=voice_id or "alloy"
            )
            return audio_data
                
        except Exception as e:
            error_str = str(e)
            logger.error(f"Error in synthesize_speech: {error_str}")
            
            # Provide more helpful error messages for common AWS issues
            if "AccessDeniedException" in error_str and "polly:SynthesizeSpeech" in error_str:
                raise Exception("AWS Polly access denied. Please ensure your AWS IAM user has 'polly:SynthesizeSpeech' permission. Add the AmazonPollyReadOnlyAccess policy to your IAM user.")
            elif "ValidationException" in error_str and "languageCode" in error_str:
                raise Exception("Invalid language code for AWS Polly. Supported formats: en-US, es-ES, fr-FR, de-DE, etc.")
            elif "InvalidParameterValueException" in error_str:
                raise Exception(f"Invalid parameter for AWS Polly: {error_str}")
            elif "TextLengthExceededException" in error_str:
                raise Exception("Text is too long for AWS Polly. Maximum length is 3000 characters.")
            else:
                raise Exception(f"Text-to-speech service error: {error_str}")

    def _normalize_language_code(self, lang_code: str) -> str:
        if not lang_code:
            return settings.AWS_POLLY_LANGUAGE_CODE
        
        # If already in correct format (e.g., en-US), return as is
        if "-" in lang_code and lang_code in [
            "en-IE", "ar-AE", "en-US", "fr-BE", "en-IN", "es-MX", "en-ZA", "tr-TR", 
            "ru-RU", "ro-RO", "pt-PT", "pl-PL", "nl-NL", "it-IT", "is-IS", "fr-FR", 
            "fi-FI", "es-ES", "de-DE", "yue-CN", "ko-KR", "en-NZ", "en-GB-WLS", 
            "hi-IN", "de-CH", "arb", "nl-BE", "cy-GB", "cs-CZ", "cmn-CN", "da-DK", 
            "en-AU", "pt-BR", "nb-NO", "sv-SE", "ja-JP", "es-US", "ca-ES", "fr-CA", 
            "en-GB", "de-AT"
        ]:
            return lang_code
        
        # Map short codes to full AWS Polly language codes
        return self.LANGUAGE_CODE_MAPPING.get(lang_code.lower(), "en-US")

    async def _aws_polly_synthesize(self, text: str, voice_id: str = None, language_code: str = None) -> bytes:
        """
        High-Quality Speech Synthesis with AWS Polly:
        - Multiple voice options
        - High-quality audio output
        - Support for multiple languages
        """
        try:
            # Normalize the language code for AWS Polly
            normalized_lang_code = self._normalize_language_code(language_code)
            logger.info(f"Normalized language code from '{language_code}' to '{normalized_lang_code}'")
            
            return self.aws_ai_service.synthesize_speech_with_polly(text, voice_id, normalized_lang_code)
        except Exception as e:
            logger.error(f"Error in AWS Polly synthesis: {str(e)}")
            raise

    def save_user_voice_sample(self, user_id: int, file_path: str) -> str:
        """
        Not supported: Custom voice creation/voice cloning is not available in AWS Polly.
        """
        raise NotImplementedError("Custom voice creation is not supported in AWS Polly.")
