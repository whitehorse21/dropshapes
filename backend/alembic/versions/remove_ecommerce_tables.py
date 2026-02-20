"""Remove e-commerce and blog tables

Revision ID: remove_ecommerce
Revises: c865881b6b51
Create Date: 2025-06-12 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'remove_ecommerce'
down_revision = 'c865881b6b51'
branch_labels = None
depends_on = None

def upgrade():
    """Remove e-commerce and blog related tables if they exist"""
    
    # List of tables to remove (in order to handle foreign key constraints)
    tables_to_remove = [
        'order_items',
        'cart_items', 
        'blog_comments',
        'orders',
        'carts',
        'products',
        'categories',
        'blog_posts',
        'services'
    ]
    
    # Drop tables if they exist using PostgreSQL DROP TABLE IF EXISTS
    for table_name in tables_to_remove:
        try:
            print(f"Attempting to drop table: {table_name}")
            # Use raw SQL to drop table if exists
            op.execute(sa.text(f"DROP TABLE IF EXISTS {table_name} CASCADE;"))
            print(f"Successfully processed table: {table_name}")
        except Exception as e:
            print(f"Error processing table {table_name}: {e}")
            # Continue with other tables even if one fails
            continue

def downgrade():
    """
    This is a one-way migration. 
    If you need to restore e-commerce functionality, 
    you would need to recreate the tables manually.
    """
    pass
