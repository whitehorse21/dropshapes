"""
Utility module for handling and suppressing specific warnings
"""
import warnings
import functools

def suppress_bcrypt_warnings():
    """
    Suppress the non-critical bcrypt version detection warnings from passlib.
    This should be called during application startup.
    """
    # Create a filter to ignore the bcrypt __about__ attribute warnings
    warnings.filterwarnings("ignore", message=".*bcrypt.*__about__.*", category=Warning)
    warnings.filterwarnings("ignore", message=".*error reading bcrypt version.*", category=Warning)
    
    # Return True to indicate warnings were suppressed
    return True

def suppress_pydantic_warnings():
    """
    Suppress Pydantic V2 migration warnings about renamed configuration options.
    """
    warnings.filterwarnings("ignore", message=".*Valid config keys have changed in V2:.*", category=UserWarning)
    warnings.filterwarnings("ignore", message=".*'orm_mode' has been renamed to 'from_attributes'.*", category=UserWarning)
    
    # Return True to indicate warnings were suppressed
    return True

def suppress_weasyprint_warnings():
    """
    Suppress WeasyPrint warnings about missing dependencies.
    Note: This only suppresses the warnings but doesn't solve the underlying issue.
    The GTK3 runtime should be installed for full functionality.
    """
    warnings.filterwarnings("ignore", message=".*WeasyPrint could not import some external libraries.*", category=Warning)
    warnings.filterwarnings("ignore", message=".*WeasyPrint not available or system dependencies missing.*", category=Warning)
    warnings.filterwarnings("ignore", message=".*cannot load library 'libgobject-2.0-0': error 0x7e.*", category=Warning)
    warnings.filterwarnings("ignore", message=".*ctypes.util.find_library().*libgobject-2.0-0.*", category=Warning)
    
    # Filter specific messages printed to stdout/stderr since they aren't true Python warnings
    # Note: this doesn't actually suppress the print statements from WeasyPrint,
    # but we handle them gracefully in the pdf_service.py
    
    # Return True to indicate warnings were suppressed
    return True

def suppress_all_warnings():
    """
    Suppress all known warnings in the application.
    """
    suppress_bcrypt_warnings()
    suppress_pydantic_warnings()
    suppress_weasyprint_warnings()
    return True

def with_suppressed_warnings(func):
    """
    Decorator to suppress specific warnings in a function
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        with warnings.catch_warnings():
            # Suppress bcrypt warnings
            warnings.filterwarnings("ignore", message=".*bcrypt.*__about__.*", category=Warning)
            warnings.filterwarnings("ignore", message=".*error reading bcrypt version.*", category=Warning)
            
            # Suppress Pydantic V2 warnings
            warnings.filterwarnings("ignore", message=".*Valid config keys have changed in V2:.*", category=UserWarning)
            warnings.filterwarnings("ignore", message=".*'orm_mode' has been renamed to 'from_attributes'.*", category=UserWarning)
              # Suppress WeasyPrint warnings
            warnings.filterwarnings("ignore", message=".*WeasyPrint could not import some external libraries.*", category=Warning)
            warnings.filterwarnings("ignore", message=".*WeasyPrint not available or system dependencies missing.*", category=Warning)
            warnings.filterwarnings("ignore", message=".*cannot load library 'libgobject-2.0-0': error 0x7e.*", category=Warning)
            warnings.filterwarnings("ignore", message=".*ctypes.util.find_library().*libgobject-2.0-0.*", category=Warning)
            
            return func(*args, **kwargs)
    return wrapper
