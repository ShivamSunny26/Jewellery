import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.models import Ornament, OrnamentMedia

router = APIRouter(
    prefix="/admin/ornaments",
    tags=["admin-media"],
    dependencies=[Depends(get_current_admin)],
)

ALLOWED_PHOTO = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
ALLOWED_MODEL = {
    "model/gltf-binary": ".glb",
    "model/gltf+json": ".gltf",
}


@router.post("/{ornament_id}/media")
async def upload_media(
    ornament_id: int,
    media_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    o = db.query(Ornament).filter(Ornament.id == ornament_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Ornament not found")

    if media_type == "photo":
        if file.content_type not in ALLOWED_PHOTO:
            raise HTTPException(
                status_code=422, detail="Only JPG, PNG, WEBP images allowed"
            )
        if (file.size or 0) > settings.MAX_PHOTO_MB * 1024 * 1024:
            raise HTTPException(
                status_code=422, detail=f"Photo exceeds {settings.MAX_PHOTO_MB}MB"
            )
        ext = ALLOWED_PHOTO[file.content_type]
        subdir = "photos"
    elif media_type == "model":
        if file.content_type not in ALLOWED_MODEL:
            raise HTTPException(
                status_code=422, detail="Only GLB/glTF 3D models allowed"
            )
        if (file.size or 0) > settings.MAX_MODEL_MB * 1024 * 1024:
            raise HTTPException(
                status_code=422, detail=f"Model exceeds {settings.MAX_MODEL_MB}MB"
            )
        ext = ALLOWED_MODEL[file.content_type]
        subdir = "models"
    else:
        raise HTTPException(status_code=422, detail="media_type must be photo or model")

    filename = f"{uuid.uuid4().hex}{ext}"
    dest_dir = settings.MEDIA_STORAGE_PATH / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / filename

    content = await file.read()
    dest.write_bytes(content)

    public_url = f"{settings.PUBLIC_BASE_URL}/media/{subdir}/{filename}"

    media = OrnamentMedia(
        ornament_id=ornament_id, media_type=media_type, url=public_url
    )
    db.add(media)
    if media_type == "model":
        o.model_url = public_url
    db.commit()
    db.refresh(media)
    return {"id": media.id, "media_type": media.media_type, "url": public_url}


@router.delete("/media/{media_id}")
def delete_media(media_id: int, db: Session = Depends(get_db)):
    media = db.query(OrnamentMedia).filter(OrnamentMedia.id == media_id).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    if media.media_type == "model":
        o = db.query(Ornament).filter(Ornament.id == media.ornament_id).first()
        if o and o.model_url == media.url:
            o.model_url = None
    db.delete(media)
    db.commit()
    return {"ok": True}
