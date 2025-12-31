"""add_user_id_to_trips

Revision ID: b6cf0d5e1ffd
Revises: 4e742b979bdd
Create Date: 2025-11-10 23:53:12.837440

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b6cf0d5e1ffd"
down_revision: Union[str, Sequence[str], None] = "4e742b979bdd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table("trip", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=True))
        batch_op.create_index(batch_op.f("ix_trip_user_id"), ["user_id"], unique=False)
        batch_op.create_foreign_key("fk_trip_user_id", "user", ["user_id"], ["id"])


def downgrade() -> None:
    """Downgrade schema."""
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table("trip", schema=None) as batch_op:
        batch_op.drop_constraint("fk_trip_user_id", type_="foreignkey")
        batch_op.drop_index(batch_op.f("ix_trip_user_id"))
        batch_op.drop_column("user_id")
