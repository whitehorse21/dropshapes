from pydantic import BaseModel, Field, validator, field_validator
from typing import Optional, List, Union, Any
from datetime import datetime

# Course Unit schemas
class CourseUnitBase(BaseModel):    
    title: str
    description: Optional[str] = None    
    points: str 
    module: str 

    @field_validator('points')
    def validate_points(cls, v):
        # Make sure points is a string but contains valid numeric values
        try:
            return str(v)  # Convert any numeric value to string
        except (ValueError, TypeError):
            raise ValueError('Points must be a valid numeric value')

    @field_validator('module')
    def validate_module(cls, v):
        # Convert numeric module values to string, ensure non-empty
        if v is None:
            raise ValueError('Module cannot be empty')
        try:
            if isinstance(v, (int, float)):
                return str(int(v))  # Convert numeric to string
            module_str = str(v).strip()
            if not module_str:
                raise ValueError('Module cannot be empty')
            return module_str
        except (ValueError, TypeError):
            raise ValueError('Module must be a valid value that can be converted to string')

class CourseUnitCreate(CourseUnitBase):
    pass

class CourseUnitUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    points: Optional[str] = None
    module: Optional[str] = None

class CourseUnitResponse(CourseUnitBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
    @field_validator('module', mode='before')
    def ensure_string_module(cls, v):
        # Ensure module is converted to string during response serialization
        if isinstance(v, (int, float)):
            return str(int(v))
        return str(v) if v is not None else None
