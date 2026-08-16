from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.models import Category, Ornament
from app.schemas.schemas import OrnamentCard, OrnamentDetail

router = APIRouter(prefix="/ornaments", tags=["public-ornaments"])


def _card(o: Ornament, db: Session) -> OrnamentCard:
    thumbnail = None
    for m in o.media:
        if m.media_type == "photo":
            thumbnail = m.url
            break
    return OrnamentCard(
        id=o.id,
        name=o.name,
        category=o.category.name if o.category else "",
        purity=o.purity,
        approx_weight_grams=(
            float(o.approx_weight_grams) if o.approx_weight_grams is not None else None
        ),
        thumbnail_url=thumbnail,
    )


@router.get("", response_model=list[OrnamentCard])
def list_ornaments(
    category: Optional[str] = None, db: Session = Depends(get_db)
):
    q = db.query(Ornament).filter(Ornament.is_visible == True)
    if category:
        cat = db.query(Category).filter(Category.slug == category).first()
        if not cat:
            return []
        q = q.filter(Ornament.category_id == cat.id)
    ornaments = q.options(joinedload(Ornament.media), joinedload(Ornament.category)).all()
    return [_card(o, db) for o in ornaments]


@router.get("/{ornament_id}", response_model=OrnamentDetail)
def get_ornament(ornament_id: int, db: Session = Depends(get_db)):
    o = (
        db.query(Ornament)
        .options(joinedload(Ornament.media), joinedload(Ornament.category))
        .filter(Ornament.id == ornament_id, Ornament.is_visible == True)
        .first()
    )
    if not o:
        raise HTTPException(status_code=404, detail="Ornament not found")
    photos = [m.url for m in o.media if m.media_type == "photo"]
    return OrnamentDetail(
        id=o.id,
        name=o.name,
        category=o.category.name if o.category else "",
        description=o.description,
        purity=o.purity,
        approx_weight_grams=(
            float(o.approx_weight_grams) if o.approx_weight_grams is not None else None
        ),
        making_charge_note=o.making_charge_note,
        model_url=o.model_url,
        photos=photos,
    )
