"""drop audio_url and transcription from chat_messages; content = S3 URL for voice

Revision ID: drop_chat_audio_trans
Revises: add_chat_transcription
Create Date: 2026-02-27

"""
from alembic import op
import sqlalchemy as sa

revision = "drop_chat_audio_trans"
down_revision = "add_chat_transcription"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("chat_messages", "transcription")
    op.drop_column("chat_messages", "audio_url")


def downgrade() -> None:
    op.add_column("chat_messages", sa.Column("audio_url", sa.String(2000), nullable=True))
    op.add_column("chat_messages", sa.Column("transcription", sa.Text(), nullable=True))
