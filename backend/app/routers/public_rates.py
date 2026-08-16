from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Rate
from app.schemas.schemas import CurrentRates, RateInfo

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
