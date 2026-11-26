"""Media storage abstraction.

Supports two backends, selected by ``MEDIA_STORAGE_BACKEND``:

* ``local`` (default) - files are written to ``MEDIA_STORAGE_PATH`` and served
  by the FastAPI app from ``/media``.
* ``supabase`` - files are uploaded to a Supabase Storage bucket and served
  from the bucket's public URL.
"""

import httpx

from app.core.config import settings


def backend() -> str:
    return getattr(settings, "MEDIA_STORAGE_BACKEND", "local") or "local"


def is_supabase() -> bool:
    return backend() == "supabase"


def _local_url(subdir: str, filename: str) -> str:
    return f"{settings.PUBLIC_BASE_URL}/media/{subdir}/{filename}"


def _supabase_public_url(path: str) -> str:
    base = settings.SUPABASE_URL.rstrip("/")
    bucket = settings.SUPABASE_BUCKET
    return f"{base}/storage/v1/object/public/{bucket}/{path}"


def save_media(subdir: str, filename: str, content: bytes, content_type: str | None = None) -> str:
    """Persist ``content`` and return its public URL."""
    if is_supabase():
        path = f"{subdir}/{filename}"
        base = settings.SUPABASE_URL.rstrip("/")
        bucket = settings.SUPABASE_BUCKET
        key = settings.SUPABASE_KEY
        upload_url = f"{base}/storage/v1/object/{bucket}/{path}"
        headers = {
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "x-upsert": "true",
        }
        if content_type:
            headers["Content-Type"] = content_type
        with httpx.Client(timeout=120.0) as client:
            response = client.post(upload_url, headers=headers, content=content)
            response.raise_for_status()
        return _supabase_public_url(path)

    dest_dir = settings.MEDIA_STORAGE_PATH / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    (dest_dir / filename).write_bytes(content)
    return _local_url(subdir, filename)


def delete_media_file(url: str) -> None:
    """Best-effort deletion of the backing file for ``url``."""
    if not url:
        return

    # Supabase URLs
    if is_supabase() and settings.SUPABASE_URL and url.startswith(settings.SUPABASE_URL):
        base = settings.SUPABASE_URL.rstrip("/")
        bucket = settings.SUPABASE_BUCKET
        key = settings.SUPABASE_KEY
        marker_public = f"/storage/v1/object/public/{bucket}/"
        marker_private = f"/storage/v1/object/{bucket}/"
        relative = None
        for marker in (marker_public, marker_private):
            idx = url.find(marker)
            if idx != -1:
                relative = url[idx + len(marker):].split("?", 1)[0]
                break
        if relative:
            delete_url = f"{base}/storage/v1/object/{bucket}/{relative}"
            try:
                with httpx.Client(timeout=60.0) as client:
                    client.delete(
                        delete_url,
                        headers={"Authorization": f"Bearer {key}", "apikey": key},
                    )
            except Exception:
                pass
        return

    # Local files
    marker = "/media/"
    idx = url.find(marker)
    if idx == -1:
        return
    relative = url[idx + len(marker):].split("?", 1)[0]
    root = settings.MEDIA_STORAGE_PATH.resolve()
    try:
        target = (root / relative).resolve()
    except (OSError, ValueError):
        return
    if target.is_relative_to(root) and target.is_file():
        try:
            target.unlink()
        except OSError:
            pass