# Contributors:
# Lucas Slater: Setup (.5 hr)

import time
from typing import Dict

import jwt

from ..config import settings


def mint_jwt(user_id: int, email: str) -> str:
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "exp": now + settings.jwt_ttl_min * 60,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def parse_jwt(token: str) -> Dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])  # type: ignore[no-any-return]
