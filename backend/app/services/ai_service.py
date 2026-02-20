import os
import re
import requests
import json
import hashlib
from typing import Dict, Any, Optional, List

from app.core.config import settings
from app.utils.cache import cache, cache_ai_response, CacheKeys

# Import AWS base service
try:
    from app.services.aws_ai_base import AWSBaseAIService
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False

class AIService:
    """Service for AI-powered content generation using AWS Bedrock"""
    
    def __init__(self):
        # Initialize AWS AI service
        self.aws_ai_service = None
        if AWS_AVAILABLE and settings.USE_AWS_AI:
            try:
                self.aws_ai_service = AWSBaseAIService()
                if self.aws_ai_service.is_available():
                    print("AWS AI service initialized successfully")
                else:
                    print("AWS AI service not available - continuing with limited functionality")
            except Exception as e:
                print(f"Failed to initialize AWS AI service: {str(e)} - continuing with limited functionality")
                self.aws_ai_service = None
        else:
            print("AWS AI service not configured - continuing with limited functionality")
    
    def _generate_prompt_hash(self, prompt: str) -> str:
        """Generate a hash for the prompt to use as cache key"""
        return hashlib.md5(prompt.encode()).hexdigest()
    
    def _get_cached_response(self, prompt_hash: str) -> Optional[Any]:
        """Get cached AI response"""
        cache_key = f"{CacheKeys.AI_RESPONSE}:{prompt_hash}"
        return cache.get(cache_key)
    
    def _cache_response(self, prompt_hash: str, response: Any) -> bool:
        """Cache AI response"""
        cache_key = f"{CacheKeys.AI_RESPONSE}:{prompt_hash}"
        return cache.set(cache_key, response, settings.CACHE_AI_RESPONSES_TTL)
    
    def _generate_with_aws(self, prompt: str) -> str:
        """Generate text using AWS Bedrock with caching"""
        # Generate hash for the prompt
        prompt_hash = self._generate_prompt_hash(prompt)
        
        # Try to get from cache first
        cached_response = self._get_cached_response(prompt_hash)
        if cached_response is not None:
            print(f"Cache hit for AI prompt hash: {prompt_hash}")
            return cached_response
        
        # Check if AWS AI service is available
        if not self.aws_ai_service:
            error_msg = "AWS AI service not initialized. Please check your AWS configuration."
            print(error_msg)
            raise Exception(error_msg)
        
        try:
            print(f"Generating with AWS Bedrock for prompt hash: {prompt_hash}")
            response = self.aws_ai_service.generate_text_with_bedrock(prompt)
            
            if not response or response.strip() == "":
                raise Exception("AWS Bedrock returned empty response")
                
            # Cache the response
            self._cache_response(prompt_hash, response)
            print(f"Successfully generated and cached response for hash: {prompt_hash}")
            return response
            
        except Exception as e:
            error_message = str(e)
            print(f"AWS AI error for prompt hash {prompt_hash}: {error_message}")
            
            # Re-raise the exception instead of falling back
            raise Exception(f"AWS Bedrock generation failed: {error_message}")
    
    def _get_fallback_response(self, error_message: str) -> str:
        """Generate appropriate fallback response based on error type"""
        error_lower = error_message.lower()
        
        if any(keyword in error_lower for keyword in ["accessdenied", "not authorized", "access denied"]):
            return """AI service is temporarily unavailable due to access permissions. 
            
Here's a sample response to help you continue:

**Professional Summary:**
Experienced professional with proven track record in delivering high-quality results. Strong analytical and problem-solving skills with ability to work effectively in team environments.

**Key Skills:**
• Leadership and team management
• Project planning and execution  
• Analytical thinking and problem solving
• Communication and interpersonal skills
• Adaptability and continuous learning

**Experience Highlights:**
• Successfully managed multiple projects from conception to completion
• Collaborated with cross-functional teams to achieve organizational goals
• Demonstrated ability to meet deadlines and exceed expectations

Please contact support to enable full AI capabilities."""

        elif any(keyword in error_lower for keyword in ["validationexception", "invalid", "not available"]):
            return """AI service configuration is being updated. 
            
Here's a template response:

**Professional Summary:**
Dynamic professional with expertise in [your field]. Proven ability to deliver results and contribute to team success through strong analytical skills and dedication to excellence.

**Core Competencies:**
• Technical proficiency in relevant tools and technologies
• Strong communication and collaboration abilities
• Project management and organizational skills
• Problem-solving and critical thinking
• Continuous learning and professional development

**Professional Experience:**
[Your Title] at [Company Name]
• Key achievement or responsibility
• Quantified result or impact
• Relevant skill demonstration

Please try again later for full AI assistance."""

        else:
            return f"""AI service is temporarily experiencing technical difficulties.
            
Here's a general template to help you proceed:

**Professional Summary:**
Accomplished professional with strong background in [relevant field]. Demonstrated expertise in [key skills] with commitment to delivering exceptional results.

**Key Strengths:**
• Industry-specific technical skills
• Strategic thinking and planning
• Team collaboration and leadership
• Quality assurance and attention to detail
• Customer service orientation

For immediate assistance, please contact our support team.

Technical details: {error_message[:100]}..."""

    def _generate_smart_fallback(self, prompt: str) -> str:
        """Generate a smart fallback response based on prompt analysis"""
        prompt_lower = prompt.lower()
        
        if "resume" in prompt_lower and "education" in prompt_lower:
            return """**Education:**
• Bachelor's Degree in [Your Field] - [University Name], [Year]
• Relevant coursework: [Course 1], [Course 2], [Course 3]
• GPA: [If above 3.5] | Dean's List: [If applicable]
• Certifications: [Relevant professional certifications]

**Additional Academic Achievements:**
• [Academic honors, scholarships, or awards]
• [Relevant projects or research]
• [Study abroad or special programs]"""

        elif "resume" in prompt_lower and "experience" in prompt_lower:
            return """**Professional Experience:**

**[Job Title]** | [Company Name] | [Start Date] - [End Date]
• Managed [specific responsibility] resulting in [quantified achievement]
• Collaborated with [team/department] to [accomplish specific goal]
• Implemented [process/system] that improved [metric] by [percentage]
• Led [project/initiative] involving [scope] and [outcome]

**[Previous Job Title]** | [Previous Company] | [Start Date] - [End Date]
• Developed [skill/expertise] through [specific activities]
• Achieved [measurable result] by [method or approach]
• Contributed to [team goal] through [your specific role]"""

        elif "resume" in prompt_lower and "skills" in prompt_lower:
            return """**Technical Skills:**
• Programming/Software: [Relevant tools and technologies]
• Industry-Specific: [Field-related skills and knowledge]
• Analysis Tools: [Data analysis, reporting tools]

**Core Competencies:**
• Project Management & Leadership
• Problem Solving & Critical Thinking
• Communication & Interpersonal Skills
• Team Collaboration & Cross-functional Work
• Time Management & Organization
• Adaptability & Continuous Learning

**Languages:**
• [Language 1]: [Proficiency level]
• [Language 2]: [Proficiency level]"""

        elif "cover letter" in prompt_lower:
            return """Dear Hiring Manager,

I am writing to express my strong interest in the [Position Title] role at [Company Name]. With my background in [relevant field/experience], I am confident that I would be a valuable addition to your team.

**Key Qualifications:**
• [Relevant years] years of experience in [industry/field]
• Proven track record of [specific achievement or skill]
• Strong expertise in [relevant technical/soft skills]
• Demonstrated ability to [relevant capability]

In my previous role at [Previous Company], I successfully [specific accomplishment that relates to the target role]. This experience has prepared me to contribute effectively to [Company Name]'s [relevant goal/mission].

I am particularly drawn to [Company Name] because of [specific reason related to company/role]. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's continued success.

Thank you for your consideration. I look forward to hearing from you.

Sincerely,
[Your Name]"""

        else:
            return """Thank you for your request. AI service is temporarily unavailable, but here's a helpful template:

**Professional Content:**
This is a placeholder response generated while our AI service is being restored. 

**Key Points to Consider:**
• Highlight your most relevant qualifications
• Use specific examples and quantified achievements  
• Tailor content to your target audience
• Maintain professional tone and formatting
• Include relevant keywords for your industry

Please try again in a few minutes for full AI assistance, or contact support for immediate help."""

    async def generate_resume_content(self, profile_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate resume content based on user profile info using AWS Bedrock"""
        prompt = f"""
        Create professional resume content for a person with the following information:
        
        Name: {profile_info.get('fullName', 'N/A')}
        Title: {profile_info.get('title', 'N/A')}
        Summary: {profile_info.get('summary', 'N/A')}
        Years of Experience: {profile_info.get('experience', 'N/A')}
        Key Skills: {', '.join(profile_info.get('skills', []))}
        
        Please generate professional resume sections for:
        1. Professional Summary
        2. Work Experience (2-3 positions)
        3. Skills
        4. Education
        
        Format the response as a JSON object with these sections.
        """
        content = self._generate_with_aws(prompt)
        # Try to parse as JSON
        try:
            return json.loads(content)
        except Exception:
            return {"error": "Could not parse AI response", "raw_content": content}

    async def generate_cover_letter(self, job_info: Dict[str, Any], resume_info: Dict[str, Any]) -> str:
        """Generate a cover letter based on job description and resume using AWS Bedrock"""
        prompt = f"""
        Write a professional cover letter for the following job:
        
        Job Title: {job_info.get('title', 'N/A')}
        Company: {job_info.get('company', 'N/A')}
        Job Description: {job_info.get('description', 'N/A')}
        
        The applicant has the following qualifications:
        
        Name: {resume_info.get('fullName', 'N/A')}
        Title: {resume_info.get('title', 'N/A')}
        Skills: {', '.join(resume_info.get('skills', []))}
        Experience: {resume_info.get('experience', 'N/A')}
        
        The cover letter should be professional, highlight the applicant's relevant experience, 
        explain why they're a good fit for the role, and demonstrate enthusiasm for the position.
        """
        content = self._generate_with_aws(prompt)
        return content if isinstance(content, str) else str(content)

    async def generate_structured_cover_letter(self, resume) -> Dict[str, Any]:
        """Generate a structured cover letter in JSON format based on resume data"""
        # Extract resume information
        profile_data = resume.profile if resume.profile else {}
        work_history = resume.work_history if resume.work_history else []
        skills = resume.skills.get("skills", []) if resume.skills else []
        
        # Create the AI prompt for structured cover letter generation
        prompt = f"""You are a professional cover letter writer. Your task is to generate a valid JSON object for a cover letter.

CRITICAL RULES:
1. Return ONLY valid JSON - no explanations, no markdown, no code blocks
2. Do not wrap in ```json``` or any other formatting 
3. Start with {{ and end with }}
4. Use proper JSON syntax with double quotes for strings
5. Escape any special characters properly - use \\n for line breaks, \\" for quotes
6. DO NOT include actual newlines in string values - use \\n instead
7. Ensure all text is on single lines with \\n for breaks

Generate a realistic cover letter using this exact JSON structure:

{{
  "cover_letter_title": "Professional Cover Letter",
  "cover_letter_type": "professional", 
  "cover_template_category": "modern",
  "profile": {{
    "full_name": "Create realistic name",
    "email": "Create realistic email",
    "phone_number": "Create realistic phone with +1 country code",
    "linkedin_profile": "Create realistic LinkedIn URL",
    "portfolio_website": "Create realistic portfolio URL", 
    "location": "Create realistic city, state/country"
  }},
  "recipient": {{
    "hiring_manager_name": "Create realistic hiring manager name",
    "job_title": "Create appropriate job title",
    "company_name": "Create realistic company name",
    "company_address": "Create realistic company address"
  }},
  "introduction": {{
    "greet_text": "Dear Hiring Manager,",
    "intro_para": "Create professional introduction paragraph expressing interest in the position"
  }},
  "body": "Create 2-3 professional paragraphs about experience, skills, and qualifications. Use \\\\n between paragraphs (escaped as \\\\n in JSON). Include specific achievements and explain fit for role. Keep all text on one line with escaped newlines.",
  "closing": {{
    "text": "Create professional closing statement expressing interest in interview"
  }}
}}

Resume context to personalize content:
Name: {profile_data.get('fullName', 'Professional Candidate')}
Email: {profile_data.get('email', 'candidate@email.com')}
Phone: {profile_data.get('phone', '+1-555-0123')}
Location: {profile_data.get('location', 'Professional City')}
Skills: {', '.join(skills[:5]) if skills else 'Leadership, Communication, Problem-solving, Teamwork, Strategic Planning'}
Experience: {str(work_history)[:300] if work_history else 'Extensive professional experience across various roles and industries'}

Make the content professional, specific, and tailored to the candidate's background. Return only the JSON object."""
        
        # Try to generate with AI multiple times
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"AI generation attempt {attempt + 1} of {max_retries}")
                
                # Generate the content using AWS
                raw_response = self._generate_with_aws(prompt)
                print(f"Raw AI response (first 500 chars): {raw_response[:500]}...")
                
                # Clean the response to extract pure JSON
                cleaned_response = self._clean_ai_response(raw_response)
                print(f"Cleaned AI response (first 500 chars): {cleaned_response[:500]}...")
                
                # Parse the JSON response
                cover_letter_data = json.loads(cleaned_response)
                print("Successfully parsed AI JSON response")
                
                # Validate required fields
                required_fields = ['cover_letter_title', 'cover_letter_type', 'profile', 'recipient', 'introduction', 'body', 'closing']
                if all(field in cover_letter_data for field in required_fields):
                    # Remove the 'id' field if present (we don't want to return it)
                    if 'id' in cover_letter_data:
                        del cover_letter_data['id']
                    
                    print("AI generated valid cover letter data")
                    return cover_letter_data
                else:
                    missing_fields = [field for field in required_fields if field not in cover_letter_data]
                    print(f"AI response missing required fields: {missing_fields}")
                    
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed on attempt {attempt + 1}: {str(e)}")
                print(f"Failed to parse: {cleaned_response[:200]}...")
                
                # Try to fix common JSON issues and parse again
                try:
                    fixed_json = self._attempt_json_fix(cleaned_response)
                    if fixed_json != cleaned_response:
                        print("Attempting to parse fixed JSON...")
                        cover_letter_data = json.loads(fixed_json)
                        
                        # Validate required fields
                        required_fields = ['cover_letter_title', 'cover_letter_type', 'profile', 'recipient', 'introduction', 'body', 'closing']
                        if all(field in cover_letter_data for field in required_fields):
                            if 'id' in cover_letter_data:
                                del cover_letter_data['id']
                            print("Successfully parsed fixed JSON response")
                            return cover_letter_data
                except Exception as fix_error:
                    print(f"JSON fix attempt failed: {str(fix_error)}")
                
                if attempt < max_retries - 1:
                    # Try a simplified prompt for next attempt
                    prompt = f"""Generate a professional cover letter as pure JSON. Use this exact structure and fill with realistic data:

{{"cover_letter_title":"Professional Cover Letter","cover_letter_type":"professional","cover_template_category":"modern","profile":{{"full_name":"Generate name","email":"Generate email","phone_number":"Generate phone","linkedin_profile":"Generate LinkedIn URL","portfolio_website":"Generate website","location":"Generate location"}},"recipient":{{"hiring_manager_name":"Generate manager name","job_title":"Generate job title","company_name":"Generate company","company_address":"Generate address"}},"introduction":{{"greet_text":"Dear Hiring Manager,","intro_para":"Generate professional intro"}},"body":"Generate professional body with \\n for paragraphs","closing":{{"text":"Generate professional closing"}}}}

Use resume context: Name: {profile_data.get('fullName', 'Professional')}, Skills: {', '.join(skills[:3]) if skills else 'Professional skills'}

Return only valid JSON, no extra text."""
                    continue
            except Exception as e:
                print(f"Unexpected error on attempt {attempt + 1}: {str(e)}")
                
        # If all attempts failed, raise an exception instead of returning hardcoded data
        print("All AI generation attempts failed, raising exception")
        raise Exception("AI service failed to generate valid cover letter data after multiple attempts. Please try again or contact support.")

    def _clean_ai_response(self, response: str) -> str:
        """Clean AI response by removing markdown formatting and extracting JSON"""
        if not response:
            return response
            
        print(f"Cleaning AI response (length: {len(response)})")
        
        # Remove markdown code blocks
        response = response.strip()
        
        # Handle different markdown patterns
        patterns_to_remove = [
            ('```json\n', '```'),
            ('```json', '```'),
            ('```\n', '```'),
            ('```', '```'),
            ('`json\n', '`'),
            ('`json', '`'),
            ('`\n', '`'),
            ('`', '`'),
        ]
        
        for start_pattern, end_pattern in patterns_to_remove:
            if response.startswith(start_pattern):
                response = response[len(start_pattern):]
                if response.endswith(end_pattern):
                    response = response[:-len(end_pattern)]
                break
                
        # Remove any remaining backticks
        response = response.strip('`').strip()
        
        # Try to find JSON content if there's extra text
        
        # Look for JSON object starting with { and ending with }
        # Use non-greedy matching and handle nested objects
        json_pattern = r'\{(?:[^{}]|{[^{}]*})*\}'
        json_matches = re.findall(json_pattern, response, re.DOTALL)
        
        if json_matches:
            # Find the largest JSON object (likely the complete one)
            largest_json = max(json_matches, key=len)
            response = largest_json
            print(f"Extracted JSON from response (length: {len(response)})")
        
        # Fix common JSON control character issues
        # Replace literal newlines in JSON string values with escaped newlines
        response = self._fix_json_control_characters(response)
        
        # Remove any leading/trailing whitespace or newlines
        response = response.strip()
        
        print(f"Final cleaned response (first 200 chars): {response[:200]}...")
        return response
    
    def _fix_json_control_characters(self, json_str: str) -> str:
        """Fix control characters in JSON string values that break parsing"""
        
        # Find all string values in the JSON (between quotes that are not escaped)
        # This regex finds quoted strings while handling escaped quotes
        string_pattern = r'"((?:[^"\\]|\\.)*)"\s*:'
        
        def fix_string_value(match):
            key_part = match.group(0)
            return key_part  # Don't modify keys
        
        # For values (strings that come after colons), we need a different approach
        # Split by lines and fix each line that contains string values
        lines = json_str.split('\n')
        fixed_lines = []
        
        for line in lines:
            # Check if this line contains a string value (has quotes after a colon)
            if ':' in line and '"' in line:
                # Find the value part (after the colon)
                colon_index = line.find(':')
                if colon_index != -1:
                    key_part = line[:colon_index + 1]
                    value_part = line[colon_index + 1:].strip()
                    
                    # If the value part starts and ends with quotes, it's a string value
                    if value_part.startswith('"') and value_part.rstrip(',').endswith('"'):
                        # Extract the string content (without the outer quotes)
                        comma_suffix = ',' if value_part.rstrip().endswith(',') else ''
                        string_content = value_part.rstrip(',')[1:-1]  # Remove outer quotes
                        
                        # Escape control characters in the string content
                        # Replace actual newlines with \n
                        string_content = string_content.replace('\n', '\\n')
                        string_content = string_content.replace('\r', '\\r')
                        string_content = string_content.replace('\t', '\\t')
                        string_content = string_content.replace('\b', '\\b')
                        string_content = string_content.replace('\f', '\\f')
                        
                        # Escape any unescaped quotes
                        string_content = re.sub(r'(?<!\\)"', r'\\"', string_content)
                        
                        # Reconstruct the line
                        fixed_line = key_part + ' "' + string_content + '"' + comma_suffix
                        fixed_lines.append(fixed_line)
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)
            else:
                fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _attempt_json_fix(self, json_str: str) -> str:
        """Attempt to fix common JSON parsing issues"""
        try:
            # First, try the original string
            json.loads(json_str)
            return json_str  # Already valid
        except json.JSONDecodeError:
            pass
        
        # Try various fixes
        fixed_str = json_str
        
        # 1. Fix unescaped newlines in string values more aggressively
        
        # Find all string values (text between quotes that come after colons)
        # This is a more comprehensive approach
        def fix_string_content(match):
            full_match = match.group(0)
            key_part = match.group(1)  # Everything before the colon
            colon_and_space = match.group(2)  # ": " or ":"
            quote_start = match.group(3)  # Opening quote
            string_content = match.group(4)  # The actual string content
            quote_end = match.group(5)  # Closing quote
            remainder = match.group(6)  # Comma or nothing
            
            # Fix the string content
            fixed_content = string_content
            
            # Escape actual newlines
            fixed_content = fixed_content.replace('\n', '\\n')
            fixed_content = fixed_content.replace('\r', '\\r')
            fixed_content = fixed_content.replace('\t', '\\t')
            
            # Fix unescaped quotes (but not already escaped ones)
            fixed_content = re.sub(r'(?<!\\)"', r'\\"', fixed_content)
            
            return key_part + colon_and_space + quote_start + fixed_content + quote_end + remainder
        
        # Pattern to match: "key": "value with potential issues",
        pattern = r'(".*?")\s*(:)\s*(")(.*?)(")(,?)'
        fixed_str = re.sub(pattern, fix_string_content, fixed_str, flags=re.DOTALL)
        
        # 2. Try to fix trailing commas
        fixed_str = re.sub(r',(\s*[}\]])', r'\1', fixed_str)
        
        # 3. Try to fix missing commas between objects/arrays
        fixed_str = re.sub(r'}\s*{', r'},{', fixed_str)
        fixed_str = re.sub(r']\s*\[', r'],[', fixed_str)
        
        # 4. Fix any remaining control characters
        control_chars = {
            '\b': '\\b',
            '\f': '\\f',
            '\v': '\\v',
        }
        for char, escaped in control_chars.items():
            fixed_str = fixed_str.replace(char, escaped)
        
        try:
            # Test if the fix worked
            json.loads(fixed_str)
            print("Successfully fixed JSON issues")
            return fixed_str
        except json.JSONDecodeError as e:
            print(f"JSON fix attempt unsuccessful: {str(e)}")
            return json_str  # Return original if fix didn't work

    def _is_simple_content(self, content: Any) -> bool:
        """Check if content is simple and doesn't need AI improvement"""
        try:
            # Parse content if it's a string
            if isinstance(content, str):
                try:
                    parsed_content = json.loads(content)
                except json.JSONDecodeError:
                    parsed_content = content
            else:
                parsed_content = content
            
            # Check if it's a simple list of short items
            if isinstance(parsed_content, list):
                # All items should be short and simple (single words or very short phrases)
                if all(len(str(item).strip()) < 50 for item in parsed_content):
                    # Check if all items are simple words (no complex sentences)
                    simple_words = all(len(str(item).strip().split()) <= 3 for item in parsed_content)
                    return simple_words
            
            # Check if it's a simple string
            if isinstance(parsed_content, str) and len(parsed_content.strip()) < 100:
                # Check if it's just simple words/phrases (not sentences)
                word_count = len(parsed_content.strip().split())
                has_sentences = '.' in parsed_content or '!' in parsed_content or '?' in parsed_content
                return word_count <= 10 and not has_sentences
                
            return False
        except Exception:
            return False

    async def improve_resume_section(self, section_name: str, section_content: str) -> str:
        """Improve a section of a resume using AWS Bedrock"""
        
        # Define sections that typically don't need AI improvement (simple lists/single words)
        simple_sections = ['hobbies', 'skills', 'languages']
        
        # For simple sections, check if content is just a list of simple items
        if section_name.lower() in simple_sections and self._is_simple_content(section_content):
            return json.dumps({
                section_name: {
                    "original": section_content,
                    "improved": section_content,
                    "note": f"This {section_name} section contains simple items that don't require improvement."
                }
            })
        
        # Create section-specific prompts for better results
        if section_name.lower() == 'summary' or section_name.lower() == 'profile':
            prompt = f"""
            Improve the following resume {section_name} to make it more compelling and professional.
            
            Original content: {section_content}
            
            Create an improved version that:
            - Highlights key achievements and skills
            - Uses strong action words
            - Includes specific metrics where applicable
            - Demonstrates value to potential employers
            - Is concise but impactful (2-4 sentences)
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "{section_name}": {{
                    "original": "{section_content}",
                    "improved": "your improved content here"
                }}
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        elif section_name.lower() in ['work_history', 'experience']:
            prompt = f"""
            Improve the following work experience section for a resume.
            
            Original content: {section_content}
            
            For each role, improve:
            - Job descriptions with strong action verbs
            - Quantifiable achievements and results
            - Technical skills and technologies used
            - Impact on the organization
            - Add proper location formatting
            - Improve date formatting
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "experience": [
                    {{
                        "original": {{
                            "company": "original company",
                            "role": "original role",
                            "startDate": "original start date",
                            "endDate": "original end date",
                            "skills": [],
                            "current": false,
                            "location": "original location",
                            "description": "original description"
                        }},
                        "improved": {{
                            "company": "same company name as original",
                            "role": "improved role title",
                            "startDate": "improved start date format",
                            "endDate": "improved end date format",
                            "skills": ["relevant", "skills"],
                            "current": false,
                            "location": "improved location format",
                            "description": [
                                "improved description with metrics and achievements",
                                "additional achievement with quantifiable results"
                            ]
                        }}
                    }}
                ]
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        elif section_name.lower() == 'education':
            prompt = f"""
            Improve the following education section for a resume. 
            
            Original content: {section_content}
            
            Requirements:
            - Keep the institution name as provided
            - Improve degree titles to be more formal and complete
            - Format dates in readable format (e.g., "Aug 2018", "May 2022")
            - Add location in "City, State" format
            - Add relevant achievements, coursework, or honors if applicable
            - Set current field appropriately based on end date
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "education": [
                    {{
                        "original": {{
                            "institution": "original institution name",
                            "degree": "original degree",
                            "field": "original field",
                            "startDate": "original start date",
                            "endDate": "original end date",
                            "current": false
                        }},
                        "improved": {{
                            "institution": "same institution name as original",
                            "degree": "improved complete degree title",
                            "field": "same field as original",
                            "startDate": "improved readable start date",
                            "endDate": "improved readable end date or Present",
                            "current": true or false based on end date,
                            "location": "City, State format",
                            "achievements": ["relevant achievement 1", "relevant achievement 2"]
                        }}
                    }}
                ]
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        elif section_name.lower() == 'certifications':
            prompt = f"""
            Improve the following certifications section for a resume.
            
            Original content: {section_content}
            
            Fix and enhance each certification:
            - Fix placeholder dates like "a date" with realistic dates in proper format (YYYY-MM-DD)
            - Complete incomplete certificate links with realistic URLs
            - Ensure organization names are properly formatted
            - Keep the original person's name if provided
            - Use proper date formatting for startDate and endDate
            - Create realistic certificate links (e.g., https://certificates.company.com/cert-id)
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting  
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            - Fix any placeholder or incomplete data
            
            Return this exact format:
            {{
                "certifications": [
                    {{
                        "original": {{
                            "name": "original name",
                            "organization": "original organization", 
                            "startDate": "original start date",
                            "endDate": "original end date",
                            "certificateLink": "original certificate link"
                        }},
                        "improved": {{
                            "name": "same or improved certification name",
                            "organization": "improved organization name",
                            "startDate": "properly formatted start date (YYYY-MM-DD)",
                            "endDate": "properly formatted end date (YYYY-MM-DD)", 
                            "certificateLink": "complete realistic certificate URL"
                        }}
                    }}
                ]
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        elif section_name.lower() in ['profession', 'resume_title']:
            prompt = f"""
            Improve the following {section_name} for a resume to make it more specific and compelling.
            
            Original content: {section_content}
            
            Create an improved version that:
            - Is specific and descriptive
            - Highlights key skills or seniority level
            - Is appealing to employers
            - Remains concise (2-5 words)
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "{section_name}": {{
                    "original": "{section_content}",
                    "improved": "your improved title here"
                }}
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        else:
            # For other sections, use a general improvement approach
            prompt = f"""
            Improve the following {section_name} section for a resume to make it more professional and polished.
            
            Original content: {section_content}
            
            Please maintain the essential information but improve the language and formatting.
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "{section_name}": {{
                    "original": "{section_content}",
                    "improved": "your improved content here"
                }}
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        
        content = self._generate_with_aws(prompt)
        # Clean the response to remove any markdown formatting
        cleaned_content = self._clean_ai_response(content)
        return cleaned_content if isinstance(cleaned_content, str) else str(cleaned_content)
    
    async def improve_cover_letter_section(self, section_name: str, section_content: str, cover_letter_data: dict = None) -> str:
        """Improve a section of a cover letter using AWS Bedrock"""
        
        # Create section-specific prompts for better results
        if section_name.lower() == 'body':
            prompt = f"""
            Improve the following cover letter body to make it more compelling and professional.
            
            Original content: {section_content}
            
            Create an improved version that:
            - Highlights key achievements and skills
            - Uses strong action words and quantifiable results
            - Demonstrates value to the employer
            - Shows enthusiasm for the position
            - Maintains professional tone
            - Uses proper paragraph structure with clear flow
            - Includes specific examples and accomplishments
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            - Use \\\\n for line breaks within the text
            
            Return this exact format:
            {{
                "{section_name}": {{
                    "original": "{section_content}",
                    "improved": "your improved content here with \\\\n for paragraph breaks"
                }}
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        elif section_name.lower() == 'introduction':
            prompt = f"""
            Improve the following cover letter introduction to make it more engaging and professional.
            
            Original content: {section_content}
            
            Create an improved version that:
            - Creates a strong opening that captures attention
            - Clearly states the position of interest
            - Briefly mentions relevant qualifications
            - Demonstrates knowledge of the company
            - Sets a professional and enthusiastic tone
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "introduction": {{
                    "original": {section_content},
                    "improved": {{
                        "greet_text": "improved greeting",
                        "intro_para": "improved introduction paragraph"
                    }}
                }}
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        elif section_name.lower() == 'closing':
            prompt = f"""
            Improve the following cover letter closing to make it more compelling and professional.
            
            Original content: {section_content}
            
            Create an improved version that:
            - Creates a strong call to action
            - Expresses enthusiasm for next steps
            - Maintains professional tone
            - Includes appropriate closing salutation
            - Demonstrates confidence and interest
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "closing": {{
                    "original": {section_content},
                    "improved": {{
                        "text": "improved closing statement and call to action"
                    }}
                }}
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        elif section_name.lower() == 'profile':
            prompt = f"""
            Improve the following cover letter profile information to make it more professional.
            
            Original content: {section_content}
            
            Create an improved version that:
            - Ensures all contact information is properly formatted
            - Creates professional email and LinkedIn URLs if needed
            - Formats phone numbers appropriately
            - Ensures location information is clear and professional
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "profile": {{
                    "original": {section_content},
                    "improved": {{
                        "full_name": "improved name formatting",
                        "email": "improved email format",
                        "phone_number": "improved phone format",
                        "linkedin_profile": "improved LinkedIn URL",
                        "portfolio_website": "improved portfolio URL",
                        "location": "improved location format"
                    }}
                }}
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        elif section_name.lower() == 'recipient':
            prompt = f"""
            Improve the following cover letter recipient information to make it more professional.
            
            Original content: {section_content}
            
            Create an improved version that:
            - Ensures proper formatting of names and titles
            - Makes company information more professional
            - Formats addresses appropriately
            - Uses proper business title formatting
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "recipient": {{
                    "original": {section_content},
                    "improved": {{
                        "hiring_manager_name": "improved manager name",
                        "job_title": "improved job title",
                        "company_name": "improved company name",
                        "company_address": "improved company address"
                    }}
                }}
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        else:
            # For other sections, use a general improvement approach
            prompt = f"""
            Improve the following {section_name} section for a cover letter to make it more professional and polished.
            
            Original content: {section_content}
            
            Please maintain the essential information but improve the language and formatting.
            
            CRITICAL INSTRUCTIONS:
            - Return ONLY raw JSON - NO markdown formatting
            - Do NOT use code blocks, backticks, or any markdown
            - Do NOT start with ```json or end with ```
            - Return pure JSON that can be directly parsed
            
            Return this exact format:
            {{
                "{section_name}": {{
                    "original": "{section_content}",
                    "improved": "your improved content here"
                }}
            }}
            
            IMPORTANT: Start your response directly with {{ and end with }} - no other text or formatting.
            """
        
        content = self._generate_with_aws(prompt)
        # Clean the response to remove any markdown formatting
        cleaned_content = self._clean_ai_response(content)
        return cleaned_content if isinstance(cleaned_content, str) else str(cleaned_content)
    
    async def improve_entire_resume(self, resume_data: dict) -> str:
        """Improve multiple sections of a resume at once using AWS Bedrock"""
        
        print(f"Improving entire resume with sections: {list(resume_data.keys())}")
        print(f"Resume data: {json.dumps(resume_data, indent=2, default=str)[:1000]}...")
        
        # Extract sections that need improvement
        sections_to_improve = {}
        for section_name, section_content in resume_data.items():
            if section_content and section_name not in ['id', 'user_id', 'created_at', 'updated_at', 'pdf_url']:
                sections_to_improve[section_name] = section_content
        
        print(f"Sections to improve: {list(sections_to_improve.keys())}")
        
        try:
            # Use a simpler approach: provide clear examples and strict format requirements
            prompt = f"""You are a professional resume writer. You must improve the provided resume sections and return them in a very specific JSON format.

INPUT RESUME DATA:
{json.dumps(sections_to_improve, indent=2, ensure_ascii=False)}

TASK: For each section above, return improvements in this EXACT format. Do not change this structure:

{{
  "resume_title": {{
    "original": "Current title from input",
    "improved": "Enhanced professional title"
  }},
  "profile": {{
    "original": {{ "personalInfo": {{ ... }}, "profession": "..." }},
    "improved": {{ "personalInfo": {{ ... }}, "profession": "Enhanced profession" }}
  }},
  "work_history": {{
    "original": {{ "experience": [...] }},
    "improved": {{ "experience": [enhanced experience array with better descriptions] }}
  }},
  "skills": {{
    "original": {{ "skills": [...] }},
    "improved": {{ "skills": [organized and enhanced skills] }}
  }}
}}

IMPROVEMENT GUIDELINES:
1. For resume_title: Create a specific, professional title
2. For profile.profession: Enhance with senior/specific terms
3. For work_history.experience: Add metrics, achievements, action verbs
4. For skills: Organize by category, add relevant technologies
5. For other sections: Enhance with professional language

CRITICAL REQUIREMENTS:
- Return ONLY the JSON object
- Include ALL sections from input in the output
- Keep the exact "original" and "improved" structure
- No markdown, no explanations, no extra text
- Start with {{ and end with }}

Response:"""
            
            content = self._generate_with_aws(prompt)
            
            # Clean and validate the response
            cleaned_content = self._clean_ai_response(content)
            
            # Try to parse to validate JSON structure
            try:
                parsed = json.loads(cleaned_content)
                
                # Check if AI returned a proper structure or needs reconstruction
                needs_reconstruction = False
                reconstructed = {}
                
                # Check each section in the AI response
                # Create a copy of items to avoid "dictionary changed size during iteration" error
                parsed_items = list(parsed.items())
                for section_name, section_data in parsed_items:
                    if isinstance(section_data, dict) and 'original' in section_data and 'improved' in section_data:
                        # This section has correct structure
                        reconstructed[section_name] = section_data
                    else:
                        # This section needs to be restructured
                        print(f"Warning: Section {section_name} has incorrect structure, reconstructing")
                        needs_reconstruction = True
                        
                        # Find the original data for this section
                        if section_name in sections_to_improve:
                            original_data = sections_to_improve[section_name]
                        elif section_name == 'experience' and 'work_history' in sections_to_improve:
                            # Special case: AI returned 'experience' but we sent 'work_history'
                            original_data = sections_to_improve['work_history']
                            # Remove the misplaced 'experience' and handle it properly below
                            del parsed['experience']
                            continue
                        else:
                            original_data = section_data
                        
                        reconstructed[section_name] = {
                            "original": original_data,
                            "improved": section_data
                        }
                
                # Special handling for 'experience' key that should be part of 'work_history'
                if 'experience' in parsed and 'work_history' in sections_to_improve:
                    print("Found 'experience' key, mapping to 'work_history' structure")
                    reconstructed['work_history'] = {
                        "original": sections_to_improve['work_history'],
                        "improved": {
                            "experience": parsed['experience']
                        }
                    }
                    needs_reconstruction = True
                    # Remove the standalone 'experience' key if it exists
                    if 'experience' in reconstructed:
                        del reconstructed['experience']
                
                # Ensure all input sections are present in output
                for section_name in sections_to_improve.keys():
                    if section_name not in reconstructed:
                        print(f"Warning: Missing section {section_name} in AI response, adding it")
                        reconstructed[section_name] = {
                            "original": sections_to_improve[section_name],
                            "improved": sections_to_improve[section_name]
                        }
                        needs_reconstruction = True
                
                # Use reconstructed version if needed, otherwise use original parsed
                final_result = reconstructed if needs_reconstruction else parsed
                
                # Return the validated and corrected JSON
                return json.dumps(final_result, indent=2, ensure_ascii=False)
                
            except json.JSONDecodeError as e:
                print(f"AI response is not valid JSON: {str(e)}")
                print(f"Cleaned response: {cleaned_content[:500]}...")
                
                # Fallback: create the expected structure manually
                fallback_structure = {}
                for section_name, section_content in sections_to_improve.items():
                    fallback_structure[section_name] = {
                        "original": section_content,
                        "improved": section_content  # No improvement if AI failed
                    }
                return json.dumps(fallback_structure, indent=2, ensure_ascii=False)
            
        except Exception as e:
            print(f"Error in improve_entire_resume: {str(e)}")
            print(f"Resume data keys: {list(resume_data.keys())}")
            # Return a structured error response that can be parsed
            error_structure = {}
            for section_name, section_content in sections_to_improve.items():
                error_structure[section_name] = {
                    "original": section_content,
                    "improved": section_content,
                    "error": f"Failed to improve due to: {str(e)}"
                }
            return json.dumps(error_structure, indent=2, ensure_ascii=False)

# Create a global instance
ai_service = AIService()

# Backward compatibility function
def generate_text_with_bedrock(prompt: str, max_tokens: int = 500) -> str:
    """
    Backward compatibility function for direct Bedrock text generation
    """
    return ai_service._generate_with_aws(prompt)
