from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security.auth import hash_password
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.auth import RegisterRequest


class RegistrationError(Exception):
    pass


def register_user(
    db: Session,
    data: RegisterRequest,
) -> tuple[User, Organization, OrganizationMember]:

    existing_user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if existing_user:
        raise RegistrationError(
            "A user with this email already exists."
        )

    organization = Organization(
        name=data.organization_name,
        slug=data.organization_name.lower().replace(" ", "-"),
    )

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )

    db.add(user)
    db.add(organization)

    db.flush()

    membership = OrganizationMember(
        organization_id=organization.id,
        user_id=user.id,
        role="owner",
    )

    db.add(membership)

    db.commit()

    db.refresh(user)
    db.refresh(organization)
    db.refresh(membership)

    return user, organization, membership