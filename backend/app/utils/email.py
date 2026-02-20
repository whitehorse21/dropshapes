import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader
from typing import List, Dict, Any, Optional

from app.core.config import settings

class EmailService:
    def __init__(self):
        self.smtp_user = settings.EMAIL_USER
        self.smtp_password = settings.EMAIL_PASSWORD
        self.sender_email = settings.EMAIL_FROM
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.use_tls = settings.SMTP_USE_TLS
        
        # Set up Jinja2 template environment
        template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "templates")
        self.env = Environment(loader=FileSystemLoader(template_dir))
    
    def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        text_content: str = None
    ) -> bool:
        """Send email to recipients"""
        if not self.smtp_password:
            print("Email service not configured")
            return False
        
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = self.sender_email
        message["To"] = ", ".join(to_emails)
        
        # Add text and HTML content
        if text_content:
            message.attach(MIMEText(text_content, "plain"))
        
        message.attach(MIMEText(html_content, "html"))
        
        try:
            # Connect to SMTP server
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.ehlo()
            if self.use_tls:
                server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            
            # Send email
            server.sendmail(self.sender_email, to_emails, message.as_string())
            server.quit()
            return True        
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
    
    def render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """Render a Jinja2 template with the given context"""
        template = self.env.get_template(f"{template_name}.html")
        return template.render(**context)
    
    def send_contact_confirmation(self, to_email: str, name: str) -> bool:
        """Send contact form confirmation email"""
        subject = f"We've received your message - {settings.PROJECT_NAME}"
        
        html_content = self.render_template(
            "contact_confirmation",
            {
                "name": name,
                "site_name": settings.PROJECT_NAME
            }
        )
        
        return self.send_email([to_email], subject, html_content)

# Create singleton instance
email_service = EmailService()
