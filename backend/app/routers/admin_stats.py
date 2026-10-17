from collections import defaultdict
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.core.timeutils import utcnow
from app.models.models import Category, Enquiry, Ornament, OrnamentMedia, Rate

router = APIRouter(
    prefix="/admin",
    tags=["admin-stats"],
    dependencies=[Depends(get_current_admin)],
)


def _count(db: Session, model, *filters) -> int:
    return db.query(func.count(model.id)).filter(*filters).scalar() or 0


@router.get("/stats")
def stats(db: Session = Depends(get_db)):
    now = utcnow()
    today = now.date()

    status_counts = dict(
        db.query(Enquiry.status, func.count(Enquiry.id))
        .group_by(Enquiry.status)
        .all()
    )
    new_enquiries = status_counts.get("new", 0)

    last_30 = now - timedelta(days=30)
    recent_rows = (
        db.query(Enquiry.created_at).filter(Enquiry.created_at >= last_30).all()
    )
    per_day = defaultdict(int)
    for (created_at,) in recent_rows:
        per_day[created_at.date()] += 1
    enquiries_per_day = [
        {
            "date": (today - timedelta(days=i)).isoformat(),
            "count": per_day.get(today - timedelta(days=i), 0),
        }
        for i in range(29, -1, -1)
    ]

    recent_enquiries = (
        db.query(Enquiry)
        .options(joinedload(Enquiry.ornament))
        .order_by(Enquiry.created_at.desc())
        .limit(5)
        .all()
    )

    top_categories = [
        {"name": name, "count": count}
        for name, count in db.query(Category.name, func.count(Ornament.id))
        .outerjoin(Ornament, Ornament.category_id == Category.id)
        .group_by(Category.id, Category.name)
        .order_by(func.count(Ornament.id).desc())
        .limit(5)
        .all()
    ]

    def _rate(metal: str):
        r = (
            db.query(Rate)
            .filter(Rate.metal == metal, Rate.is_active == True)
            .first()
        )
        if not r:
            return None
        return {
            "rate_value": float(r.rate_value),
            "unit": r.unit,
            "purity_reference": r.purity_reference,
            "updated_at": r.created_at.isoformat() if r.created_at else None,
        }

    return {
        "ornaments": {
            "total": _count(db, Ornament),
            "visible": _count(db, Ornament, Ornament.is_visible == True),
            "hidden": _count(db, Ornament, Ornament.is_visible == False),
        },
        "categories": _count(db, Category),
        "media": {
            "photos": _count(db, OrnamentMedia, OrnamentMedia.media_type == "photo"),
            "models": _count(db, OrnamentMedia, OrnamentMedia.media_type == "model"),
        },
        "enquiries": {
            "new": new_enquiries,
            "read": status_counts.get("read", 0),
            "resolved": status_counts.get("resolved", 0),
            "total": sum(status_counts.values()),
            "last_7_days": _count(
                db, Enquiry, Enquiry.created_at >= now - timedelta(days=7)
            ),
        },
        "rates": {"gold": _rate("gold"), "silver": _rate("silver")},
        "enquiries_per_day": enquiries_per_day,
        "top_categories": top_categories,
        "recent_enquiries": [
            {
                "id": e.id,
                "customer_name": e.customer_name,
                "customer_phone": e.customer_phone,
                "ornament_name": e.ornament.name if e.ornament else None,
                "status": e.status,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in recent_enquiries
        ],
    }
