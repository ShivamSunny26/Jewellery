from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.core.rate_limit import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.core.timeutils import utcnow
from app.models.models import Admin
from app.schemas.admin_schemas import AdminProfileUpdate, PasswordChange
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
    cross_site = settings.COOKIE_DOMAIN != "localhost"
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        secure=cross_site,
        samesite="none" if cross_site else "lax",
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
        path="/",
    )
    admin.last_login_at = utcnow()
    db.commit()
    return admin


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(settings.COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", response_model=AdminProfile)
def me(admin: Admin = Depends(get_current_admin)):
    return admin


@router.put("/me", response_model=AdminProfile)
def update_me(
    payload: AdminProfileUpdate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    admin.full_name = payload.full_name
    db.commit()
    db.refresh(admin)
    return admin


@router.post("/change-password")
def change_password(
    payload: PasswordChange,
    request: Request,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    limiter.check(f"chpwd:{client_ip}:{admin.id}", limit=5, window_seconds=900)
    if not verify_password(payload.current_password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if verify_password(payload.new_password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must differ from the current one",
        )
    admin.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"ok": True}
