from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.enums.message import MessageSenderType


class MessageCreate(BaseModel):
    content: str
    sender_type: MessageSenderType
    sender_user_id: int | None = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender_type: MessageSenderType
    sender_user_id: int | None
    content: str
    created_at: datetime