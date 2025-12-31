# Contributors:
# Lucas Slater: DB initialization (1 hr)

from collections.abc import Generator
from typing import Optional

from sqlmodel import Session, SQLModel, create_engine

from .config import settings

connect_args: Optional[dict] = (
    {"check_same_thread": False} if settings.database_url.startswith("sqlite") else None
)

# Configure connection pool for Supabase/PostgreSQL
# Limit pool size to avoid hitting Supabase connection limits
# Supabase free tier in Session mode allows only 1-2 connections
pool_args = {}
if not settings.database_url.startswith("sqlite"):
    pool_args = {
        "pool_size": 1,  # Maximum number of connections in the pool (Supabase free tier limit)
        "max_overflow": 0,  # No overflow connections allowed
        "pool_pre_ping": True,  # Verify connections before using them
        "pool_recycle": 300,  # Recycle connections after 5 minutes
        "pool_reset_on_return": "commit",  # Reset connection state on return
    }

engine = create_engine(
    settings.database_url,
    echo=False,
    connect_args=connect_args or {},
    **pool_args
)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
