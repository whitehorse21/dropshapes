from pydantic import BaseModel
from typing import List

class NetworkingSuggestions(BaseModel):
    key_professionals: List[str]
    industries_organizations: List[str]
    networking_platforms_events: List[str]
    effective_networking_tips: List[str]

class ProfessionalNetworkingResponse(BaseModel):
    profession: str
    suggestions: NetworkingSuggestions
    provider: str

class NetworkingMessageRequest(BaseModel):
    target_profession: str
    user_profession: str
    context: str = ""

class NetworkingMessageResponse(BaseModel):
    message: str
    target_profession: str
    user_profession: str
    provider: str
