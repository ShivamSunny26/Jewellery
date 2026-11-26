import uuid
from pathlib import Path

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.storage import save_media
from app.core.security import hash_password
from app.models.models import Admin, Category, Enquiry, Ornament, OrnamentMedia, Rate

BASE = settings.PUBLIC_BASE_URL

CATEGORIES = [
    ("Rings", 1),
    ("Necklaces", 2),
    ("Bangles", 3),
    ("Earrings", 4),
    ("Bridal Sets", 5),
]

ORNAMENTS = [
    {
        "name": "Temple Gold Necklace",
        "category": "Necklaces",
        "purity": "22K",
        "weight": 24.5,
        "desc": "Handcrafted temple-style necklace with intricate goddess motifs, ideal for festive and bridal occasions.",
        "making": "Making charges applicable, ask in store",
        "visible": True,
    },
    {
        "name": "Classic Gold Bangle",
        "category": "Bangles",
        "purity": "22K",
        "weight": 18.0,
        "desc": "Timeless smooth gold bangle with a subtle floral engraving. Sold as a pair.",
        "making": "Making charges applicable, ask in store",
        "visible": True,
    },
    {
        "name": "Antique Jhumka Earrings",
        "category": "Earrings",
        "purity": "22K",
        "weight": 12.5,
        "desc": "Antique-finish jhumka earrings with delicate pearl drops and traditional detailing.",
        "making": "Making charges applicable, ask in store",
        "visible": True,
    },
    {
        "name": "Diamond Solitaire Ring",
        "category": "Rings",
        "purity": "18K",
        "weight": 3.2,
        "desc": "Elegant solitaire ring set in 18K gold with a certified diamond centre stone.",
        "making": "Making charges applicable, ask in store",
        "visible": True,
    },
    {
        "name": "Bridal Set with Necklace & Earrings",
        "category": "Bridal Sets",
        "purity": "22K",
        "weight": 42.0,
        "desc": "Complete bridal set featuring matching necklace, earrings and maang tikka in rich gold finish.",
        "making": "Making charges applicable, ask in store",
        "visible": True,
    },
    {
        "name": "Silver Filigree Pendant",
        "category": "Necklaces",
        "purity": "92.5 Silver",
        "weight": 15.0,
        "desc": "Delicate silver filigree pendant crafted by hand with fine, airy detailing.",
        "making": "Making charges applicable, ask in store",
        "visible": True,
    },
]


def make_placeholder(subdir: str, label: str, color: str) -> str:
    name = f"{uuid.uuid4().hex}.svg"
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
  <rect width="600" height="600" fill="{color}"/>
  <text x="300" y="290" font-family="Georgia, serif" font-size="30" fill="#F5EFE6" text-anchor="middle">{label}</text>
  <text x="300" y="330" font-family="Arial" font-size="18" fill="#E5C158" text-anchor="middle">Shree Om Jwellers</text>
  <text x="300" y="365" font-family="Arial" font-size="12" fill="#8A7A5A" text-anchor="middle">© 2026 Shivam@</text>
</svg>"""
    return save_media(subdir, name, svg.encode("utf-8"), "image/svg+xml")


def _populate(db):
    admin = Admin(
        username="admin",
        password_hash=hash_password("admin123"),
        full_name="Shop Owner",
    )
    db.add(admin)
    db.commit()

    admin1 = Admin(
        username="admin1",
        password_hash=hash_password("admin123"),
        full_name="Admin One",
    )
    db.add(admin1)
    db.commit()

    slug_map = {}
    for name, order in CATEGORIES:
        slug = name.lower().replace(" ", "-")
        cat = Category(name=name, slug=slug, display_order=order)
        db.add(cat)
        slug_map[name] = cat
    db.commit()

    for item in ORNAMENTS:
        cat = slug_map[item["category"]]
        o = Ornament(
            category_id=cat.id,
            name=item["name"],
            description=item["desc"],
            purity=item["purity"],
            approx_weight_grams=item["weight"],
            making_charge_note=item["making"],
            is_visible=item["visible"],
            model_url=None,
        )
        db.add(o)
        db.flush()
        photo = make_placeholder("photos", item["name"], "#1A1210")
        db.add(
            OrnamentMedia(
                ornament_id=o.id, media_type="photo", url=photo, sort_order=0
            )
        )
    db.commit()

    db.add(
        Rate(
            metal="gold",
            rate_value=7185.00,
            unit="per gram",
            purity_reference="22K",
            is_active=True,
            set_by_admin_id=admin.id,
        )
    )
    db.add(
        Rate(
            metal="silver",
            rate_value=92.50,
            unit="per gram",
            purity_reference="92.5",
            is_active=True,
            set_by_admin_id=admin.id,
        )
    )
    db.commit()

    first_ornament = db.query(Ornament).first()
    db.add(
        Enquiry(
            ornament_id=first_ornament.id if first_ornament else None,
            customer_name="Riya Shah",
            customer_phone="9876543210",
            message="Is this available in 18K as well?",
            status="new",
        )
    )
    db.commit()
    db.close()
    print("Seed complete.")
    print("Admin login: admin / admin123")


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _populate(db)
    finally:
        db.close()


def seed_if_empty():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Admin).first() is not None:
            print("Database already has data — skipping auto-seed.")
            return
        _populate(db)
        print("Auto-seed complete. Admin login: admin / admin123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
