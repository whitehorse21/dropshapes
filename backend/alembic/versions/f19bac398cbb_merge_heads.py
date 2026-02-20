"""merge heads

Revision ID: f19bac398cbb
Revises: add_stripe_price_id, remove_ecommerce
Create Date: 2025-06-15 10:46:16.978310

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f19bac398cbb'
down_revision = ('add_stripe_price_id', 'remove_ecommerce')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
