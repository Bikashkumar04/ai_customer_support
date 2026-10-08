"""repair defaults for legacy users table

Revision ID: 20261008_0002
Revises: 20261008_0001
"""

from alembic import op
import sqlalchemy as sa


revision = "20261008_0002"
down_revision = "20261008_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("users", "created_at", server_default=sa.func.now())
    op.alter_column("users", "updated_at", server_default=sa.func.now())
    op.alter_column("users", "role", server_default="CUSTOMER")
    op.alter_column("users", "is_active", server_default=sa.text("true"))


def downgrade() -> None:
    op.alter_column("users", "created_at", server_default=None)
    op.alter_column("users", "updated_at", server_default=None)
    op.alter_column("users", "role", server_default=None)
    op.alter_column("users", "is_active", server_default=None)
