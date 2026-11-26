from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import ShopSetting
from app.schemas.schemas import ShopSettingOut

router = APIRouter(tags=["public-settings"])


def get_settings(db: Session) -> ShopSetting:
    s = db.query(ShopSetting).first()
    if not s:
        s = ShopSetting()
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("/settings", response_model=ShopSettingOut)
def read_settings(db: Session = Depends(get_db)):
    return get_settings(db)