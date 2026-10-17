from app.core.database import SessionLocal
from app.models.models import Ornament

API = "/api/v1"


def _visible_ids(client):
    return [o["id"] for o in client.get(f"{API}/ornaments").json()["items"]]


def _add_ornaments(specs):
    db = SessionLocal()
    ids = []
    try:
        for spec in specs:
            ornament = Ornament(category_id=1, **spec)
            db.add(ornament)
            db.flush()
            ids.append(ornament.id)
        db.commit()
    finally:
        db.close()
    return ids


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_categories_list(client):
    body = client.get(f"{API}/categories").json()
    assert [c["slug"] for c in body] == ["rings"]


def test_ornaments_returns_paginated_envelope(client):
    body = client.get(f"{API}/ornaments").json()
    assert set(body) == {"items", "total", "page", "page_size", "pages"}
    assert body["total"] == 1
    assert body["pages"] == 1
    assert body["items"][0]["name"] == "Gold Solitaire Ring"


def test_ornaments_excludes_hidden_pieces(client):
    db = SessionLocal()
    hidden = db.query(Ornament).filter(Ornament.is_visible == False).first()
    db.close()
    assert hidden.id not in _visible_ids(client)
    assert client.get(f"{API}/ornaments/{hidden.id}").status_code == 404


def test_ornaments_search_by_name(client):
    body = client.get(f"{API}/ornaments", params={"q": "solitaire"}).json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Gold Solitaire Ring"

    empty = client.get(f"{API}/ornaments", params={"q": "bracelet"}).json()
    assert empty["total"] == 0
    assert empty["items"] == []


def test_ornaments_search_by_description(client):
    body = client.get(f"{API}/ornaments", params={"q": "sparkly"}).json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Gold Solitaire Ring"


def test_ornaments_filter_by_purity(client):
    body = client.get(f"{API}/ornaments", params={"purity": "22k"}).json()
    assert body["total"] == 1
    assert body["items"][0]["purity"] == "22K"


def test_ornaments_filter_by_unknown_category(client):
    body = client.get(f"{API}/ornaments", params={"category": "nope"}).json()
    assert body == {"items": [], "total": 0, "page": 1, "page_size": 12, "pages": 0}


def test_ornaments_sort_by_name(client):
    _add_ornaments([{"name": "Zeta"}, {"name": "Alpha"}])
    names = [
        o["name"]
        for o in client.get(f"{API}/ornaments", params={"sort": "name"}).json()["items"]
    ]
    assert names == sorted(names)


def test_ornaments_sort_by_weight_desc(client):
    _add_ornaments(
        [
            {"name": "Light", "approx_weight_grams": 1.0},
            {"name": "Heavy", "approx_weight_grams": 20.0},
        ]
    )
    weights = [
        o["approx_weight_grams"]
        for o in client.get(
            f"{API}/ornaments", params={"sort": "weight_desc"}
        ).json()["items"]
    ]
    assert weights == sorted(weights, reverse=True)
    assert weights[0] == 20.0


def test_ornaments_pagination(client):
    _add_ornaments([{"name": f"Piece {i}"} for i in range(5)])
    page1 = client.get(f"{API}/ornaments", params={"page": 1, "page_size": 3}).json()
    page2 = client.get(f"{API}/ornaments", params={"page": 2, "page_size": 3}).json()
    assert page1["total"] == 6
    assert page1["pages"] == 2
    assert len(page1["items"]) == 3
    assert len(page2["items"]) == 3
    assert {o["id"] for o in page1["items"]}.isdisjoint(
        {o["id"] for o in page2["items"]}
    )


def test_invalid_params_rejected(client):
    assert client.get(f"{API}/ornaments", params={"sort": "hack"}).status_code == 422
    assert client.get(f"{API}/ornaments", params={"page": 0}).status_code == 422
    assert client.get(f"{API}/ornaments", params={"page_size": 999}).status_code == 422


def test_purities_endpoint(client):
    assert client.get(f"{API}/ornaments/purities").json() == ["22K"]
    _add_ornaments([{"name": "Silver Chain", "purity": "925", "is_visible": True}])
    assert client.get(f"{API}/ornaments/purities").json() == ["22K", "925"]


def test_ornament_detail_and_missing(client):
    ok = client.get(f"{API}/ornaments/1")
    assert ok.status_code == 200
    assert ok.json()["category"] == "Rings"
    assert client.get(f"{API}/ornaments/9999").status_code == 404


def test_current_rates(client):
    body = client.get(f"{API}/rates/current").json()
    assert body["gold"]["rate_value"] == 7185.0
    assert body["silver"]["rate_value"] == 92.5


def test_rate_history_shape(client):
    body = client.get(f"{API}/rates/history", params={"days": 30}).json()
    assert set(body) == {"gold", "silver"}
    assert len(body["gold"]) == 1
    assert body["gold"][0]["rate_value"] == 7185.0
    assert client.get(f"{API}/rates/history", params={"days": 0}).status_code == 422


def test_enquiry_created(client):
    res = client.post(
        f"{API}/enquiries",
        json={
            "customer_name": "Riya",
            "customer_phone": "9876543210",
            "ornament_id": 1,
        },
    )
    assert res.status_code == 201
    assert res.json()["id"]


def test_enquiry_unknown_ornament_is_404(client):
    res = client.post(
        f"{API}/enquiries",
        json={
            "customer_name": "Riya",
            "customer_phone": "9876543210",
            "ornament_id": 4242,
        },
    )
    assert res.status_code == 404


def test_enquiry_validation(client):
    res = client.post(
        f"{API}/enquiries", json={"customer_name": "", "customer_phone": "1"}
    )
    assert res.status_code == 422
