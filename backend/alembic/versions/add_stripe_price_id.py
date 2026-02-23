"""Add stripe_price_id to subscriptions

Revision ID: add_stripe_price_id
Revises: 
Create Date: 2025-06-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers
revision = 'add_stripe_price_id'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('subscriptions')]
    if 'stripe_price_id' in columns:
        return  # Column already exists
    op.add_column('subscriptions', sa.Column('stripe_price_id', sa.String(), nullable=True))

def downgrade():
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('subscriptions')]
    if 'stripe_price_id' not in columns:
        return
    op.drop_column('subscriptions', 'stripe_price_id')
