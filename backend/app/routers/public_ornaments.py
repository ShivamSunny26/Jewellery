import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.models import Category, Ornament
from app.schemas.schemas import OrnamentCard, OrnamentDetail, OrnamentList

router = APIRouter(prefix="/ornaments", tags=["public-ornaments"])

SORT_OPTIONS = {
    "newest": (Ornament.created_at.desc(), Ornament.id.desc()),
    "oldest": (Ornament.created_at.asc(), Ornament.id.asc()),
    "name": (Ornament.name.asc(),),
    "weight_asc": (Ornament.approx_weight_grams.asc(), Ornament.id.asc()),
    "weight_desc": (Ornament.approx_weight_grams.desc(), Ornament.id.desc()),
}


def _card(o: Ornament) -> OrnamentCard:
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


@router.get("/purities", response_model=list[str])
def list_purities(db: Session = Depends(get_db)):
    rows = (
        db.query(Ornament.purity)
        .filter(Ornament.is_visible == True, Ornament.purity.isnot(None))
        .distinct()
        .all()
    )
    return sorted({r[0].strip() for r in rows if r[0] and r[0].strip()})


@router.get("", response_model=OrnamentList)
def list_ornaments(
    category: Optional[str] = None,
    q: Optional[str] = None,
    purity: Optional[str] = None,
    sort: str = Query("newest", pattern="^(newest|oldest|name|weight_asc|weight_desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=60),
    db: Session = Depends(get_db),
):
    query = db.query(Ornament).filter(Ornament.is_visible == True)

    if category:
        cat = db.query(Category).filter(Category.slug == category).first()
        if not cat:
            return OrnamentList(items=[], total=0, page=page, page_size=page_size, pages=0)
        query = query.filter(Ornament.category_id == cat.id)

    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            Ornament.name.ilike(term) | Ornament.description.ilike(term)
        )

    if purity:
        query = query.filter(Ornament.purity.ilike(purity.strip()))

    total = query.count()
    pages = math.ceil(total / page_size) if total else 0
    rows = (
        query.options(joinedload(Ornament.media), joinedload(Ornament.category))
        .order_by(*SORT_OPTIONS[sort])
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return OrnamentList(
        items=[_card(o) for o in rows],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


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
