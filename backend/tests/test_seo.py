API = "/api/v1"


def test_robots_txt(client):
    res = client.get("/robots.txt")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/plain")
    assert "Disallow: /api/" in res.text
    assert "Sitemap: http://localhost:8000/sitemap.xml" in res.text


def test_sitemap_xml(client):
    res = client.get("/sitemap.xml")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("application/xml")
    body = res.text
    assert "<urlset" in body
    assert "<loc>http://localhost:8000/</loc>" in body
    assert "<loc>http://localhost:8000/category/rings</loc>" in body
    assert "<loc>http://localhost:8000/ornament/1</loc>" in body
    assert "<loc>http://localhost:8000/rates</loc>" in body


def test_sitemap_excludes_hidden_ornaments(client):
    from app.core.database import SessionLocal
    from app.models.models import Ornament

    db = SessionLocal()
    hidden = db.query(Ornament).filter(Ornament.is_visible == False).first()
    db.close()
    body = client.get("/sitemap.xml").text
    assert f"/ornament/{hidden.id}</loc>" not in body
