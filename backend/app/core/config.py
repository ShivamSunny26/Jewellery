import os
from pathlib import Path

from dotenv import load_dotenv  # python-dotenv must be in requirements.txt

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # -> backend/
load_dotenv(BASE_DIR / ".env")  # does nothing on Render (no .env file there)

ENV = os.getenv("ENV", "development").strip().lower()
IS_PRODUCTION = ENV == "production"


def _get_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None or not value.strip():
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


def _get_list(name: str) -> list[str]:
    raw = os.getenv(name, "")
    return [o.strip().rstrip("/") for o in raw.split(",") if o.strip()]


class Settings:
    ENV: str = ENV

    # --- Database ---
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "" if IS_PRODUCTION else "postgresql://postgres:postgres@localhost:5432/shreeomjwellers",
    )

    # --- Auth ---
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET",
        "" if IS_PRODUCTION else "dev-only-secret-change-me-in-production-please-0123456789",
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "720"))

    # --- Cookie ---
    COOKIE_NAME: str = "access_token"
    # Empty/unset = host-only cookie (correct for almost every setup)
    COOKIE_DOMAIN: str | None = os.getenv("COOKIE_DOMAIN", "").strip() or None
    COOKIE_SECURE: bool = _get_bool("COOKIE_SECURE", IS_PRODUCTION)
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax").strip().lower()

    # --- CORS (no built-in default: must come from the environment) ---
    CORS_ORIGINS: list[str] = _get_list("CORS_ORIGINS")

    # --- Media ---
    MEDIA_STORAGE_PATH: Path = Path(os.getenv("MEDIA_STORAGE_PATH", str(BASE_DIR / "media")))
    MEDIA_STORAGE_BACKEND: str = os.getenv("MEDIA_STORAGE_BACKEND", "local").strip().lower()
    MAX_PHOTO_MB: int = int(os.getenv("MAX_PHOTO_MB", "5"))
    MAX_MODEL_MB: int = int(os.getenv("MAX_MODEL_MB", "15"))
    PUBLIC_BASE_URL: str = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000").strip().rstrip("/")

    # --- Supabase Storage ---
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "").strip()
    SUPABASE_BUCKET: str = os.getenv("SUPABASE_BUCKET", "").strip()


settings = Settings()


def _validate(s: Settings) -> None:
    errors: list[str] = []

    # Checks that apply everywhere
    if s.COOKIE_SAMESITE not in ("lax", "strict", "none"):
        errors.append("COOKIE_SAMESITE must be 'lax', 'strict' or 'none'")
    if s.COOKIE_SAMESITE == "none" and not s.COOKIE_SECURE:
        errors.append("COOKIE_SAMESITE=none requires COOKIE_SECURE=true")
    for origin in s.CORS_ORIGINS:
        if not origin.startswith(("http://", "https://")):
            errors.append(f"CORS_ORIGINS entry must start with http:// or https:// -> {origin!r}")

    # Production-only checks
    if IS_PRODUCTION:
        if not s.DATABASE_URL:
            errors.append("DATABASE_URL is required")
        if not s.JWT_SECRET or s.JWT_SECRET.startswith("dev-only") or len(s.JWT_SECRET) < 32:
            errors.append("JWT_SECRET must be a real random string of at least 32 characters")
        if not s.CORS_ORIGINS:
            errors.append("CORS_ORIGINS is required (your frontend URLs, comma-separated)")
        if s.COOKIE_DOMAIN == "localhost":
            errors.append("COOKIE_DOMAIN must not be 'localhost' (leave it empty)")
        if not s.COOKIE_SECURE:
            errors.append("COOKIE_SECURE must be true in production")
        if not s.PUBLIC_BASE_URL.startswith("https://") or "localhost" in s.PUBLIC_BASE_URL:
            errors.append("PUBLIC_BASE_URL must be your public https URL")

    if errors:
        raise RuntimeError("Invalid configuration:\n - " + "\n - ".join(errors))


_validate(settings)