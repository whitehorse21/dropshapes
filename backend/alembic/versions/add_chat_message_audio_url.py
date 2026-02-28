"""add chat_message audio_url for voice message playback

Revision ID: add_chat_audio_url
Revises: c3d4e5f6a1b2
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa

revision = "add_chat_audio_url"
down_revision = "c3d4e5f6a1b2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "chat_messages",
        sa.Column("audio_url", sa.String(2000), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("chat_messages", "audio_url")
