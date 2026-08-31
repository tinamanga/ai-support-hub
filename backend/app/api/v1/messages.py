from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security.organization import get_current_membership
from app.database.session import get_db
from app.models.organization_member import OrganizationMember
from app.schemas.message import MessageCreate, MessageResponse
from app.services.message_service import (
    create_message,
    get_conversation_messages,
)

router = APIRouter(
    prefix="/organizations/{organization_id}/conversations/{conversation_id}/messages",
    tags=["Messages"],
)


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
    db: Session = Depends(get_db),
):
    return create_message(
        db=db,
        conversation_id=conversation_id,
        sender_type=data.sender_type,
        content=data.content,
        sender_user_id=data.sender_user_id,
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
    return get_conversation_messages(
        db=db,
        conversation_id=conversation_id,
    )