"""add_drive_items_table

Revision ID: a1b2c3d4e5f6
Revises: 615518dff6ec
Create Date: 2025-02-20

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = 'a1b2c3d4e5f6'
down_revision = '615518dff6ec'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    if 'drive_items' in inspector.get_table_names():
        return
    op.create_table(
        'drive_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_drive_items_id'), 'drive_items', ['id'], unique=False)
    op.create_index(op.f('ix_drive_items_user_id'), 'drive_items', ['user_id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    if 'drive_items' not in inspector.get_table_names():
        return
    op.drop_index(op.f('ix_drive_items_user_id'), table_name='drive_items')
    op.drop_index(op.f('ix_drive_items_id'), table_name='drive_items')
    op.drop_table('drive_items')
