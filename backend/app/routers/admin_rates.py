from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.models import Admin, Rate
from app.schemas.admin_schemas import AdminRateHistoryItem, AdminRateSet

router = APIRouter(
    prefix="/admin/rates",
    tags=["admin-rates"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("/history")
def rate_history(metal: str = "gold", limit: int = 30, db: Session = Depends(get_db)):
    if metal not in ("gold", "silver"):
        return []
    rows = (
        db.query(Rate)
        .filter(Rate.metal == metal)
        .order_by(Rate.created_at.desc())
        .limit(min(limit, 100))
        .all()
    )
    return [
        AdminRateHistoryItem(
            id=r.id,
            rate_value=float(r.rate_value),
            unit=r.unit,
            purity_reference=r.purity_reference,
            is_active=r.is_active,
            set_by_admin_id=r.set_by_admin_id,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.post("")
def set_rate(payload: AdminRateSet, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    db.query(Rate).filter(Rate.metal == payload.metal, Rate.is_active == True).update(
        {"is_active": False}
    )
    new_rate = Rate(
        metal=payload.metal,
        rate_value=payload.rate_value,
        unit=payload.unit,
        purity_reference=payload.purity_reference,
        is_active=True,
        set_by_admin_id=admin.id,
    )
    db.add(new_rate)
    db.commit()
    db.refresh(new_rate)
    return {
        "id": new_rate.id,
        "metal": new_rate.metal,
        "rate_value": float(new_rate.rate_value),
        "is_active": new_rate.is_active,
    }
