"""
Data migration utilities for handling schema changes
"""
from sqlalchemy.orm import Session
from app.models.cover_letter import CoverLetter
from typing import Dict, Any, Optional

def migrate_cover_letter_data(db: Session) -> Dict[str, int]:
    """
    Migrate existing cover letter data to match the new schema format.
    Returns a dictionary with migration statistics.
    """
    stats = {
        "total_cover_letters": 0,
        "migrated": 0,
        "skipped": 0,
        "errors": 0
    }
    
    try:
        # Get all cover letters
        cover_letters = db.query(CoverLetter).all()
        stats["total_cover_letters"] = len(cover_letters)
        
        for cover_letter in cover_letters:
            try:
                migrated = False
                
                # Check if profile needs migration
                if cover_letter.profile and isinstance(cover_letter.profile, dict):
                    if "additionalProp1" in cover_letter.profile or not _is_valid_profile(cover_letter.profile):
                        cover_letter.profile = _create_default_profile()
                        migrated = True
                
                # Check if recipient needs migration
                if cover_letter.recipient and isinstance(cover_letter.recipient, dict):
                    if "additionalProp1" in cover_letter.recipient or not _is_valid_recipient(cover_letter.recipient):
                        cover_letter.recipient = _create_default_recipient()
                        migrated = True
                
                # Check if introduction needs migration
                if cover_letter.introduction and isinstance(cover_letter.introduction, dict):
                    if "additionalProp1" in cover_letter.introduction or not _is_valid_introduction(cover_letter.introduction):
                        cover_letter.introduction = _create_default_introduction()
                        migrated = True
                
                # Check if closing needs migration
                if cover_letter.closing and isinstance(cover_letter.closing, dict):
                    if "additionalProp1" in cover_letter.closing or not _is_valid_closing(cover_letter.closing):
                        cover_letter.closing = _create_default_closing()
                        migrated = True
                
                # Check if cover_style needs migration
                if cover_letter.cover_style and isinstance(cover_letter.cover_style, dict):
                    if "additionalProp1" in cover_letter.cover_style or not _is_valid_cover_style(cover_letter.cover_style):
                        cover_letter.cover_style = _create_default_cover_style()
                        migrated = True
                
                if migrated:
                    stats["migrated"] += 1
                else:
                    stats["skipped"] += 1
                    
            except Exception as e:
                print(f"Error migrating cover letter {cover_letter.id}: {e}")
                stats["errors"] += 1
        
        # Commit all changes
        db.commit()
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
        stats["errors"] += 1
    
    return stats

def _is_valid_profile(data: Dict[str, Any]) -> bool:
    """Check if profile data matches the new schema"""
    required_fields = ["full_name", "email", "phone_number", "location", "linkedin_profile", "portfolio_website"]
    return all(field in data and data[field] for field in required_fields)

def _is_valid_recipient(data: Dict[str, Any]) -> bool:
    """Check if recipient data matches the new schema"""
    required_fields = ["company_name", "hiring_manager_name", "job_title", "company_address"]
    return all(field in data and data[field] for field in required_fields)

def _is_valid_introduction(data: Dict[str, Any]) -> bool:
    """Check if introduction data matches the new schema"""
    required_fields = ["greet_text", "intro_para"]
    return all(field in data and data[field] for field in required_fields)

def _is_valid_closing(data: Dict[str, Any]) -> bool:
    """Check if closing data matches the new schema"""
    required_fields = ["text"]
    return all(field in data and data[field] for field in required_fields)

def _is_valid_cover_style(data: Dict[str, Any]) -> bool:
    """Check if cover_style data matches the new schema"""
    required_fields = ["font", "color"]
    return all(field in data and data[field] for field in required_fields)

def _create_default_profile() -> Dict[str, str]:
    """Create default profile data"""
    return {
        "full_name": "",
        "email": "",
        "phone_number": "",
        "location": "",
        "linkedin_profile": "",
        "portfolio_website": ""
    }

def _create_default_recipient() -> Dict[str, str]:
    """Create default recipient data"""
    return {
        "company_name": "",
        "hiring_manager_name": "",
        "job_title": "",
        "company_address": ""
    }

def _create_default_introduction() -> Dict[str, str]:
    """Create default introduction data"""
    return {
        "greet_text": "",
        "intro_para": ""
    }

def _create_default_closing() -> Dict[str, str]:
    """Create default closing data"""
    return {
        "text": ""
    }

def _create_default_cover_style() -> Dict[str, str]:
    """Create default cover style data"""
    return {
        "font": "Arial",
        "color": "#000000"
    } 