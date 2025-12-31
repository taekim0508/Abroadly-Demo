# Contributors:
# Lucas Slater: Setup (.5 hr)

from typing import Optional

from itsdangerous import BadSignature, SignatureExpired, TimestampSigner

from ..config import settings

signer = TimestampSigner(settings.magic_link_secret)


def make_magic_token(email: str) -> str:
    return signer.sign(email.encode()).decode()


def verify_magic_token(token: str) -> Optional[str]:
    try:
        value = signer.unsign(token, max_age=settings.magic_link_ttl_seconds)
        return value.decode()
    except (SignatureExpired, BadSignature):
        return None
