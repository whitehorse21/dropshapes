import os
from app.core.config import settings

# Import AWS base service
try:
    from app.services.aws_ai_base import AWSBaseAIService
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False

class ProfessionalNetworkingService:
    def __init__(self):
        # Initialize AWS AI service
        self.aws_ai_service = None
        if AWS_AVAILABLE and settings.USE_AWS_AI:
            try:
                self.aws_ai_service = AWSBaseAIService()
                if self.aws_ai_service.is_available():
                    print("AWS Professional Networking service initialized successfully")
                else:
                    raise Exception("AWS Professional Networking service not available")
            except Exception as e:
                print(f"Failed to initialize AWS Professional Networking service: {str(e)}")
                raise Exception("AWS Professional Networking service is required but not available")
        else:
            raise Exception("AWS Professional Networking service is required but not configured")

    def suggest_connections(self, profession):
        """Suggest professional connections using AWS Bedrock"""
        try:
            return self._suggest_connections_with_aws(profession)
        except Exception as e:
            raise Exception(f"AWS connection suggestions error: {str(e)}")

    def _suggest_connections_with_aws(self, profession):
        """Suggest professional connections using AWS Bedrock"""
        try:
            prompt = f"""
            Provide professional networking suggestions for {profession} in a short, clear, and actionable format.
            Include:
            1. Key professionals to connect with
            2. Industries & organizations
            3. Networking platforms & events
            4. Tips for effective networking
            
            Respond in a concise bullet-point style (max 5 items per section).
            
            Return the response as a JSON object with the following structure:
            {{
              "profession": "{profession}",
              "suggestions": {{
                "key_professionals": [
                  "Professional type 1",
                  "Professional type 2",
                  "Professional type 3",
                  "Professional type 4",
                  "Professional type 5"
                ],
                "industries_organizations": [
                  "Industry/Organization 1",
                  "Industry/Organization 2", 
                  "Industry/Organization 3",
                  "Industry/Organization 4",
                  "Industry/Organization 5"
                ],
                "networking_platforms_events": [
                  "Platform/Event 1",
                  "Platform/Event 2",
                  "Platform/Event 3",
                  "Platform/Event 4",
                  "Platform/Event 5"
                ],
                "effective_networking_tips": [
                  "Tip 1",
                  "Tip 2",
                  "Tip 3",
                  "Tip 4",
                  "Tip 5"
                ]
              }},
              "provider": "aws"
            }}
            
            Return only valid JSON without any additional text or formatting.
            """
            
            response = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=1000, temperature=0.7)
            
            # Try to parse the JSON response
            import json
            try:
                suggestions_data = json.loads(response.strip())
                return suggestions_data
            except json.JSONDecodeError:
                # Fallback: create structured response manually if JSON parsing fails
                return {
                    "profession": profession,
                    "suggestions": {
                        "key_professionals": [
                            "Industry leaders and senior professionals",
                            "Peers and colleagues in similar roles",
                            "Mentors and experienced practitioners",
                            "Recruiters and hiring managers",
                            "Professional association members"
                        ],
                        "industries_organizations": [
                            "Leading companies in the field",
                            "Professional associations",
                            "Industry conferences and events",
                            "Educational institutions",
                            "Relevant startups and growing companies"
                        ],
                        "networking_platforms_events": [
                            "LinkedIn professional groups",
                            "Industry-specific conferences",
                            "Local meetups and networking events",
                            "Professional webinars and workshops",
                            "Online communities and forums"
                        ],
                        "effective_networking_tips": [
                            "Be genuine and authentic in interactions",
                            "Follow up promptly after initial meetings",
                            "Offer value before asking for favors",
                            "Maintain regular contact with connections",
                            "Attend industry events consistently"
                        ]
                    },
                    "provider": "aws"
                }
        except Exception as e:
            raise Exception(f"AWS connection suggestions error: {str(e)}")

    def generate_networking_message(self, target_profession, user_profession, context=""):
        """Generate a professional networking message using AWS Bedrock"""
        try:
            return self._generate_message_with_aws(target_profession, user_profession, context)
        except Exception as e:
            raise Exception(f"AWS message generation error: {str(e)}")

    def _generate_message_with_aws(self, target_profession, user_profession, context=""):
        """Generate networking message using AWS Bedrock"""
        try:
            prompt = f"""
            Generate a professional networking message for LinkedIn or email.
            
            Target profession: {target_profession}
            Your profession: {user_profession}
            Context: {context if context else "General networking"}
            
            The message should be:
            - Professional and respectful
            - Concise (under 150 words)
            - Specific and personalized
            - Include a clear call to action
            - Avoid being too salesy or pushy
            
            Return only the message without any additional text.
            """
            
            message = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=300, temperature=0.6)
            return {
                "message": message.strip(),
                "target_profession": target_profession,
                "user_profession": user_profession,
                "provider": "aws"
            }
        except Exception as e:
            raise Exception(f"AWS message generation error: {str(e)}")


