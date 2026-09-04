from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums.conversation import (
    ConversationPriority,
    ConversationStatus,
)
from app.models.conversation import Conversation


def create_conversation(
    db: Session,
    organization_id: int,
    customer_id: int,
    subject: str | None = None,
    priority: ConversationPriority = ConversationPriority.MEDIUM,
) -> Conversation:
    conversation = Conversation(
        organization_id=organization_id,
        customer_id=customer_id,
        subject=subject,
        priority=priority,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_conversation(
    db: Session,
    conversation_id: int,
) -> Conversation | None:
    return db.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id
        )
    )


def get_organization_conversations(
    db: Session,
    organization_id: int,
) -> list[Conversation]:
    return list(
        db.scalars(
            select(Conversation)
            .where(
                Conversation.organization_id == organization_id
            )
            .order_by(Conversation.created_at.desc())
        ).all()
    )


def assign_agent(
    db: Session,
    conversation: Conversation,
    agent_id: int,
) -> Conversation:
    conversation.assigned_agent_id = agent_id

    db.commit()
    db.refresh(conversation)

    return conversation


def update_priority(
    db: Session,
    conversation: Conversation,
    priority: ConversationPriority,
) -> Conversation:
    conversation.priority = priority

    db.commit()
    db.refresh(conversation)

    return conversation


def update_status(
    db: Session,
    conversation: Conversation,
    status: ConversationStatus,
) -> Conversation:
    conversation.status = status

    if status == ConversationStatus.RESOLVED:
        conversation.resolved_at = datetime.now(UTC)

    elif status == ConversationStatus.CLOSED:
        conversation.closed_at = datetime.now(UTC)

    db.commit()
    db.refresh(conversation)

    return conversation