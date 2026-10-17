from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.models import Admin, Ornament, OrnamentMedia
from app.schemas.admin_schemas import (
    AdminOrnamentCreate,
    AdminOrnamentUpdate,
    VisibilityUpdate,
)
from app.routers.admin_media import delete_media_file

router = APIRouter(
    prefix="/admin/ornaments", tags=["admin-ornaments"], dependencies=[Depends(get_current_admin)]
)


def _out(o: Ornament):
    return {
        "id": o.id,
        "category_id": o.category_id,
        "category": o.category.name if o.category else "",
        "name": o.name,
        "description": o.description,
        "purity": o.purity,
        "approx_weight_grams": (
            float(o.approx_weight_grams) if o.approx_weight_grams is not None else None
        ),
        "making_charge_note": o.making_charge_note,
        "is_visible": o.is_visible,
        "model_url": o.model_url,
        "photos": [m.url for m in o.media if m.media_type == "photo"],
        "media": [
            {"id": m.id, "media_type": m.media_type, "url": m.url, "sort_order": m.sort_order}
            for m in o.media
        ],
    }


@router.get("")
def list_ornaments(
    q: str | None = None,
    visible: bool | None = None,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    query = db.query(Ornament)
    if q:
        term = f"%{q.strip()}%"
        query = query.filter(
            Ornament.name.ilike(term) | Ornament.description.ilike(term)
        )
    if visible is not None:
        query = query.filter(Ornament.is_visible == visible)
    rows = (
        query.options(joinedload(Ornament.media), joinedload(Ornament.category))
        .order_by(Ornament.created_at.desc())
        .limit(min(limit, 500))
        .all()
    )
    return [_out(o) for o in rows]


@router.post("")
def create_ornament(payload: AdminOrnamentCreate, db: Session = Depends(get_db)):
    o = Ornament(**payload.model_dump())
    db.add(o)
    db.commit()
    db.refresh(o)
    return _out(o)


@router.get("/{ornament_id}")
def get_ornament(ornament_id: int, db: Session = Depends(get_db)):
    o = (
        db.query(Ornament)
        .options(joinedload(Ornament.media), joinedload(Ornament.category))
        .filter(Ornament.id == ornament_id)
        .first()
    )
    if not o:
        raise HTTPException(status_code=404, detail="Ornament not found")
    return _out(o)


@router.put("/{ornament_id}")
def update_ornament(
    ornament_id: int, payload: AdminOrnamentUpdate, db: Session = Depends(get_db)
):
    o = db.query(Ornament).filter(Ornament.id == ornament_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Ornament not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(o, k, v)
    db.commit()
    db.refresh(o)
    return _out(o)


@router.patch("/{ornament_id}/visibility")
def set_visibility(
    ornament_id: int, payload: VisibilityUpdate, db: Session = Depends(get_db)
):
    o = db.query(Ornament).filter(Ornament.id == ornament_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Ornament not found")
    o.is_visible = payload.is_visible
    db.commit()
    return {"id": o.id, "is_visible": o.is_visible}


@router.delete("/{ornament_id}")
def delete_ornament(ornament_id: int, db: Session = Depends(get_db)):
    o = (
        db.query(Ornament)
        .options(joinedload(Ornament.media))
        .filter(Ornament.id == ornament_id)
        .first()
    )
    if not o:
        raise HTTPException(status_code=404, detail="Ornament not found")
    media_urls = [m.url for m in o.media]
    db.delete(o)
    db.commit()
    for url in media_urls:
        delete_media_file(url)
    return {"ok": True}
