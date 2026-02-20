import os
import hashlib
import logging
import re
from typing import List, Dict, Any
from app.core.config import settings
from app.utils.cache import cache, CacheKeys
from app.schemas.grammar_check import GrammarCorrection

logger = logging.getLogger(__name__)

# Import AWS base service
try:
    from app.services.aws_ai_base import AWSBaseAIService
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False

class GrammarCheckService:
    def __init__(self):
        # Initialize AWS AI service
        self.aws_ai_service = None
        if AWS_AVAILABLE and settings.USE_AWS_AI:
            try:
                self.aws_ai_service = AWSBaseAIService()
                if self.aws_ai_service.is_available():
                    print("AWS Comprehend service initialized successfully")
                else:
                    raise Exception("AWS Comprehend service not available")
            except Exception as e:
                print(f"Failed to initialize AWS Comprehend service: {str(e)}")
                raise Exception("AWS Comprehend service is required but not available")
        else:
            raise Exception("AWS Comprehend service is required but not configured")

    def _generate_text_hash(self, text: str) -> str:
        """Generate a hash for the text to use as cache key"""
        return hashlib.md5(text.encode()).hexdigest()
    
    def _get_cached_grammar_check(self, text_hash: str) -> dict:
        """Get cached grammar check result"""
        cache_key = f"{CacheKeys.GRAMMAR_CHECK}:{text_hash}"
        return cache.get(cache_key)
    
    def _cache_grammar_check(self, text_hash: str, result: dict) -> bool:
        """Cache grammar check result"""
        cache_key = f"{CacheKeys.GRAMMAR_CHECK}:{text_hash}"
        return cache.set(cache_key, result, settings.CACHE_DEFAULT_TTL)

    def check_grammar(self, text: str, language: str = "en", context: dict = None) -> Dict[str, Any]:
        """Check grammar using AWS Bedrock with detailed corrections and caching"""
        # Generate hash for the text with context
        text_hash = self._generate_text_hash(f"{text}:{language}:{str(context)}")
        
        # Try to get from cache first
        cached_result = self._get_cached_grammar_check(text_hash)
        if cached_result is not None:
            logger.info(f"Cache hit for grammar check text hash: {text_hash}")
            return cached_result
        
        try:
            result = self._check_grammar_with_aws(text, language, context or {})
            
            # Cache the result
            self._cache_grammar_check(text_hash, result)
            logger.info(f"Cache miss for grammar check text hash: {text_hash}, stored result")
            
            return result
        except Exception as e:
            logger.error(f"Grammar check error: {str(e)}")
            raise Exception(f"Grammar check error: {str(e)}")

    def _check_grammar_with_aws(self, text: str, language: str = "en", context: dict = None) -> Dict[str, Any]:
        """Check grammar using AWS Bedrock with detailed corrections analysis"""
        try:
            max_suggestions = context.get('maxSuggestions', 5) if context else 5
            check_spelling = context.get('checkSpelling', True) if context else True
            check_grammar = context.get('checkGrammar', True) if context else True
            
            # Create a detailed prompt for grammar and spelling analysis
            check_types = []
            if check_grammar:
                check_types.append("grammar")
            if check_spelling:
                check_types.append("spelling")
            
            prompt = f"""
            Analyze the following text for {' and '.join(check_types)} errors. Return a detailed JSON response with the following structure:

            {{
                "corrections": [
                    {{
                        "start": <character_position_start>,
                        "end": <character_position_end>,
                        "error": "<original_error_text>",
                        "suggestion": "<corrected_text>",
                        "type": "<error_type: spelling, grammar, punctuation, or style>",
                        "description": "<description_of_error>",
                        "confidence": <confidence_score_0_to_1>
                    }}
                ],
                "correctedText": "<fully_corrected_text>",
                "summary": {{
                    "totalErrors": <number>,
                    "spellingErrors": <number>,
                    "grammarErrors": <number>,
                    "punctuationErrors": <number>,
                    "styleErrors": <number>
                }}
            }}

            Text to analyze (language: {language}):
            "{text}"

            Important: 
            - Provide exact character positions (start/end) for each error
            - Limit to maximum {max_suggestions} corrections
            - Only return valid JSON format
            - Include confidence scores between 0 and 1
            - Be precise with error categorization
            """
            
            response = self.aws_ai_service.generate_text_with_bedrock(
                prompt, 
                max_tokens=2000, 
                temperature=0.1
            )
            
            # Parse the AI response
            try:
                import json
                # Try to extract JSON from the response
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    ai_result = json.loads(json_str)
                else:
                    raise ValueError("No valid JSON found in response")
                
                # Validate and process the response
                corrections = []
                if 'corrections' in ai_result and isinstance(ai_result['corrections'], list):
                    for correction in ai_result['corrections'][:max_suggestions]:
                        if self._validate_correction(correction, text):
                            corrections.append(correction)
                
                result = {
                    "corrections": corrections,
                    "originalText": text,
                    "correctedText": ai_result.get('correctedText', text),
                    "language": language,
                    "summary": ai_result.get('summary', {
                        "totalErrors": len(corrections),
                        "spellingErrors": len([c for c in corrections if c.get('type') == 'spelling']),
                        "grammarErrors": len([c for c in corrections if c.get('type') == 'grammar']),
                        "punctuationErrors": len([c for c in corrections if c.get('type') == 'punctuation']),
                        "styleErrors": len([c for c in corrections if c.get('type') == 'style'])
                    })
                }
                
                return result
                
            except (json.JSONDecodeError, ValueError) as parse_error:
                logger.warning(f"Failed to parse AI response as JSON: {parse_error}")
                # Fallback to simple correction if JSON parsing fails
                return self._create_simple_correction_response(text, response, language)
                
        except Exception as e:
            logger.error(f"AWS grammar check error: {str(e)}")
            raise Exception(f"AWS grammar check error: {str(e)}")

    def _validate_correction(self, correction: dict, original_text: str) -> bool:
        """Validate that a correction has required fields and valid positions"""
        required_fields = ['start', 'end', 'error', 'suggestion', 'type', 'description']
        
        # Check all required fields exist
        if not all(field in correction for field in required_fields):
            return False
        
        # Validate positions
        start = correction.get('start')
        end = correction.get('end')
        
        if not isinstance(start, int) or not isinstance(end, int):
            return False
            
        if start < 0 or end > len(original_text) or start >= end:
            return False
            
        # Validate that the error text matches the original text at the specified position
        try:
            actual_text = original_text[start:end]
            expected_error = correction.get('error', '')
            
            # Allow for minor whitespace differences
            if actual_text.strip() != expected_error.strip():
                # Try to find the error text nearby
                window_start = max(0, start - 10)
                window_end = min(len(original_text), end + 10)
                window_text = original_text[window_start:window_end]
                
                if expected_error not in window_text:
                    return False
        except Exception:
            return False
            
        return True

    def _create_simple_correction_response(self, original_text: str, corrected_response: str, language: str) -> Dict[str, Any]:
        """Create a simple response when detailed parsing fails"""
        return {
            "corrections": [],
            "originalText": original_text,
            "correctedText": corrected_response.strip(),
            "language": language,
            "summary": {
                "totalErrors": 0,
                "spellingErrors": 0,
                "grammarErrors": 0,
                "punctuationErrors": 0,
                "styleErrors": 0
            }
        }


