from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
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
    public_categories,
    public_enquiries,
    public_ornaments,
    public_rates,
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
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' data: blob:; "
        "style-src 'self' 'unsafe-inline'; "
        "script-src 'self' 'unsafe-inline'; "
        "connect-src 'self'"
    )
    return response


API_PREFIX = "/api/v1"

app.include_router(public_categories.router, prefix=API_PREFIX)
app.include_router(public_ornaments.router, prefix=API_PREFIX)
app.include_router(public_rates.router, prefix=API_PREFIX)
app.include_router(public_enquiries.router, prefix=API_PREFIX)
app.include_router(admin_auth.router, prefix=API_PREFIX)
app.include_router(admin_ornaments.router, prefix=API_PREFIX)
app.include_router(admin_media.router, prefix=API_PREFIX)
app.include_router(admin_categories.router, prefix=API_PREFIX)
app.include_router(admin_rates.router, prefix=API_PREFIX)
app.include_router(admin_enquiries.router, prefix=API_PREFIX)

settings.MEDIA_STORAGE_PATH.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(settings.MEDIA_STORAGE_PATH)), name="media")


@app.get("/health")
def health():
    return {"status": "ok"}
