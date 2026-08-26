"""add organization role enum

Revision ID: 0b7c68794a0f
Revises: 1ad1a96548c3
Create Date: 2026-08-27 01:18:16.075584

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0b7c68794a0f"
down_revision: Union[str, Sequence[str], None] = "1ad1a96548c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


organization_role = sa.Enum(
    "owner",
    "admin",
    "agent",
    "member",
    name="organization_role",
)


def upgrade() -> None:
    organization_role.create(op.get_bind(), checkfirst=True)

    op.alter_column(
        "organization_members",
        "role",
        existing_type=sa.String(length=50),
        type_=organization_role,
        postgresql_using="role::organization_role",
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "organization_members",
        "role",
        existing_type=organization_role,
        type_=sa.String(length=50),
        postgresql_using="role::text",
        existing_nullable=False,
    )

    organization_role.drop(op.get_bind(), checkfirst=True)