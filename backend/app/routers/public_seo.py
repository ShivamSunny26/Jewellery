from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.timeutils import utcnow
from app.models.models import Category, Ornament

router = APIRouter(tags=["seo"])

ROBOTS_TEMPLATE = """User-agent: *
Disallow: /admin
Disallow: /api/
Allow: /

Sitemap: {base}/sitemap.xml
"""


@router.get("/robots.txt")
def robots_txt():
    return Response(
        content=ROBOTS_TEMPLATE.format(base=settings.PUBLIC_BASE_URL.rstrip("/")),
        media_type="text/plain",
    )


@router.get("/sitemap.xml")
def sitemap_xml(db: Session = Depends(get_db)):
    base = settings.PUBLIC_BASE_URL.rstrip("/")
    paths = ["/", "/rates", "/store", "/enquire"]
    paths += [
        f"/category/{c.slug}"
        for c in db.query(Category).order_by(Category.display_order, Category.name).all()
    ]
    paths += [
        f"/ornament/{o.id}"
        for o in db.query(Ornament.id).filter(Ornament.is_visible == True).all()
    ]
    today = utcnow().date().isoformat()
    entries = "\n".join(
        f"  <url>\n    <loc>{base}{path}</loc>\n    <lastmod>{today}</lastmod>\n  </url>"
        for path in paths
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{entries}\n"
        "</urlset>\n"
    )
    return Response(content=xml, media_type="application/xml")
