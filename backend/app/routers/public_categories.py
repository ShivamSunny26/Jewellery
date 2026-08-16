from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Category
from app.schemas.schemas import CategoryOut

router = APIRouter(prefix="/categories", tags=["public-categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return (
        db.query(Category).order_by(Category.display_order, Category.name).all()
    )
