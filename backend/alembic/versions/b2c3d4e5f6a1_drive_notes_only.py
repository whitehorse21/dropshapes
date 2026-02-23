"""drive_notes_only: drop file/folder columns from drive_items if present

Revision ID: b2c3d4e5f6a1
Revises: a1b2c3d4e5f6
Create Date: 2025-02-20

"""
from alembic import op
from sqlalchemy import inspect

revision = 'b2c3d4e5f6a1'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    if 'drive_items' not in inspector.get_table_names():
        return
    cols = [c['name'] for c in inspector.get_columns('drive_items')]
    indexes = [idx['name'] for idx in inspector.get_indexes('drive_items')]
    if 'parent_id' in cols:
        if 'ix_drive_items_parent_id' in indexes:
            op.drop_index(op.f('ix_drive_items_parent_id'), table_name='drive_items')
        op.drop_column('drive_items', 'parent_id')
    for col in ('storage_path', 'file_size', 'mime_type', 'item_type', 'name'):
        if col in cols:
            op.drop_column('drive_items', col)


def downgrade() -> None:
    # Re-adding columns for notes-only is optional; leave no-op
    pass
