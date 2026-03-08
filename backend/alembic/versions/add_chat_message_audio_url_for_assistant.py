"""add chat_messages.audio_url for assistant TTS playback

Revision ID: add_chat_assistant_audio
Revises: 1b3090851a20
Create Date: 2026-02-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "add_chat_assistant_audio"
down_revision = "add_user_profile_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    cols = [c["name"] for c in inspector.get_columns("chat_messages")]
    if "audio_url" not in cols:
        op.add_column(
            "chat_messages",
            sa.Column("audio_url", sa.String(2000), nullable=True),
        )


def downgrade() -> None:
    op.drop_column("chat_messages", "audio_url")
