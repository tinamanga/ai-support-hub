from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.core.enums.conversation import ConversationStatus, ConversationPriority


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    organization_id: Mapped[int] = mapped_column(
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    assigned_agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    subject: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    status: Mapped[ConversationStatus] = mapped_column(
        SAEnum(
            ConversationStatus,
            name="conversation_status",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
        default=ConversationStatus.OPEN,
        server_default=ConversationStatus.OPEN.value,
    )

    priority: Mapped[ConversationPriority] = mapped_column(
        SAEnum(
            ConversationPriority,
            name="conversation_priority",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
        default=ConversationPriority.MEDIUM,
        server_default=ConversationPriority.MEDIUM.value,
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    closed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    customer = relationship(
        "Customer",
        back_populates="conversations",
    )

    assigned_agent = relationship(
        "User",
        foreign_keys=[assigned_agent_id],
    )

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )