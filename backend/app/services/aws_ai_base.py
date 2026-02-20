import boto3
import json
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class AWSBaseAIService:
    """
    Base AWS AI Service Class
    Provides common functionality for AWS AI services including Bedrock, Polly, Comprehend, etc.
    """
    
    def __init__(self):
        self.aws_access_key_id = settings.AWS_ACCESS_KEY_ID
        self.aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY
        self.region = settings.AWS_BEDROCK_REGION
        
        # Initialize AWS clients
        self.bedrock_client = None
        self.polly_client = None
        self.comprehend_client = None
        self.transcribe_client = None
        
        if self.aws_access_key_id and self.aws_secret_access_key:
            self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize AWS service clients"""
        try:
            # Bedrock client for text generation
            self.bedrock_client = boto3.client(
                'bedrock-runtime',
                region_name=self.region,
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key
            )
            
            # Polly client for text-to-speech
            self.polly_client = boto3.client(
                'polly',
                region_name=settings.AWS_BEDROCK_REGION,
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key
            )
            
            # Comprehend client for NLP tasks
            self.comprehend_client = boto3.client(
                'comprehend',
                region_name=settings.AWS_COMPREHEND_REGION,
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key
            )
            
            # Transcribe client for speech-to-text
            self.transcribe_client = boto3.client(
                'transcribe',
                region_name=settings.AWS_TRANSCRIBE_REGION,
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key
            )
            
            logger.info("AWS AI service clients initialized successfully")
            
            # Test Bedrock availability and log working models
            self._test_bedrock_models()
            
        except Exception as e:
            logger.error(f"Failed to initialize AWS AI service clients: {str(e)}")
            raise
    
    def _test_bedrock_models(self):
        """Test which Bedrock models are available"""
        if not self.bedrock_client:
            return
            
        test_models = [
            "us.amazon.nova-lite-v1:0",  # Nova Lite inference profile (confirmed working)
            "us.amazon.nova-micro-v1:0", # Nova Micro inference profile (confirmed working)
            "us.amazon.nova-pro-v1:0",   # Nova Pro inference profile (confirmed working)
            settings.AWS_BEDROCK_MODEL_ID
        ]
        
        available_models = []
        
        for model_id in test_models:
            try:
                # Simple test prompt
                test_prompt = "Hello"
                
                # All our models are Nova models that use converse API
                if "amazon.nova" in model_id or "us.amazon.nova" in model_id:
                    try:
                        response = self.bedrock_client.converse(
                            modelId=model_id,
                            messages=[
                                {
                                    "role": "user",
                                    "content": [{"text": test_prompt}]
                                }
                            ],
                            inferenceConfig={
                                "maxTokens": 10,
                                "temperature": 0.1
                            }
                        )
                        # If we get here, the model is available
                        available_models.append(model_id)
                        logger.info(f"✓ Model available: {model_id}")
                        continue
                    except Exception as e:
                        error_msg = str(e)
                        if "AccessDenied" in error_msg or "not authorized" in error_msg:
                            logger.warning(f"✗ Model access denied: {model_id}")
                        elif "ValidationException" in error_msg or "invalid" in error_msg:
                            logger.warning(f"✗ Model not found: {model_id}")
                        else:
                            logger.warning(f"✗ Model test failed: {model_id} - {error_msg}")
                        continue
                else:
                    # Skip non-Nova models
                    continue
                    
            except Exception as e:
                error_msg = str(e)
                if "AccessDenied" in error_msg or "not authorized" in error_msg:
                    logger.warning(f"✗ Model access denied: {model_id}")
                elif "ValidationException" in error_msg or "invalid" in error_msg:
                    logger.warning(f"✗ Model not found: {model_id}")
                else:
                    logger.warning(f"✗ Model test failed: {model_id} - {error_msg}")
        
        if available_models:
            logger.info(f"Available Bedrock models: {', '.join(available_models)}")
        else:
            logger.error("No Bedrock models are available!")
    
    def get_available_models(self) -> list:
        """Get list of available Bedrock models"""
        if not self.bedrock_client:
            return []
            
        available_models = []
        test_models = [
            "us.amazon.nova-lite-v1:0",  # Nova Lite inference profile (confirmed working)
            "us.amazon.nova-micro-v1:0", # Nova Micro inference profile (confirmed working) 
            "us.amazon.nova-pro-v1:0",   # Nova Pro inference profile (confirmed working)
        ]
        
        for model_id in test_models:
            try:
                # Quick availability check using converse API for Nova models
                if "amazon.nova" in model_id or "us.amazon.nova" in model_id:
                    self.bedrock_client.converse(
                        modelId=model_id,
                        messages=[
                            {
                                "role": "user",
                                "content": [{"text": "Hi"}]
                            }
                        ],
                        inferenceConfig={
                            "maxTokens": 1,
                            "temperature": 0.1
                        }
                    )
                    available_models.append(model_id)
                else:
                    # Skip non-Nova models
                    continue
            except:
                continue
                
        return available_models
    
    def generate_text_with_bedrock(self, prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        """
        Generate text using AWS Bedrock Nova models
        """
        if not self.bedrock_client:
            raise Exception("AWS Bedrock client not initialized")
        
        # List of Nova models to try in order of preference (confirmed working)
        models_to_try = [
            settings.AWS_BEDROCK_MODEL_ID,  # Primary model from settings
            "us.amazon.nova-lite-v1:0",  # Amazon Nova Lite inference profile (confirmed working)
            "us.amazon.nova-micro-v1:0",  # Amazon Nova Micro inference profile (confirmed working)
            "us.amazon.nova-pro-v1:0",  # Amazon Nova Pro inference profile (confirmed working)
        ]
        
        last_error = None
        
        for model_id in models_to_try:
            try:
                logger.info(f"Attempting to use model: {model_id}")
                
                # All our models are Nova models that use the converse API
                if "amazon.nova" in model_id or "us.amazon.nova" in model_id:
                    response = self.bedrock_client.converse(
                        modelId=model_id,
                        messages=[
                            {
                                "role": "user",
                                "content": [{"text": prompt}]
                            }
                        ],
                        inferenceConfig={
                            "maxTokens": max_tokens,
                            "temperature": temperature
                        }
                    )
                    result = response['output']['message']['content'][0]['text']
                    logger.info(f"Successfully generated text using Nova model: {model_id}")
                    return result
                else:
                    logger.warning(f"Skipping non-Nova model: {model_id}")
                    continue
                    
            except Exception as e:
                error_message = str(e)
                logger.warning(f"Model {model_id} failed: {error_message}")
                last_error = e
                continue
        
        # If all models failed, raise the last error
        logger.error(f"All AWS Bedrock models failed. Last error: {str(last_error)}")
        raise last_error
    
    def synthesize_speech_with_polly(self, text: str, voice_id: str = None, language_code: str = None) -> bytes:
        """
        Convert text to speech using AWS Polly
        """
        if not self.polly_client:
            raise Exception("AWS Polly client not initialized")
        
        try:
            voice_id = voice_id or settings.AWS_POLLY_VOICE_ID
            language_code = language_code or settings.AWS_POLLY_LANGUAGE_CODE
            
            logger.info(f"Synthesizing speech with Polly - Voice: {voice_id}, Language: {language_code}, Text length: {len(text)}")
            
            response = self.polly_client.synthesize_speech(
                Text=text,
                VoiceId=voice_id,
                LanguageCode=language_code,
                OutputFormat='mp3'
            )
            
            audio_data = response['AudioStream'].read()
            logger.info(f"Successfully synthesized speech - Audio size: {len(audio_data)} bytes")
            return audio_data
            
        except Exception as e:
            logger.error(f"Error synthesizing speech with Polly: {str(e)}")
            raise
    
    def analyze_sentiment_with_comprehend(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment using AWS Comprehend
        """
        if not self.comprehend_client:
            raise Exception("AWS Comprehend client not initialized")
        
        try:
            response = self.comprehend_client.detect_sentiment(
                Text=text,
                LanguageCode='en'
            )
            
            return {
                'sentiment': response['Sentiment'],
                'sentiment_scores': response['SentimentScore']
            }
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment with Comprehend: {str(e)}")
            raise
    
    def extract_key_phrases_with_comprehend(self, text: str) -> Dict[str, Any]:
        """
        Extract key phrases using AWS Comprehend
        """
        if not self.comprehend_client:
            raise Exception("AWS Comprehend client not initialized")
        
        try:
            response = self.comprehend_client.detect_key_phrases(
                Text=text,
                LanguageCode='en'
            )
            
            return {
                'key_phrases': [phrase['Text'] for phrase in response['KeyPhrases']]
            }
            
        except Exception as e:
            logger.error(f"Error extracting key phrases with Comprehend: {str(e)}")
            raise
    
    def transcribe_audio_with_transcribe(self, audio_bytes: bytes, language_code: str = 'en-US') -> str:
        """
        Transcribe audio using AWS Transcribe
        Note: This requires the audio to be uploaded to S3 first
        """
        if not self.transcribe_client:
            raise Exception("AWS Transcribe client not initialized")
        
        # For now, this is a placeholder. Full implementation would require S3 upload
        raise NotImplementedError("Audio transcription requires S3 upload. Use transcribe_file_with_transcribe instead.")
    
    def is_available(self) -> bool:
        """Check if AWS AI services are available"""
        return (
            self.aws_access_key_id and 
            self.aws_secret_access_key and 
            self.bedrock_client is not None
        ) 