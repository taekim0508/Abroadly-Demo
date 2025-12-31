"""add_price_range_to_places

Revision ID: 1f9e4b6e219c
Revises: de59ef35f297
Create Date: 2025-11-25 12:39:05.787833

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1f9e4b6e219c'
down_revision: Union[str, Sequence[str], None] = 'de59ef35f297'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table("place", schema=None) as batch_op:
        batch_op.add_column(sa.Column("price_range", sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table("place", schema=None) as batch_op:
        batch_op.drop_column("price_range")
