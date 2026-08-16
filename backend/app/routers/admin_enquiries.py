from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.models import Enquiry
from app.schemas.admin_schemas import EnquiryStatusUpdate
from app.schemas.schemas import EnquiryOut

router = APIRouter(
    prefix="/admin/enquiries",
    tags=["admin-enquiries"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("", response_model=list[EnquiryOut])
def list_enquiries(
    status: Optional[str] = None, db: Session = Depends(get_db)
):
    q = db.query(Enquiry).options(joinedload(Enquiry.ornament))
    if status in ("new", "read", "resolved"):
        q = q.filter(Enquiry.status == status)
    rows = q.order_by(Enquiry.created_at.desc()).all()
    out = []
    for e in rows:
        out.append(
            EnquiryOut(
                id=e.id,
                ornament_id=e.ornament_id,
                ornament_name=e.ornament.name if e.ornament else None,
                customer_name=e.customer_name,
                customer_phone=e.customer_phone,
                message=e.message,
                status=e.status,
                created_at=e.created_at,
            )
        )
    return out


@router.patch("/{enquiry_id}")
def update_status(
    enquiry_id: int, payload: EnquiryStatusUpdate, db: Session = Depends(get_db)
):
    e = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    e.status = payload.status
    db.commit()
    return {"id": e.id, "status": e.status}
