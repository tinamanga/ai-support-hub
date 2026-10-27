from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge_entry import KnowledgeEntry
from app.schemas.knowledge_entry import (
    KnowledgeEntryCreate,
    KnowledgeEntryUpdate,
)


def create_knowledge_entry(
    db: Session,
    organization_id: int,
    data: KnowledgeEntryCreate,
) -> KnowledgeEntry:
    entry = KnowledgeEntry(
        organization_id=organization_id,
        title=data.title,
        content=data.content,
        category=data.category,
        is_published=data.is_published,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry


def list_knowledge_entries(
    db: Session,
    organization_id: int,
    include_drafts: bool = False,
) -> list[KnowledgeEntry]:
    statement = select(KnowledgeEntry).where(
        KnowledgeEntry.organization_id == organization_id,
    )

    if not include_drafts:
        statement = statement.where(
            KnowledgeEntry.is_published.is_(True),
        )

    statement = statement.order_by(
        KnowledgeEntry.updated_at.desc(),
        KnowledgeEntry.id.desc(),
    )

    return list(db.scalars(statement).all())


def get_knowledge_entry(
    db: Session,
    organization_id: int,
    entry_id: int,
) -> KnowledgeEntry:
    entry = db.scalar(
        select(KnowledgeEntry).where(
            KnowledgeEntry.id == entry_id,
            KnowledgeEntry.organization_id == organization_id,
        )
    )

    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge entry not found.",
        )

    return entry


def update_knowledge_entry(
    db: Session,
    entry: KnowledgeEntry,
    data: KnowledgeEntryUpdate,
) -> KnowledgeEntry:
    changes = data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)

    return entry


def delete_knowledge_entry(
    db: Session,
    entry: KnowledgeEntry,
) -> None:
    db.delete(entry)
    db.commit()
