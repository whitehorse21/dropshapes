"""drop_drive_items_name

Revision ID: c3d4e5f6a1b2
Revises: b2c3d4e5f6a1
Create Date: 2025-02-20

"""
from alembic import op
from sqlalchemy import inspect

revision = 'c3d4e5f6a1b2'
down_revision = 'b2c3d4e5f6a1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    if 'drive_items' not in inspector.get_table_names():
        return
    cols = [c['name'] for c in inspector.get_columns('drive_items')]
    if 'name' in cols:
        op.drop_column('drive_items', 'name')


def downgrade() -> None:
    pass
