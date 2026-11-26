import os
import tempfile
from pathlib import Path

_TMP = Path(tempfile.mkdtemp(prefix="jewellery_tests_"))
os.environ["DATABASE_URL"] = f"sqlite:///{(_TMP / 'test.db').as_posix()}"
os.environ["MEDIA_STORAGE_PATH"] = str(_TMP / "media")
os.environ["MEDIA_STORAGE_BACKEND"] = "local"
os.environ["PUBLIC_BASE_URL"] = "http://localhost:8000"
os.environ["COOKIE_DOMAIN"] = "localhost"
os.environ["JWT_SECRET"] = "test-secret-do-not-use-in-production"

import pytest
from fastapi.testclient import TestClient

from app.core.database import Base, SessionLocal, engine
from app.core.rate_limit import limiter
from app.core.security import hash_password
from app.models.models import Admin, Category, Ornament, Rate
from main import app

API = "/api/v1"

_ADMIN_HASH = hash_password("admin123")


def _reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.add(
        Admin(
            username="admin",
            password_hash=_ADMIN_HASH,
            full_name="Test Admin",
        )
    )
    cat = Category(name="Rings", slug="rings", display_order=1)
    db.add(cat)
    db.flush()
    db.add(
        Ornament(
            category_id=cat.id,
            name="Gold Solitaire Ring",
            description="A sparkly ring",
            purity="22K",
            approx_weight_grams=4.50,
            is_visible=True,
        )
    )
    db.add(
        Ornament(
            category_id=cat.id,
            name="Silver Band",
            description="Plain silver band",
            purity="925",
            approx_weight_grams=8.00,
            is_visible=False,
        )
    )
    db.add(Rate(metal="gold", rate_value=7185.00, is_active=True))
    db.add(Rate(metal="silver", rate_value=92.50, is_active=True))
    db.commit()
    db.close()
    limiter._hits.clear()


@pytest.fixture()
def client():
    _reset_db()
    return TestClient(app)


@pytest.fixture()
def admin_client(client):
    response = client.post(f"{API}/admin/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200, response.text
    return client


@pytest.fixture()
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
