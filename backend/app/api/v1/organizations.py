from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.enums.roles import OrganizationRole
from app.core.security.dependencies import get_current_user
from app.core.security.organization import (
    get_current_membership,
    require_roles,
)
from app.database.session import get_db
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationMemberCreate,
    OrganizationMemberResponse,
    OrganizationMemberUpdate,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.services.organization_service import (
    add_member,
    create_organization,
    delete_organization,
    get_member,
    get_organization,
    get_organization_members,
    get_user_organizations,
    remove_member,
    update_member_role,
    update_organization,
)


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


@router.post(
    "",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_organization_endpoint(
    data: OrganizationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    organization = create_organization(db, data)

    # The authenticated creator becomes the owner.
    membership = OrganizationMember(
        organization_id=organization.id,
        user_id=current_user.id,
        role=OrganizationRole.OWNER,
    )

    db.add(membership)
    db.commit()

    return organization


@router.get(
    "",
    response_model=list[OrganizationResponse],
)
def list_organizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_organizations(
        db,
        current_user.id,
    )


@router.get(
    "/{organization_id}",
    response_model=OrganizationResponse,
)
def get_organization_endpoint(
    membership: OrganizationMember = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    return get_organization(
        db,
        membership.organization_id,
    )


@router.patch(
    "/{organization_id}",
    response_model=OrganizationResponse,
)
def update_organization_endpoint(
    data: OrganizationUpdate,
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    return update_organization(
        db,
        membership.organization_id,
        data,
    )


@router.delete(
    "/{organization_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_organization_endpoint(
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
        )
    ),
    db: Session = Depends(get_db),
):
    delete_organization(
        db,
        membership.organization_id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/{organization_id}/access",
)
def check_organization_access(
    membership: OrganizationMember = Depends(
        get_current_membership
    ),
):
    return {
        "organization_id": membership.organization_id,
        "user_id": membership.user_id,
        "role": membership.role.value,
        "access": "granted",
    }


@router.get(
    "/{organization_id}/admin-area",
)
def admin_area(
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
        )
    ),
):
    return {
        "organization_id": membership.organization_id,
        "user_id": membership.user_id,
        "role": membership.role.value,
        "message": "You have administrative access.",
    }


@router.post(
    "/{organization_id}/members",
    response_model=OrganizationMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_organization_member(
    data: OrganizationMemberCreate,
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    return add_member(
        db,
        membership.organization_id,
        data.user_id,
        data.role,
    )


@router.get(
    "/{organization_id}/members",
    response_model=list[OrganizationMemberResponse],
)
def list_organization_members(
    membership: OrganizationMember = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    return get_organization_members(
        db,
        membership.organization_id,
    )


@router.get(
    "/{organization_id}/members/{member_id}",
    response_model=OrganizationMemberResponse,
)
def get_organization_member(
    member_id: int,
    membership: OrganizationMember = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    return get_member(
        db,
        membership.organization_id,
        member_id,
    )


@router.patch(
    "/{organization_id}/members/{member_id}",
    response_model=OrganizationMemberResponse,
)
def update_organization_member(
    member_id: int,
    data: OrganizationMemberUpdate,
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    return update_member_role(
        db,
        membership.organization_id,
        member_id,
        data.role,
    )


@router.delete(
    "/{organization_id}/members/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_organization_member(
    member_id: int,
    membership: OrganizationMember = Depends(
        require_roles(
            OrganizationRole.OWNER,
            OrganizationRole.ADMIN,
        )
    ),
    db: Session = Depends(get_db),
):
    remove_member(
        db,
        membership.organization_id,
        member_id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
