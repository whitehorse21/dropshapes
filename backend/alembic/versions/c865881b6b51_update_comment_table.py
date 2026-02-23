"""update_comment_table

Revision ID: c865881b6b51
Revises: 
Create Date: 2025-05-23 17:13:36.297495

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = 'c865881b6b51'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    if 'comments' in inspector.get_table_names():
        return  # Table already exists (e.g. from a previous run or manual create)
    op.create_table('comments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('comment', sa.Text(), nullable=False),
    sa.Column('date_time', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('discussion_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['discussion_id'], ['discussions.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_comments_id'), 'comments', ['id'], unique=False)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)
    if 'comments' not in inspector.get_table_names():
        return
    op.drop_index(op.f('ix_comments_id'), table_name='comments')
    op.drop_table('comments')
