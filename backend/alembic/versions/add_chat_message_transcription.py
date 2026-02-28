"""add chat_message transcription for voice messages

Revision ID: add_chat_transcription
Revises: add_chat_audio_url
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa

revision = "add_chat_transcription"
down_revision = "add_chat_audio_url"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "chat_messages",
        sa.Column("transcription", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("chat_messages", "transcription")
