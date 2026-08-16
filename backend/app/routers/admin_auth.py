from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.core.rate_limit import limiter
from app.core.security import create_access_token, verify_password
from app.models.models import Admin
from app.schemas.schemas import AdminLogin, AdminProfile

router = APIRouter(prefix="/admin", tags=["admin-auth"])


@router.post("/login", response_model=AdminProfile)
def login(
    payload: AdminLogin, response: Response, request: Request, db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    limiter.check(f"login:{client_ip}", limit=5, window_seconds=900)
    admin = db.query(Admin).filter(Admin.username == payload.username).first()
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = create_access_token(admin.id, admin.username)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_DOMAIN != "localhost",
        samesite="strict",
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
        path="/",
    )
    admin.last_login_at = datetime.utcnow()
    db.commit()
    return admin


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(settings.COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", response_model=AdminProfile)
def me(admin: Admin = Depends(get_current_admin)):
    return admin
