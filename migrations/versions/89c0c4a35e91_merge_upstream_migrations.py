"""merge upstream migrations

Revision ID: 89c0c4a35e91
Revises: a1b2c3d4e5f6_add_review_voting, ebe7bd8731c4
Create Date: 2025-11-30 11:16:20.471309

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '89c0c4a35e91'
down_revision: Union[str, Sequence[str], None] = ('a1b2c3d4e5f6_add_review_voting', 'ebe7bd8731c4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
