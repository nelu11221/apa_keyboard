import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

SERVER_DIR = Path(__file__).resolve().parent.parent  # server/
PROJECT_ROOT = SERVER_DIR.parent  # Proiect_APA/


@dataclass(frozen=True)
class Settings:
    engine_path: str
    database_url: str
    stripe_secret_key: str
    stripe_webhook_secret: str
    frontend_url: str
    admin_password: str
    admin_secret: str


def _load_settings() -> Settings:
    default_engine_path = PROJECT_ROOT / "engine" / "build" / "search_engine"
    default_database_path = SERVER_DIR / "searchmart.db"

    return Settings(
        engine_path=os.getenv("ENGINE_PATH", str(default_engine_path)),
        database_url=os.getenv("DATABASE_URL", f"sqlite:///{default_database_path}"),
        stripe_secret_key=os.getenv("STRIPE_SECRET_KEY", ""),
        stripe_webhook_secret=os.getenv("STRIPE_WEBHOOK_SECRET", ""),
        frontend_url=os.getenv("FRONTEND_URL", "http://localhost:5173"),
        # Parola panoului de administrare. Dacă lipsește, panoul nu poate fi accesat deloc.
        admin_password=os.getenv("ADMIN_PASSWORD", ""),
        # Cheia cu care se semnează tokenurile de sesiune; opțională (derivată din parolă dacă lipsește).
        admin_secret=os.getenv("ADMIN_SECRET", ""),
    )


settings = _load_settings()
