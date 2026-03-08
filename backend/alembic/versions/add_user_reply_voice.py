"""add users.reply_voice for chat assistant TTS preference

Revision ID: add_user_reply_voice
Revises: add_chat_assistant_audio
Create Date: 2026-02-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "add_user_reply_voice"
down_revision = "add_chat_assistant_audio"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    cols = [c["name"] for c in inspector.get_columns("users")]
    if "reply_voice" not in cols:
        op.add_column(
            "users",
            sa.Column("reply_voice", sa.String(10), nullable=True, server_default="male"),
        )


def downgrade() -> None:
    op.drop_column("users", "reply_voice")
