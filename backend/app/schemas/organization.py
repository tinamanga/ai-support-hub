from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums.roles import OrganizationRole


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)


class OrganizationUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )
    is_active: bool | None = None


class OrganizationResponse(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrganizationMemberCreate(BaseModel):
    user_id: int = Field(gt=0)
    role: OrganizationRole = OrganizationRole.MEMBER


class OrganizationMemberUpdate(BaseModel):
    role: OrganizationRole


class OrganizationMemberResponse(BaseModel):
    id: int
    organization_id: int
    user_id: int
    role: OrganizationRole
    created_at: datetime

    model_config = {"from_attributes": True}
