from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.enums.roles import OrganizationRole
from app.core.security.organization import (
    get_current_membership,
    require_roles,
)
from app.database.session import get_db
from app.models.organization_member import OrganizationMember
from app.schemas.knowledge_entry import (
    KnowledgeEntryCreate,
    KnowledgeEntryResponse,
    KnowledgeEntryUpdate,
)
from app.services.knowledge_entry_service import (
    create_knowledge_entry,
    delete_knowledge_entry,
    get_knowledge_entry,
    list_knowledge_entries,
    update_knowledge_entry,
)


router = APIRouter(
    prefix="/organizations/{organization_id}/knowledge",
    tags=["Knowledge Base"],
)


ADMIN_ROLES = (
    OrganizationRole.OWNER,
    OrganizationRole.ADMIN,
)


@router.post(
    "",
    response_model=KnowledgeEntryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_knowledge_entry_endpoint(
    data: KnowledgeEntryCreate,
    membership: OrganizationMember = Depends(
        require_roles(*ADMIN_ROLES)
    ),
    db: Session = Depends(get_db),
):
    return create_knowledge_entry(
        db,
        membership.organization_id,
        data,
    )


@router.get(
    "",
    response_model=list[KnowledgeEntryResponse],
)
def list_knowledge_entries_endpoint(
    membership: OrganizationMember = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    can_view_drafts = membership.role in ADMIN_ROLES

    return list_knowledge_entries(
        db,
        membership.organization_id,
        include_drafts=can_view_drafts,
    )


@router.get(
    "/{entry_id}",
    response_model=KnowledgeEntryResponse,
)
def get_knowledge_entry_endpoint(
    entry_id: int,
    membership: OrganizationMember = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    entry = get_knowledge_entry(
        db,
        membership.organization_id,
        entry_id,
    )

    if not entry.is_published and membership.role not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge entry not found.",
        )

    return entry


@router.patch(
    "/{entry_id}",
    response_model=KnowledgeEntryResponse,
)
def update_knowledge_entry_endpoint(
    entry_id: int,
    data: KnowledgeEntryUpdate,
    membership: OrganizationMember = Depends(
        require_roles(*ADMIN_ROLES)
    ),
    db: Session = Depends(get_db),
):
    entry = get_knowledge_entry(
        db,
        membership.organization_id,
        entry_id,
    )

    return update_knowledge_entry(db, entry, data)


@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_knowledge_entry_endpoint(
    entry_id: int,
    membership: OrganizationMember = Depends(
        require_roles(*ADMIN_ROLES)
    ),
    db: Session = Depends(get_db),
):
    entry = get_knowledge_entry(
        db,
        membership.organization_id,
        entry_id,
    )

    delete_knowledge_entry(db, entry)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
