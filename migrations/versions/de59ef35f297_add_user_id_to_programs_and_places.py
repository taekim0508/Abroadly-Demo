"""add_user_id_to_programs_and_places

Revision ID: de59ef35f297
Revises: b6cf0d5e1ffd
Create Date: 2025-11-11 00:04:26.865780

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "de59ef35f297"
down_revision: Union[str, Sequence[str], None] = "b6cf0d5e1ffd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table("place", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=True))
        batch_op.create_index(batch_op.f("ix_place_user_id"), ["user_id"], unique=False)
        batch_op.create_foreign_key("fk_place_user_id", "user", ["user_id"], ["id"])

    with op.batch_alter_table("study_abroad_program", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=True))
        batch_op.create_index(
            batch_op.f("ix_study_abroad_program_user_id"), ["user_id"], unique=False
        )
        batch_op.create_foreign_key("fk_study_abroad_program_user_id", "user", ["user_id"], ["id"])


def downgrade() -> None:
    """Downgrade schema."""
    # Use batch operations for SQLite compatibility
    with op.batch_alter_table("study_abroad_program", schema=None) as batch_op:
        batch_op.drop_constraint("fk_study_abroad_program_user_id", type_="foreignkey")
        batch_op.drop_index(batch_op.f("ix_study_abroad_program_user_id"))
        batch_op.drop_column("user_id")

    with op.batch_alter_table("place", schema=None) as batch_op:
        batch_op.drop_constraint("fk_place_user_id", type_="foreignkey")
        batch_op.drop_index(batch_op.f("ix_place_user_id"))
        batch_op.drop_column("user_id")
