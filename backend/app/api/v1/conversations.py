from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.enums.conversation import ConversationPriority
from app.core.enums.roles import OrganizationRole
from app.core.security.organization import get_current_membership, require_roles
from app.database.session import get_db
from app.models.conversation import Conversation
from app.models.customer import Customer
from app.models.organization_member import OrganizationMember
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
)
from app.services.conversation_service import (
    create_conversation,
    get_conversation,
    get_organization_conversations,
)


router = APIRouter(
    prefix="/organizations/{organization_id}/conversations",
    tags=["Conversations"],
)


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_conversation(
    organization_id: int,
    data: ConversationCreate,
    membership: OrganizationMember = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    customer = db.get(Customer, data.customer_id)

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found.",
        )

    if customer.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customer does not belong to this organization.",
        )

    return create_conversation(
        db=db,
        organization_id=organization_id,
        customer_id=data.customer_id,
        subject=data.subject,
        priority=data.priority,
    )


@router.get(
    "",
    response_model=list[ConversationResponse],
)
def list_conversations(
    organization_id: int,
    membership: OrganizationMember = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    return get_organization_conversations(
        db=db,
        organization_id=organization_id,
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
)
def get_single_conversation(
    organization_id: int,
    conversation_id: int,
    membership: OrganizationMember = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    conversation = get_conversation(
        db=db,
        conversation_id=conversation_id,
    )

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    if conversation.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conversation does not belong to this organization.",
        )

    return conversation