from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.enums.conversation import (
    ConversationPriority,
    ConversationStatus,
)


class DashboardConversation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int | None
    assigned_agent_id: int | None
    subject: str | None
    status: ConversationStatus
    priority: ConversationPriority
    created_at: datetime
    updated_at: datetime


class DashboardConversationSummary(BaseModel):
    total: int
    open: int
    pending: int
    resolved: int
    closed: int
    urgent: int
    high_priority: int
    assigned: int
    unassigned: int


class DashboardOrganization(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool


class DashboardOverviewResponse(BaseModel):
    organization: DashboardOrganization
    total_customers: int
    conversations: DashboardConversationSummary
    recent_conversations: list[DashboardConversation]
