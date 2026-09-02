import re

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.enums.roles import OrganizationRole
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
)


def generate_slug(name: str) -> str:
    """
    Generate a URL-friendly slug from an organization name.
    """
    slug = name.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")

    if not slug:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Organization name must contain letters or numbers.",
        )

    return slug


def get_unique_slug(
    db: Session,
    name: str,
    organization_id: int | None = None,
) -> str:
    """
    Generate a unique organization slug.

    If the base slug already exists, append -2, -3, etc.
    """
    base_slug = generate_slug(name)
    slug = base_slug
    counter = 2

    while True:
        query = select(Organization).where(
            Organization.slug == slug
        )

        if organization_id is not None:
            query = query.where(
                Organization.id != organization_id
            )

        existing = db.scalar(query)

        if existing is None:
            return slug

        slug = f"{base_slug}-{counter}"
        counter += 1


def create_organization(
    db: Session,
    data: OrganizationCreate,
) -> Organization:
    """
    Create a new organization.
    """
    slug = get_unique_slug(db, data.name)

    organization = Organization(
        name=data.name.strip(),
        slug=slug,
        is_active=True,
    )

    db.add(organization)

    try:
        db.commit()
        db.refresh(organization)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to create organization.",
        )

    return organization


def get_organization(
    db: Session,
    organization_id: int,
) -> Organization:
    """
    Get an organization by ID.
    """
    organization = db.get(
        Organization,
        organization_id,
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found.",
        )

    return organization


def get_user_organizations(
    db: Session,
    user_id: int,
) -> list[Organization]:
    """
    Get all organizations the user belongs to.
    """
    statement = (
        select(Organization)
        .join(
            OrganizationMember,
            OrganizationMember.organization_id
            == Organization.id,
        )
        .where(
            OrganizationMember.user_id == user_id,
        )
        .order_by(Organization.name)
    )

    return list(db.scalars(statement).all())


def update_organization(
    db: Session,
    organization_id: int,
    data: OrganizationUpdate,
) -> Organization:
    """
    Update organization details.
    """
    organization = get_organization(
        db,
        organization_id,
    )

    if data.name is not None:
        new_name = data.name.strip()

        if not new_name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Organization name cannot be empty.",
            )

        organization.name = new_name

        organization.slug = get_unique_slug(
            db,
            new_name,
            organization_id=organization.id,
        )

    if data.is_active is not None:
        organization.is_active = data.is_active

    try:
        db.commit()
        db.refresh(organization)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to update organization.",
        )

    return organization


def delete_organization(
    db: Session,
    organization_id: int,
) -> None:
    """
    Delete an organization.

    Organization memberships are removed through the database
    ON DELETE CASCADE relationship.
    """
    organization = get_organization(
        db,
        organization_id,
    )

    db.delete(organization)
    db.commit()


def add_member(
    db: Session,
    organization_id: int,
    user_id: int,
    role: OrganizationRole,
) -> OrganizationMember:
    """
    Add a user to an organization.
    """
    organization = db.get(
        Organization,
        organization_id,
    )

    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found.",
        )

    user = db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add an inactive user.",
        )

    existing_membership = db.scalar(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == user_id,
        )
    )

    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a member of this organization.",
        )

    if role == OrganizationRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A new member cannot be assigned the owner role.",
        )

    membership = OrganizationMember(
        organization_id=organization_id,
        user_id=user_id,
        role=role,
    )

    db.add(membership)

    try:
        db.commit()
        db.refresh(membership)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to add organization member.",
        )

    return membership


def get_organization_members(
    db: Session,
    organization_id: int,
) -> list[OrganizationMember]:
    """
    Get all members of an organization.
    """
    get_organization(db, organization_id)

    statement = (
        select(OrganizationMember)
        .where(
            OrganizationMember.organization_id
            == organization_id,
        )
        .order_by(OrganizationMember.created_at)
    )

    return list(db.scalars(statement).all())


def get_member(
    db: Session,
    organization_id: int,
    member_id: int,
) -> OrganizationMember:
    """
    Get a specific organization membership.
    """
    membership = db.scalar(
        select(OrganizationMember).where(
            OrganizationMember.id == member_id,
            OrganizationMember.organization_id == organization_id,
        )
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization member not found.",
        )

    return membership


def update_member_role(
    db: Session,
    organization_id: int,
    member_id: int,
    role: OrganizationRole,
) -> OrganizationMember:
    """
    Update an organization's member role.

    The owner role cannot be assigned through normal member
    management.
    """
    membership = get_member(
        db,
        organization_id,
        member_id,
    )

    if role == OrganizationRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The owner role cannot be assigned through member management.",
        )

    if membership.role == OrganizationRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The organization owner role cannot be changed here.",
        )

    membership.role = role

    db.commit()
    db.refresh(membership)

    return membership


def remove_member(
    db: Session,
    organization_id: int,
    member_id: int,
) -> None:
    """
    Remove a member from an organization.
    """
    membership = get_member(
        db,
        organization_id,
        member_id,
    )

    if membership.role == OrganizationRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The organization owner cannot be removed.",
        )

    db.delete(membership)
    db.commit()


def get_current_membership(
    db: Session,
    organization_id: int,
    user_id: int,
) -> OrganizationMember:
    """
    Get a user's membership in an organization.
    """
    membership = db.scalar(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == user_id,
        )
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this organization.",
        )

    return membership
