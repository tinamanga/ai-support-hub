from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class KnowledgeEntryCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    content: str = Field(min_length=1)
    category: str | None = Field(default=None, max_length=100)
    is_published: bool = False

    @field_validator("title", "content")
    @classmethod
    def reject_blank_text(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("This field cannot be blank.")

        return value

    @field_validator("category")
    @classmethod
    def normalize_category(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class KnowledgeEntryUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    category: str | None = Field(default=None, max_length=100)
    is_published: bool | None = None

    @field_validator("title", "content")
    @classmethod
    def reject_blank_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("This field cannot be blank.")

        return value

    @field_validator("category")
    @classmethod
    def normalize_category(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        return value or None


class KnowledgeEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organization_id: int
    title: str
    content: str
    category: str | None
    is_published: bool
    created_at: datetime
    updated_at: datetime
