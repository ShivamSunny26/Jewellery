from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.models.models import Enquiry, Ornament
from app.schemas.schemas import EnquiryCreate

router = APIRouter(prefix="/enquiries", tags=["public-enquiries"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_enquiry(
    payload: EnquiryCreate, request: Request, db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    limiter.check(f"enquiry:{client_ip}", limit=5, window_seconds=60)
    if payload.ornament_id is not None:
        ornament = (
            db.query(Ornament)
            .filter(Ornament.id == payload.ornament_id, Ornament.is_visible == True)
            .first()
        )
        if not ornament:
            return {"id": None, "error": "Ornament not found"}
    enquiry = Enquiry(
        ornament_id=payload.ornament_id,
        customer_name=payload.customer_name.strip(),
        customer_phone=payload.customer_phone.strip(),
        message=payload.message,
        status="new",
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return {"id": enquiry.id}
