import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine
from seed import seed_if_empty
from app.routers import (
    admin_auth,
    admin_categories,
    admin_enquiries,
    admin_media,
    admin_ornaments,
    admin_rates,
    admin_settings,
    admin_stats,
    public_categories,
    public_enquiries,
    public_ornaments,
    public_settings,
    public_rates,
    public_seo,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        seed_if_empty()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"WARNING: Database not available at startup: {e}")
        print("Server will start but DB-dependent endpoints will fail until connectivity is restored.")
    yield


app = FastAPI(title="Shree Om Jwellers API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    # Allow the SPA's external assets (Google Fonts, model-viewer) and the
    # Swagger/ReDoc CDN so both the site and /docs render in production.
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' data: blob: https://fastapi.tiangolo.com https://*.supabase.co; "
        "media-src 'self' https://*.supabase.co blob:; "
        "model-src 'self' https://*.supabase.co blob:; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
        "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; "
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; "
        "connect-src 'self' https://jewellery-ctnt.onrender.com https://*.supabase.co"
    )
    return response


API_PREFIX = "/api/v1"

# Keep-alive / health endpoints exposed under the API prefix as well so external
# pingers (and the frontend) can reach them at /api/v1/...
keepalive_router = APIRouter()


@keepalive_router.get("/health")
def api_health():
    return {"status": "ok"}


@keepalive_router.get("/ping")
def api_ping():
    return {"message": "pong"}


@keepalive_router.get("/keep-alive")
def api_keep_alive():
    return {"status": "ok"}


app.include_router(keepalive_router, prefix=API_PREFIX)

app.include_router(public_seo.router)
app.include_router(public_categories.router, prefix=API_PREFIX)
app.include_router(public_ornaments.router, prefix=API_PREFIX)
app.include_router(public_rates.router, prefix=API_PREFIX)
app.include_router(public_settings.router, prefix=API_PREFIX)
app.include_router(public_enquiries.router, prefix=API_PREFIX)
app.include_router(admin_auth.router, prefix=API_PREFIX)
app.include_router(admin_ornaments.router, prefix=API_PREFIX)
app.include_router(admin_media.router, prefix=API_PREFIX)
app.include_router(admin_categories.router, prefix=API_PREFIX)
app.include_router(admin_rates.router, prefix=API_PREFIX)
app.include_router(admin_enquiries.router, prefix=API_PREFIX)
app.include_router(admin_settings.router, prefix=API_PREFIX)
app.include_router(admin_stats.router, prefix=API_PREFIX)

if settings.MEDIA_STORAGE_BACKEND != "supabase":
    settings.MEDIA_STORAGE_PATH.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=str(settings.MEDIA_STORAGE_PATH)), name="media")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/ping")
def ping():
    return {"message": "pong"}


@app.get("/keep-alive")
def keep_alive():
    return {"status": "ok"}


# Serve the built frontend (if present) so a single deployment can host both
# the API and the SPA. `/api`, `/media`, `/docs`, `/health` keep priority.
FRONTEND_DIST = Path(
    os.getenv("FRONTEND_DIST_PATH", str(Path(__file__).resolve().parent.parent / "frontend" / "dist"))
)
if FRONTEND_DIST.is_dir():
    _assets = FRONTEND_DIST / "assets"
    if _assets.is_dir():
        app.mount("/assets", StaticFiles(directory=str(_assets)), name="frontend-assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        if full_path.startswith(("api/", "media/", "docs", "redoc", "openapi.json", "health", "ping", "keep")):
            raise HTTPException(status_code=404, detail="Not Found")
        candidate = (FRONTEND_DIST / full_path).resolve()
        try:
            if candidate.is_file() and candidate.is_relative_to(FRONTEND_DIST.resolve()):
                return FileResponse(candidate)
        except ValueError:
            pass
        return FileResponse(FRONTEND_DIST / "index.html")
