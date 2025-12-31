# Contributors:
# Lucas Slater: Setup (.5 hr)
# Trey Fisher: Enhancements (.5 hr)

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import List

from dotenv import load_dotenv

# Don't load .env file if we're in test mode (DATABASE_URL is set to test.db)
if not os.getenv("DATABASE_URL", "").endswith("test.db"):
    load_dotenv(override=True)


def _split_domains(value: str) -> List[str]:
    return [d.strip().lower() for d in value.split(",") if d.strip()]


@dataclass
class Settings:
    app_url: str = os.getenv("APP_URL", "http://localhost:5173")
    allowed_email_domains: List[str] = field(
        default_factory=lambda: _split_domains(
            os.getenv("ALLOWED_EMAIL_DOMAINS", "vanderbilt.edu,gmail.com")
        )
    )
    magic_link_secret: str = os.getenv("MAGIC_LINK_SECRET", "change-me")
    magic_link_ttl_min: int = int(os.getenv("MAGIC_LINK_TTL_MIN", "15"))
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me")
    jwt_ttl_min: int = int(os.getenv("JWT_TTL", "60"))
    cookie_name: str = os.getenv("COOKIE_NAME", "abroadly_session")
    resend_api_key: str | None = os.getenv("RESEND_API_KEY")
    email_from: str | None = os.getenv("EMAIL_FROM")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    cors_origins: List[str] = field(
        default_factory=lambda: _split_domains(
            os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
        )
    )
    # Frontend URL for magic links - can be overridden with FRONTEND_URL env var
    frontend_url: str | None = os.getenv("FRONTEND_URL")
    # Environment detection - can be explicitly set with ENVIRONMENT env var
    environment: str | None = os.getenv("ENVIRONMENT")

    @property
    def is_production(self) -> bool:
        """Detect if we're in production based on environment or URL"""
        # Explicit environment variable takes precedence
        if self.environment:
            return self.environment.lower() == "production"
        
        # Check for Vercel-specific environment variables (strong indicator of production)
        if os.getenv("VERCEL") or os.getenv("VERCEL_ENV") == "production":
            return True
        
        # Strong indicators of dev mode:
        # 1. SQLite database (dev databases are typically SQLite)
        if "sqlite" in self.database_url.lower():
            # Also check if the local SQLite file exists
            db_path = self.database_url.replace("sqlite:///", "").replace("sqlite://", "")
            if Path(db_path).exists():
                return False
        
        # 2. Local app.db file exists (indicates local dev even with prod .env)
        if Path("app.db").exists():
            return False
        
        # 3. CORS origins contain localhost (dev setup)
        if any(
            localhost in origin.lower()
            for origin in self.cors_origins
            for localhost in ["localhost", "127.0.0.1", "0.0.0.0"]
        ):
            return False
        
        # 4. APP_URL or FRONTEND_URL contains localhost/127.0.0.1
        url_to_check = self.frontend_url or self.app_url
        if any(
            localhost in url_to_check.lower()
            for localhost in ["localhost", "127.0.0.1", "0.0.0.0"]
        ):
            return False
        
        # Otherwise, assume production
        return True

    @property
    def frontend_url_for_links(self) -> str:
        """Get the frontend URL for magic links - localhost in dev, Vercel URL in prod"""
        # Check if FRONTEND_URL is set and if it's a localhost URL, use it
        if self.frontend_url:
            # If FRONTEND_URL is a localhost URL, always use it (for dev)
            if any(localhost in self.frontend_url.lower() for localhost in ["localhost", "127.0.0.1", "0.0.0.0"]):
                return self.frontend_url
            # If FRONTEND_URL is a production URL, only use it if we're actually in production
            if self.is_production:
                return self.frontend_url
            # Otherwise, we're in dev but FRONTEND_URL is set to prod URL - ignore it and use localhost
        
        # Auto-detect based on environment
        if self.is_production:
            # In production, use APP_URL (set in .env)
            if self.app_url.startswith("https://"):
                return self.app_url
            # Last resort: raise an error so it's clear what needs to be set
            raise ValueError(
                "In production, set APP_URL or FRONTEND_URL environment variable "
                "to the frontend URL (e.g., https://your-app.vercel.app)"
            )
        else:
            # Development: use localhost
            return "http://localhost:5173"

    @property
    def magic_link_ttl_seconds(self) -> int:
        return self.magic_link_ttl_min * 60


settings = Settings()
