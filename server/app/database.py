from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings


def _normalize_url(url: str) -> str:
    # Supabase/Heroku dau "postgres://" sau "postgresql://"; SQLAlchemy are nevoie
    # de driverul explicit ("postgresql+psycopg://") ca să folosească psycopg 3.
    for prefix in ("postgres://", "postgresql://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


DATABASE_URL = _normalize_url(settings.database_url)
_is_sqlite = DATABASE_URL.startswith("sqlite")

if _is_sqlite:
    _connect_args = {"check_same_thread": False}
    _engine_kwargs = {}
else:
    # Pooler-ul Supabase (PgBouncer) nu suportă prepared statements → le oprim;
    # pool_pre_ping reface conexiunile închise de pooler după inactivitate.
    _connect_args = {"prepare_threshold": None, "sslmode": "require"}
    _engine_kwargs = {"pool_pre_ping": True, "pool_recycle": 300}

engine = create_engine(DATABASE_URL, connect_args=_connect_args, **_engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
