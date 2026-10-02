from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security.auth import create_access_token
from app.core.security.dependencies import get_current_user
from app.database.session import get_db
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.user import User
from app.schemas.auth import (
    AuthUserResponse,
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)
from app.services.auth_service import (
    RegistrationError,
    authenticate_user,
    register_user,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        user, organization, membership = register_user(
            db=db,
            data=data,
        )

    except RegistrationError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return RegisterResponse(
        user=user,
        organization_id=organization.id,
        organization_name=organization.name,
        role=membership.role,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db=db,
        email=data.email,
        password=data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    access_token = create_access_token(
        subject=str(user.id),
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )


@router.get(
    "/me",
    response_model=AuthUserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    membership = db.scalar(
        select(OrganizationMember)
        .where(OrganizationMember.user_id == current_user.id)
        .order_by(OrganizationMember.id)
    )

    organization = None

    if membership:
        organization = db.get(
            Organization,
            membership.organization_id,
        )

    return AuthUserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        organization=organization,
        membership=membership,
    )