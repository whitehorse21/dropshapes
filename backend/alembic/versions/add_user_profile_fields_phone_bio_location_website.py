"""add user profile fields (phone, bio, location, website)

Revision ID: add_user_profile_fields
Revises: 615518dff6ec
Create Date: 2025-02-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = 'add_user_profile_fields'
down_revision = 'drop_chat_audio_trans'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    cols = [c['name'] for c in inspector.get_columns('users')]
    if 'phone' not in cols:
        op.add_column('users', sa.Column('phone', sa.String(), nullable=True))
    if 'bio' not in cols:
        op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    if 'location' not in cols:
        op.add_column('users', sa.Column('location', sa.String(), nullable=True))
    if 'website' not in cols:
        op.add_column('users', sa.Column('website', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'website')
    op.drop_column('users', 'location')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'phone')
