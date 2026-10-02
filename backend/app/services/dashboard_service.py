from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums.conversation import ConversationPriority, ConversationStatus
from app.models.conversation import Conversation
from app.models.customer import Customer
from app.models.organization import Organization
from app.schemas.dashboard import (
    DashboardConversation,
    DashboardConversationSummary,
    DashboardOrganization,
    DashboardOverviewResponse,
)


def get_dashboard_overview(
    db: Session,
    organization_id: int,
) -> DashboardOverviewResponse:
    organization = db.get(Organization, organization_id)

    if organization is None:
        raise ValueError("Organization not found.")

    total_customers = db.scalar(
        select(func.count(Customer.id)).where(
            Customer.organization_id == organization_id
        )
    ) or 0

    conversation_counts = db.execute(
        select(
            Conversation.status,
            func.count(Conversation.id),
        )
        .where(Conversation.organization_id == organization_id)
        .group_by(Conversation.status)
    ).all()

    status_counts = {
        status: count
        for status, count in conversation_counts
    }

    total_conversations = sum(status_counts.values())

    urgent_count = db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.organization_id == organization_id,
            Conversation.priority == ConversationPriority.URGENT,
        )
    ) or 0

    high_priority_count = db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.organization_id == organization_id,
            Conversation.priority == ConversationPriority.HIGH,
        )
    ) or 0

    assigned_count = db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.organization_id == organization_id,
            Conversation.assigned_agent_id.is_not(None),
        )
    ) or 0

    unassigned_count = db.scalar(
        select(func.count(Conversation.id)).where(
            Conversation.organization_id == organization_id,
            Conversation.assigned_agent_id.is_(None),
        )
    ) or 0

    recent_conversations = list(
        db.scalars(
            select(Conversation)
            .where(Conversation.organization_id == organization_id)
            .order_by(Conversation.updated_at.desc())
            .limit(10)
        ).all()
    )

    return DashboardOverviewResponse(
        organization=DashboardOrganization(
            id=organization.id,
            name=organization.name,
            slug=organization.slug,
            is_active=organization.is_active,
        ),
        total_customers=total_customers,
        conversations=DashboardConversationSummary(
            total=total_conversations,
            open=status_counts.get(ConversationStatus.OPEN, 0),
            pending=status_counts.get(ConversationStatus.PENDING, 0),
            resolved=status_counts.get(ConversationStatus.RESOLVED, 0),
            closed=status_counts.get(ConversationStatus.CLOSED, 0),
            urgent=urgent_count,
            high_priority=high_priority_count,
            assigned=assigned_count,
            unassigned=unassigned_count,
        ),
        recent_conversations=[
            DashboardConversation.model_validate(conversation)
            for conversation in recent_conversations
        ],
    )
