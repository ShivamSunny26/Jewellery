from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.models import ShopSetting
from app.schemas.schemas import ShopSettingOut, ShopSettingUpdate

router = APIRouter(
    prefix="/admin/settings",
    tags=["admin-settings"],
    dependencies=[Depends(get_current_admin)],
)


def get_settings(db: Session) -> ShopSetting:
    s = db.query(ShopSetting).first()
    if not s:
        s = ShopSetting()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("", response_model=ShopSettingOut)
def read_settings(db: Session = Depends(get_db)):
    return get_settings(db)


@router.put("", response_model=ShopSettingOut)
def update_settings(payload: ShopSettingUpdate, db: Session = Depends(get_db)):
    s = get_settings(db)
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s