from fastapi import APIRouter, Depends

from app.core.enums.roles import OrganizationRole
from app.core.security.organization import (
    get_current_membership,
    require_roles,
)
from app.models.organization_member import OrganizationMember


router = APIRouter(
    prefix="/organizations",
    tags=["Organizations"],
)


@router.get("/{organization_id}/access")
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


@router.get("/{organization_id}/admin-area")
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