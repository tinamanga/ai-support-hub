from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums.message import MessageSenderType
from app.core.security.dependencies import get_current_user
from app.core.security.organization import get_current_membership
from app.database.session import get_db
from app.models.conversation import Conversation
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse
from app.services.message_service import (
    create_message,
    get_conversation_messages,
)

router = APIRouter(
    prefix="/organizations/{organization_id}/conversations/{conversation_id}/messages",
    tags=["Messages"],
)


def get_organization_conversation(
    db: Session,
    organization_id: int,
    conversation_id: int,
) -> Conversation:

    conversation = db.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.organization_id == organization_id,
        )
    )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    return conversation


@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation_message(
    organization_id: int,
    conversation_id: int,
    data: MessageCreate,
    membership: OrganizationMember = Depends(get_current_membership),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    conversation = get_organization_conversation(
        db=db,
        organization_id=organization_id,
        conversation_id=conversation_id,
    )

    sender_user_id = None

    if data.sender_type == MessageSenderType.AGENT:
        sender_user_id = current_user.id

    return create_message(
        db=db,
        conversation_id=conversation.id,
        sender_type=data.sender_type,
        content=data.content,
        sender_user_id=sender_user_id,
    )


@router.get(
    "",
    response_model=list[MessageResponse],
)
def list_conversation_messages(
    organization_id: int,
    conversation_id: int,
    membership: OrganizationMember = Depends(get_current_membership),
    db: Session = Depends(get_db),
):

    conversation = get_organization_conversation(
        db=db,
        organization_id=organization_id,
        conversation_id=conversation_id,
    )

    return get_conversation_messages(
        db=db,
        conversation_id=conversation.id,
    )