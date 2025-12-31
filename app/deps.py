# Contributors:
# Lucas Slater: Setup (.5 hr)
# Trey Fisher: Enhancements (.5 hr)

import logging
from typing import Dict, Optional

from fastapi import Cookie, Header, HTTPException, status

from .auth.jwt import parse_jwt
from .config import settings
from .db import get_session
from .models import User


def _extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def current_user(
    session_cookie: Optional[str] = Cookie(default=None, alias=settings.cookie_name),
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> Dict:
    # Temporary logging to debug auth issues
    logger = logging.getLogger(__name__)
    logger.info(f"current_user called - Cookie present: {session_cookie is not None}, Auth header present: {authorization is not None}")
    if authorization:
        logger.info(f"Authorization header value: {authorization[:30]}...")
    
    token = session_cookie or _extract_bearer_token(authorization)
    if not token:
        logger.warning("No token found - missing both cookie and authorization header")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    try:
        payload = parse_jwt(token)
    except Exception as exc:
        logging.getLogger(__name__).warning("JWT parse failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    email = payload.get("email")
    if user_id is None or email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    from sqlmodel import select

    with next(get_session()) as session:  # get a session and close it immediately after
        result = session.exec(select(User).where(User.id == int(user_id), User.email == email))
        user = result.first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user  # type: ignore[return-value]
