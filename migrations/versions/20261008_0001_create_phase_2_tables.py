"""create phase 2 tables

Revision ID: 20261008_0001
Revises: None
Create Date: 2026-10-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20261008_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_role = postgresql.ENUM("CUSTOMER", "SUPPORT", "ADMIN", name="user_role", create_type=False)
conversation_status = postgresql.ENUM("OPEN", "CLOSED", name="conversation_status", create_type=False)
message_sender_type = postgresql.ENUM(
    "CUSTOMER",
    "SUPPORT",
    "ASSISTANT",
    "SYSTEM",
    name="message_sender_type",
    create_type=False,
)
document_status = postgresql.ENUM(
    "UPLOADED",
    "PROCESSING",
    "READY",
    "FAILED",
    name="document_status",
    create_type=False,
)
ticket_status = postgresql.ENUM(
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    name="ticket_status",
    create_type=False,
)
ticket_priority = postgresql.ENUM("LOW", "MEDIUM", "HIGH", "URGENT", name="ticket_priority", create_type=False)


def upgrade() -> None:
    bind = op.get_bind()
    user_role.create(bind, checkfirst=True)
    conversation_status.create(bind, checkfirst=True)
    message_sender_type.create(bind, checkfirst=True)
    document_status.create(bind, checkfirst=True)
    ticket_status.create(bind, checkfirst=True)
    ticket_priority.create(bind, checkfirst=True)

    inspector = sa.inspect(bind)
    if "users" in inspector.get_table_names():
        # Phase 1 created a legacy users table. Upgrade it in place so existing
        # local data survives the Phase 2 model transition.
        columns = {column["name"] for column in inspector.get_columns("users")}
        if "password" in columns and "password_hash" not in columns:
            op.alter_column("users", "password", new_column_name="password_hash")
        if "enabled" in columns and "is_active" not in columns:
            op.alter_column("users", "enabled", new_column_name="is_active")
        if "role" in columns:
            op.execute(
                "ALTER TABLE users ALTER COLUMN role TYPE user_role "
                "USING role::text::user_role"
            )
        for column in ("created_at", "updated_at"):
            if column in columns:
                op.execute(
                    f"ALTER TABLE users ALTER COLUMN {column} TYPE TIMESTAMP WITH TIME ZONE "
                    f"USING {column} AT TIME ZONE 'UTC'"
                )
        op.alter_column("users", "is_active", server_default=sa.text("true"))
    else:
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("first_name", sa.String(length=100), nullable=False),
            sa.Column("last_name", sa.String(length=100), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.Column("role", user_role, server_default="CUSTOMER", nullable=False),
            sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )
    if "ix_users_email" not in {index["name"] for index in inspector.get_indexes("users")}:
        op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "conversations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("status", conversation_status, server_default="OPEN", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_conversations_user_id"), "conversations", ["user_id"], unique=False)

    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("uploaded_by_id", sa.Integer(), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=True),
        sa.Column("status", document_status, server_default="UPLOADED", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["uploaded_by_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_documents_uploaded_by_id"), "documents", ["uploaded_by_id"], unique=False)

    op.create_table(
        "refresh_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=255), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index(op.f("ix_refresh_tokens_user_id"), "refresh_tokens", ["user_id"], unique=False)

    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=True),
        sa.Column("sender_type", message_sender_type, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_messages_conversation_id"), "messages", ["conversation_id"], unique=False)
    op.create_index(op.f("ix_messages_sender_id"), "messages", ["sender_id"], unique=False)

    op.create_table(
        "tickets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("assigned_to_id", sa.Integer(), nullable=True),
        sa.Column("conversation_id", sa.Integer(), nullable=True),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", ticket_status, server_default="OPEN", nullable=False),
        sa.Column("priority", ticket_priority, server_default="MEDIUM", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["customer_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tickets_assigned_to_id"), "tickets", ["assigned_to_id"], unique=False)
    op.create_index(op.f("ix_tickets_conversation_id"), "tickets", ["conversation_id"], unique=False)
    op.create_index(op.f("ix_tickets_customer_id"), "tickets", ["customer_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_tickets_customer_id"), table_name="tickets")
    op.drop_index(op.f("ix_tickets_conversation_id"), table_name="tickets")
    op.drop_index(op.f("ix_tickets_assigned_to_id"), table_name="tickets")
    op.drop_table("tickets")
    op.drop_index(op.f("ix_messages_sender_id"), table_name="messages")
    op.drop_index(op.f("ix_messages_conversation_id"), table_name="messages")
    op.drop_table("messages")
    op.drop_index(op.f("ix_refresh_tokens_user_id"), table_name="refresh_tokens")
    op.drop_table("refresh_tokens")
    op.drop_index(op.f("ix_documents_uploaded_by_id"), table_name="documents")
    op.drop_table("documents")
    op.drop_index(op.f("ix_conversations_user_id"), table_name="conversations")
    op.drop_table("conversations")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    ticket_priority.drop(bind, checkfirst=True)
    ticket_status.drop(bind, checkfirst=True)
    document_status.drop(bind, checkfirst=True)
    message_sender_type.drop(bind, checkfirst=True)
    conversation_status.drop(bind, checkfirst=True)
    user_role.drop(bind, checkfirst=True)
