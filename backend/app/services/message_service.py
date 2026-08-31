from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums.message import MessageSenderType
from app.models.message import Message


def create_message(
    db: Session,
    conversation_id: int,
    content: str,
    sender_type: MessageSenderType,
    sender_user_id: int | None = None,
) -> Message:
    message = Message(
        conversation_id=conversation_id,
        content=content,
        sender_type=sender_type,
        sender_user_id=sender_user_id,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


def get_message(
    db: Session,
    message_id: int,
) -> Message | None:
    return db.scalar(
        select(Message).where(
            Message.id == message_id
        )
    )


def get_conversation_messages(
    db: Session,
    conversation_id: int,
) -> list[Message]:
    return list(
        db.scalars(
            select(Message)
            .where(
                Message.conversation_id == conversation_id
            )
            .order_by(Message.created_at.asc())
        ).all()
    )