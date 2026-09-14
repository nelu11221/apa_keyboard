"""Autentificare pentru panoul de administrare.

Un singur administrator, cu o parolă din variabila de mediu ADMIN_PASSWORD.
La login se emite un token semnat (HMAC-SHA256) cu termen de expirare; nu
se ține nimic în baza de date. Rutele de admin cer antetul
`Authorization: Bearer <token>`.
"""
import base64
import hashlib
import hmac
import secrets
import time

from fastapi import Depends, HTTPException, Request
from pydantic import BaseModel

from .config import settings

TOKEN_TTL_SECONDS = 12 * 60 * 60  # sesiunea de admin durează 12 ore


def _secret() -> bytes:
    raw = settings.admin_secret or f"nexa-admin::{settings.admin_password}"
    return hashlib.sha256(raw.encode("utf-8")).digest()


def _sign(payload: str) -> str:
    return hmac.new(_secret(), payload.encode("utf-8"), hashlib.sha256).hexdigest()


def issue_token() -> tuple[str, int]:
    expires_at = int(time.time()) + TOKEN_TTL_SECONDS
    payload = f"{expires_at}.{secrets.token_hex(8)}"
    token = base64.urlsafe_b64encode(f"{payload}.{_sign(payload)}".encode("utf-8")).decode("ascii")
    return token, expires_at


def verify_token(token: str) -> bool:
    try:
        decoded = base64.urlsafe_b64decode(token.encode("ascii")).decode("utf-8")
        expires_at, nonce, signature = decoded.split(".")
        payload = f"{expires_at}.{nonce}"
    except (ValueError, UnicodeDecodeError):
        return False
    if not hmac.compare_digest(signature, _sign(payload)):
        return False
    return int(expires_at) > time.time()


def check_password(password: str) -> bool:
    if not settings.admin_password:
        return False
    return hmac.compare_digest(password.encode("utf-8"), settings.admin_password.encode("utf-8"))


def is_admin_request(request: Request) -> bool:
    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        return False
    return verify_token(header[7:].strip())


def require_admin(request: Request) -> None:
    """Dependență FastAPI: blochează cererea dacă nu are un token de admin valid."""
    if not is_admin_request(request):
        raise HTTPException(status_code=401, detail="Autentificare necesară.")


class LoginIn(BaseModel):
    password: str


class LoginOut(BaseModel):
    token: str
    expires_at: int
