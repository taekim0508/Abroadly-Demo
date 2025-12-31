"""add_review_voting

Revision ID: add_review_voting
Revises: 1f9e4b6e219c
Create Date: 2025-12-01 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6_add_review_voting"
down_revision: Union[str, Sequence[str], None] = "1f9e4b6e219c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "review_vote",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("review_type", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("review_id", sa.Integer(), nullable=False),
        sa.Column("vote_type", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_review_vote_user_id"), "review_vote", ["user_id"], unique=False)
    op.create_index(op.f("ix_review_vote_review_type"), "review_vote", ["review_type"], unique=False)
    op.create_index(op.f("ix_review_vote_review_id"), "review_vote", ["review_id"], unique=False)
    # Add unique constraint to prevent duplicate votes
    op.create_unique_constraint(
        "uq_review_vote_user_review", "review_vote", ["user_id", "review_type", "review_id"]
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_review_vote_review_id"), table_name="review_vote")
    op.drop_index(op.f("ix_review_vote_review_type"), table_name="review_vote")
    op.drop_index(op.f("ix_review_vote_user_id"), table_name="review_vote")
    op.drop_table("review_vote")

