import os
import tempfile
from typing import Dict, Any, Optional, List
import json
import uuid
from pathlib import Path
from app.core.config import settings
from app.utils.storage import get_storage

# Import AWS base service
try:
    from app.services.aws_ai_base import AWSBaseAIService
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False

# Add import for PDF analysis
try:
    import PyPDF2
    PDF_ANALYSIS_AVAILABLE = True
except ImportError:
    PDF_ANALYSIS_AVAILABLE = False

# Add import for PDF generation
try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    PDF_GENERATION_AVAILABLE = True
except ImportError:
    PDF_GENERATION_AVAILABLE = False

class PDFService:
    """Service for generating PDFs from AWS AI-generated content and analyzing PDFs"""
    def __init__(self):
        self.storage = get_storage()
        
        # Initialize AWS AI service
        self.aws_ai_service = None
        if AWS_AVAILABLE and settings.USE_AWS_AI:
            try:
                self.aws_ai_service = AWSBaseAIService()
                if self.aws_ai_service.is_available():
                    print("AWS PDF service initialized successfully")
                else:
                    print("AWS PDF service not available - continuing with limited functionality")
            except Exception as e:
                print(f"Failed to initialize AWS PDF service: {str(e)} - continuing with limited functionality")
                self.aws_ai_service = None
        else:
            print("AWS PDF service not configured - continuing with limited functionality")

    async def generate_pdf_from_ai(self, prompt: str, template_name: str = "classic") -> str:
        """Generate a PDF from AI-generated text using the specified template"""
        try:
            if not self.aws_ai_service:
                raise Exception("AWS AI service not available")
            
            # Create a structured prompt for better resume content generation
            structured_prompt = f"""
            Generate a professional resume based on the following request: {prompt}
            
            Please format the response as a JSON object with the following structure:
            {{
                "personal_info": {{
                    "name": "Full Name",
                    "email": "email@example.com", 
                    "phone": "Phone Number",
                    "address": "City, State"
                }},
                "professional_summary": "A brief professional summary (2-3 sentences)",
                "work_experience": [
                    {{
                        "company": "Company Name",
                        "position": "Job Title", 
                        "duration": "Start Date - End Date",
                        "responsibilities": [
                            "Key responsibility or achievement 1",
                            "Key responsibility or achievement 2"
                        ]
                    }}
                ],
                "education": [
                    {{
                        "institution": "School Name",
                        "degree": "Degree Name",
                        "field": "Field of Study",
                        "year": "Graduation Year"
                    }}
                ],
                "skills": ["Skill 1", "Skill 2", "Skill 3"],
                "certifications": [
                    {{
                        "name": "Certification Name",
                        "issuer": "Issuing Organization",
                        "year": "Year Obtained"
                    }}
                ]
            }}
            
            If specific information is not provided in the request, use realistic placeholder information that matches the context.
            """
            
            # Generate content using AWS Bedrock
            content = self.aws_ai_service.generate_text_with_bedrock(structured_prompt, max_tokens=1500, temperature=0.7)
            
            # Parse the content and generate PDF
            return await self._generate_pdf_from_content(content, template_name)
            
        except Exception as e:
            raise Exception(f"Failed to generate PDF from AI: {str(e)}")

    async def _generate_pdf_from_content(self, content: str, template_name: str) -> str:
        """Generate PDF from content using ReportLab (no HTML templates needed)"""
        try:
            if not PDF_GENERATION_AVAILABLE:
                raise Exception("ReportLab is not available for PDF generation")
            
            # Parse content into structured data
            parsed_content = self._parse_content(content)
            
            # Generate PDF filename
            pdf_filename = f"resume_{uuid.uuid4().hex}.pdf"
            
            # Use temporary file for PDF generation
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
                temp_pdf_path = temp_pdf.name
            
            # Generate PDF with ReportLab directly (no HTML template needed)
            self._generate_pdf_with_reportlab(parsed_content, temp_pdf_path)
            
            # Upload to storage
            with open(temp_pdf_path, 'rb') as pdf_file:
                pdf_url = self.storage.upload_file_content(
                    pdf_file,
                    f"resumes/pdfs/{pdf_filename}",
                    content_type="application/pdf"
                )
            
            # Clean up temporary file
            try:
                os.unlink(temp_pdf_path)
            except OSError as e:
                print(f"Warning: Could not delete temporary file {temp_pdf_path}: {e}")
            
            return pdf_url
            
        except Exception as e:
            raise Exception(f"Failed to generate PDF from content: {str(e)}")

    def _parse_content(self, content: str) -> Dict[str, Any]:
        """Parse content into structured data for template rendering"""
        try:
            # Clean the content first - remove markdown code blocks if present
            cleaned_content = self._clean_json_content(content)
            
            # Try to parse as JSON first
            parsed = json.loads(cleaned_content)
            # Ensure we have the basic structure expected by resume templates
            if isinstance(parsed, dict):
                return self._format_resume_data(parsed)
            else:
                return self._create_default_structure(content)
        except json.JSONDecodeError as e:
            print(f"JSON parsing failed: {e}")
            print(f"Original content (first 200 chars): {content[:200]}")
            print(f"Cleaned content (first 200 chars): {self._clean_json_content(content)[:200]}")
            # If not JSON, create a resume structure from raw text
            return self._create_default_structure(content)

    def _clean_json_content(self, content: str) -> str:
        """Clean JSON content by removing markdown code blocks and extra formatting"""
        import re
        
        # Remove markdown code block markers
        content = re.sub(r'```json\s*', '', content)
        content = re.sub(r'```\s*$', '', content)
        content = re.sub(r'```', '', content)
        
        # Find JSON object in the content (look for { ... })
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            content = json_match.group(0)
        
        # Remove any leading/trailing whitespace
        content = content.strip()
        
        return content

    def _format_resume_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Format parsed data to match resume template expectations"""
        # Map various possible field names to template expectations
        personal_info = data.get("personal_info", data.get("personalInfo", {}))
        
        formatted = {
            # Personal information
            "personal_info": {
                "name": personal_info.get("name", personal_info.get("fullName", "Professional")),
                "email": personal_info.get("email", "email@example.com"),
                "phone": personal_info.get("phone", personal_info.get("phoneNumber", "")),
                "address": personal_info.get("address", personal_info.get("location", "")),
                "linkedin": personal_info.get("linkedin", ""),
                "website": personal_info.get("website", "")
            },
            
            # Professional summary
            "professional_summary": (
                data.get("professional_summary") or 
                data.get("summary") or 
                data.get("profile") or
                "Experienced professional with a strong background in delivering quality results."
            ),
            
            # Work experience
            "work_experience": self._format_experience(
                data.get("work_experience", data.get("experience", data.get("workHistory", [])))
            ),
            
            # Education
            "education": self._format_education(data.get("education", [])),
            
            # Skills
            "skills": data.get("skills", []),
            
            # Additional sections
            "certifications": data.get("certifications", []),
            "languages": data.get("languages", []),
            "achievements": data.get("achievements", []),
            
            # Template settings
            "title": data.get("title", f"Resume - {personal_info.get('name', 'Professional')}"),
            "template_name": data.get("template_name", "classic")
        }
        return formatted

    def _format_experience(self, experience_data) -> List[Dict[str, Any]]:
        """Format work experience data"""
        if not experience_data:
            return []
        
        formatted_exp = []
        for exp in experience_data:
            if isinstance(exp, dict):
                formatted_exp.append({
                    "company": exp.get("company", "Company Name"),
                    "position": exp.get("position", exp.get("role", exp.get("title", "Position"))),
                    "duration": exp.get("duration", f"{exp.get('startDate', 'Start')} - {exp.get('endDate', 'End')}"),
                    "location": exp.get("location", ""),
                    "responsibilities": exp.get("responsibilities", exp.get("description", ["Key responsibilities"]))
                })
        return formatted_exp

    def _format_education(self, education_data) -> List[Dict[str, Any]]:
        """Format education data"""
        if not education_data:
            return []
        
        formatted_edu = []
        for edu in education_data:
            if isinstance(edu, dict):
                formatted_edu.append({
                    "institution": edu.get("institution", edu.get("school", "Institution")),
                    "degree": edu.get("degree", "Degree"),
                    "field": edu.get("field", edu.get("major", "Field of Study")),
                    "year": edu.get("year", edu.get("graduationYear", edu.get("endDate", "Year"))),
                    "gpa": edu.get("gpa", ""),
                    "achievements": edu.get("achievements", [])
                })
        return formatted_edu

    def _generate_pdf_with_reportlab(self, content: Dict[str, Any], output_path: str):
        """Generate PDF using ReportLab"""
        if not PDF_GENERATION_AVAILABLE:
            raise Exception("ReportLab is not available for PDF generation")
        
        # Create PDF document
        doc = SimpleDocTemplate(output_path, pagesize=letter, 
                              rightMargin=72, leftMargin=72, 
                              topMargin=72, bottomMargin=72)
        
        # Get styles
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.darkblue,
            alignment=TA_CENTER,
            spaceAfter=12
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.darkblue,
            spaceBefore=12,
            spaceAfter=6
        )
        
        normal_style = styles['Normal']
        
        # Add personal info
        personal_info = content.get('personal_info', {})
        name = personal_info.get('name', 'Resume')
        story.append(Paragraph(name, title_style))
        
        # Contact information
        contact_info = []
        if personal_info.get('email'):
            contact_info.append(personal_info['email'])
        if personal_info.get('phone'):
            contact_info.append(personal_info['phone'])
        if personal_info.get('address'):
            contact_info.append(personal_info['address'])
        
        if contact_info:
            contact_text = ' | '.join(contact_info)
            contact_style = ParagraphStyle(
                'Contact',
                parent=normal_style,
                alignment=TA_CENTER,
                spaceAfter=12
            )
            story.append(Paragraph(contact_text, contact_style))
        
        story.append(Spacer(1, 12))
        
        # Professional Summary
        summary = content.get('professional_summary', '')
        if summary:
            story.append(Paragraph('Professional Summary', heading_style))
            story.append(Paragraph(summary, normal_style))
            story.append(Spacer(1, 12))
        
        # Work Experience
        work_experience = content.get('work_experience', [])
        if work_experience:
            story.append(Paragraph('Work Experience', heading_style))
            for exp in work_experience:
                if isinstance(exp, dict):
                    # Job title and company
                    job_title = f"<b>{exp.get('position', 'Position')}</b> at {exp.get('company', 'Company')}"
                    story.append(Paragraph(job_title, normal_style))
                    
                    # Duration and location
                    duration = exp.get('duration', '')
                    location = exp.get('location', '')
                    if duration or location:
                        duration_text = f"{duration}"
                        if location:
                            duration_text += f" | {location}"
                        story.append(Paragraph(duration_text, normal_style))
                    
                    # Responsibilities
                    responsibilities = exp.get('responsibilities', [])
                    if responsibilities:
                        if isinstance(responsibilities, list):
                            for resp in responsibilities:
                                story.append(Paragraph(f"• {resp}", normal_style))
                        else:
                            story.append(Paragraph(f"• {responsibilities}", normal_style))
                    
                    story.append(Spacer(1, 8))
        
        # Education
        education = content.get('education', [])
        if education:
            story.append(Paragraph('Education', heading_style))
            for edu in education:
                if isinstance(edu, dict):
                    degree_text = f"<b>{edu.get('degree', 'Degree')}</b> in {edu.get('field', 'Field')}"
                    story.append(Paragraph(degree_text, normal_style))
                    institution = edu.get('institution', 'Institution')
                    year = edu.get('year', '')
                    if year:
                        institution += f" | {year}"
                    story.append(Paragraph(institution, normal_style))
                    story.append(Spacer(1, 8))
        
        # Skills
        skills = content.get('skills', [])
        if skills:
            story.append(Paragraph('Skills', heading_style))
            if isinstance(skills, list):
                skills_text = ', '.join(skills)
            else:
                skills_text = str(skills)
            story.append(Paragraph(skills_text, normal_style))
            story.append(Spacer(1, 8))
        
        # Certifications
        certifications = content.get('certifications', [])
        if certifications:
            story.append(Paragraph('Certifications', heading_style))
            for cert in certifications:
                if isinstance(cert, dict):
                    cert_text = f"<b>{cert.get('name', 'Certification')}</b>"
                    issuer = cert.get('issuer', cert.get('organization', ''))
                    year = cert.get('year', cert.get('endDate', ''))
                    if issuer:
                        cert_text += f" - {issuer}"
                    if year:
                        cert_text += f" ({year})"
                    story.append(Paragraph(cert_text, normal_style))
                elif isinstance(cert, str):
                    story.append(Paragraph(cert, normal_style))
                story.append(Spacer(1, 4))
        
        # Additional content if available
        if content.get('generated_content'):
            story.append(Paragraph('Additional Information', heading_style))
            story.append(Paragraph(content['generated_content'], normal_style))
        
        # Build PDF
        doc.build(story)

    def _create_default_structure(self, content: str) -> Dict[str, Any]:
        """Create a default resume structure from unstructured content"""
        return {
            "personal_info": {
                "name": "Generated Resume",
                "email": "",
                "phone": "",
                "address": ""
            },
            "professional_summary": content[:500] if len(content) > 500 else content,
            "work_experience": [],
            "education": [],
            "skills": [],
            "certifications": [],
            "languages": [],
            "title": "AI Generated Resume",
            "template_name": "classic",
            "generated_content": content
        }

    async def analyze_pdf(self, file_bytes: bytes, do_summary=True, do_keywords=True, do_sentiment=True) -> Dict[str, Any]:
        """Analyze a PDF: extract text, and optionally run AI for summary, keywords, sentiment."""
        if not PDF_ANALYSIS_AVAILABLE:
            raise Exception("PyPDF2 is not installed on the server.")
        
        # Extract text from PDF
        try:
            reader = PyPDF2.PdfReader(tempfile.NamedTemporaryFile(delete=False, suffix=".pdf"))
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
                temp_pdf.write(file_bytes)
                temp_pdf.flush()
                reader = PyPDF2.PdfReader(temp_pdf.name)
                text = "\n".join(page.extract_text() or "" for page in reader.pages)
            os.unlink(temp_pdf.name)
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
        
        result = {"text": text}
        
        # Use AWS Comprehend for analysis
        try:
            result.update(await self._analyze_with_aws(text, do_summary, do_keywords, do_sentiment))
        except Exception as e:
            raise Exception(f"AWS analysis failed: {str(e)}")
        
        return result

    async def _analyze_with_aws(self, text: str, do_summary: bool, do_keywords: bool, do_sentiment: bool) -> Dict[str, Any]:
        """Analyze text using AWS Comprehend and Bedrock with graceful error handling"""
        result = {}
        
        try:
            if do_sentiment:
                try:
                    sentiment_analysis = self.aws_ai_service.analyze_sentiment_with_comprehend(text[:5000])  # Limit for Comprehend
                    result["sentiment"] = sentiment_analysis
                except Exception as e:
                    logger.warning(f"AWS Comprehend sentiment analysis failed (skipping): {str(e)}")
                    result["sentiment"] = None
            
            if do_keywords:
                try:
                    key_phrases = self.aws_ai_service.extract_key_phrases_with_comprehend(text[:5000])  # Limit for Comprehend
                    result["keywords"] = key_phrases
                except Exception as e:
                    logger.warning(f"AWS Comprehend key phrase extraction failed (skipping): {str(e)}")
                    result["keywords"] = None
            
            if do_summary:
                prompt = f"Provide a concise summary of the following text (maximum 200 words):\n\n{text[:2000]}"
                summary = self.aws_ai_service.generate_text_with_bedrock(prompt, max_tokens=300, temperature=0.3)
                result["summary"] = summary.strip()
            
            result["provider"] = "aws"
            
        except Exception as e:
            raise Exception(f"AWS analysis error: {str(e)}")
        
        return result

# Create a global instance
pdf_service = PDFService()
