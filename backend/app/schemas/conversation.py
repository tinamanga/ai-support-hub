from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.enums.conversation import (
    ConversationPriority,
    ConversationStatus,
)


class ConversationCreate(BaseModel):
    customer_id: int
    subject: str | None = None
    priority: ConversationPriority = ConversationPriority.MEDIUM


class ConversationUpdate(BaseModel):
    subject: str | None = None
    status: ConversationStatus | None = None
    priority: ConversationPriority | None = None
    assigned_agent_id: int | None = None


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    customer_id: int
    assigned_agent_id: int | None
    subject: str | None
    status: ConversationStatus
    priority: ConversationPriority
    resolved_at: datetime | None
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime