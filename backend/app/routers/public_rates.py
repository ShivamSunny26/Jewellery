from collections import defaultdict
from datetime import timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.timeutils import utcnow
from app.models.models import Rate
from app.schemas.schemas import CurrentRates, RateHistory, RateInfo, RatePoint

router = APIRouter(prefix="/rates", tags=["public-rates"])


def _info(r: Rate) -> RateInfo:
    return RateInfo(
        rate_value=float(r.rate_value),
        unit=r.unit,
        purity_reference=r.purity_reference,
        updated_at=r.created_at,
    )


@router.get("/current", response_model=CurrentRates)
def current_rates(db: Session = Depends(get_db)):
    gold = db.query(Rate).filter(Rate.metal == "gold", Rate.is_active == True).first()
    silver = (
        db.query(Rate).filter(Rate.metal == "silver", Rate.is_active == True).first()
    )
    return CurrentRates(
        gold=_info(gold) if gold else None,
        silver=_info(silver) if silver else None,
    )


@router.get("/history", response_model=RateHistory)
def rate_history(
    days: int = Query(30, ge=1, le=180), db: Session = Depends(get_db)
):
    cutoff = utcnow() - timedelta(days=days)
    rows = (
        db.query(Rate)
        .filter(Rate.created_at >= cutoff)
        .order_by(Rate.created_at.asc())
        .all()
    )

    latest_per_day = {}
    for r in rows:
        latest_per_day[(r.metal, r.created_at.date())] = r

    buckets = defaultdict(list)
    for (metal, day), r in sorted(latest_per_day.items(), key=lambda kv: kv[0][1]):
        buckets[metal].append(
            RatePoint(date=day.isoformat(), rate_value=float(r.rate_value))
        )

    return RateHistory(gold=buckets["gold"], silver=buckets["silver"])
