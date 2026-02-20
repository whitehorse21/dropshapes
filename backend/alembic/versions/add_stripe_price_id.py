"""Add stripe_price_id to subscriptions

Revision ID: add_stripe_price_id
Revises: 
Create Date: 2025-06-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_stripe_price_id'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add stripe_price_id column to subscriptions table
    op.add_column('subscriptions', sa.Column('stripe_price_id', sa.String(), nullable=True))

def downgrade():
    # Remove stripe_price_id column from subscriptions table
    op.drop_column('subscriptions', 'stripe_price_id')
