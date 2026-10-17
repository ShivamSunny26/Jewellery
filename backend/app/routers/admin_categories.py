import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.models import Category, Ornament
from app.schemas.admin_schemas import AdminCategoryCreate, AdminCategoryUpdate

router = APIRouter(
    prefix="/admin/categories",
    tags=["admin-categories"],
    dependencies=[Depends(get_current_admin)],
)


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "category"


@router.get("")
def list_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category).order_by(Category.display_order, Category.name).all()
    )


@router.post("")
def create_category(payload: AdminCategoryCreate, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Category name already exists")
    slug = payload.slug or _slugify(payload.name)
    if db.query(Category).filter(Category.slug == slug).first():
        slug = _slugify(payload.name) + "-" + str(payload.display_order)
    cat = Category(
        name=payload.name, slug=slug, display_order=payload.display_order
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{category_id}")
def update_category(
    category_id: int, payload: AdminCategoryUpdate, db: Session = Depends(get_db)
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    count = db.query(Ornament).filter(Ornament.category_id == category_id).count()
    if count > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category with ornaments. Move or delete ornaments first.",
        )
    db.delete(cat)
    db.commit()
    return {"ok": True}
