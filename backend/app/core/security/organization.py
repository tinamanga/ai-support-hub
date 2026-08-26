from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums.roles import OrganizationRole
from app.core.security.dependencies import get_current_user
from app.database.session import get_db
from app.models.organization_member import OrganizationMember
from app.models.user import User


def get_current_membership(
    organization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationMember:

    membership = db.scalar(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == current_user.id,
        )
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this organization.",
        )

    return membership


def require_roles(
    *allowed_roles: OrganizationRole,
):
    def role_checker(
        membership: OrganizationMember = Depends(
            get_current_membership
        ),
    ) -> OrganizationMember:

        if membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )

        return membership

    return role_checker