from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Dict, Any


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]] = None
    filename: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatDetailResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True


class AskRequest(BaseModel):
    question: str
    filename: Optional[str] = None
    chat_id: Optional[int] = None