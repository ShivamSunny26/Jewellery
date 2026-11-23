import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

ENV = os.getenv("ENV", "development").lower()
IS_PRODUCTION = ENV == "production"


class Settings:
    ENV: str = ENV
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "" if IS_PRODUCTION else "postgresql://postgres:postgres@localhost:5432/shreeomjwellers",
    )
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET", "" if IS_PRODUCTION else "dev-only-secret-change-me-in-production-please-0123456789"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "720"))
    COOKIE_NAME: str = "access_token"
    COOKIE_DOMAIN: str = os.getenv("COOKIE_DOMAIN", "localhost")
    CORS_ORIGINS: list = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001",
        ).split(",")
        if o.strip()
    ]
    MEDIA_STORAGE_PATH: Path = Path(
        os.getenv("MEDIA_STORAGE_PATH", str(BASE_DIR / "media"))
    )
    MAX_PHOTO_MB: int = int(os.getenv("MAX_PHOTO_MB", "5"))
    MAX_MODEL_MB: int = int(os.getenv("MAX_MODEL_MB", "15"))
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")


settings = Settings()

if IS_PRODUCTION:
    missing = []
    if not settings.DATABASE_URL:
        missing.append("DATABASE_URL")
    if not settings.JWT_SECRET or settings.JWT_SECRET.startswith("dev-only"):
        missing.append("JWT_SECRET")
    if missing:
        raise RuntimeError(
            "Missing required production environment variables: " + ", ".join(missing)
        )
    if settings.COOKIE_DOMAIN == "localhost":
        raise RuntimeError("COOKIE_DOMAIN must not be 'localhost' in production")