API = "/api/v1"

PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
    b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


def test_stats_requires_auth(client):
    assert client.get(f"{API}/admin/stats").status_code == 401


def test_stats_shape(admin_client):
    body = admin_client.get(f"{API}/admin/stats").json()
    assert body["ornaments"] == {"total": 2, "visible": 1, "hidden": 1}
    assert body["categories"] == 1
    assert body["media"] == {"photos": 0, "models": 0}
    assert body["enquiries"]["total"] == 0
    assert body["rates"]["gold"]["rate_value"] == 7185.0
    assert len(body["enquiries_per_day"]) == 30
    assert body["top_categories"][0] == {"name": "Rings", "count": 2}


def test_stats_reflects_enquiries(admin_client):
    admin_client.post(
        f"{API}/enquiries",
        json={"customer_name": "A", "customer_phone": "9876543210", "ornament_id": 1},
    )
    body = admin_client.get(f"{API}/admin/stats").json()
    assert body["enquiries"]["new"] == 1
    assert body["enquiries_per_day"][-1]["count"] == 1
    assert body["recent_enquiries"][0]["customer_name"] == "A"
    assert body["recent_enquiries"][0]["ornament_name"] == "Gold Solitaire Ring"


def test_category_crud(admin_client):
    created = admin_client.post(
        f"{API}/admin/categories", json={"name": "Pendants"}
    )
    assert created.status_code == 200
    assert created.json()["slug"] == "pendants"

    duplicate = admin_client.post(
        f"{API}/admin/categories", json={"name": "Pendants"}
    )
    assert duplicate.status_code == 400

    renamed = admin_client.put(
        f"{API}/admin/categories/{created.json()['id']}", json={"name": "Lockets"}
    )
    assert renamed.status_code == 200
    assert renamed.json()["name"] == "Lockets"

    delete = admin_client.delete(f"{API}/admin/categories/{created.json()['id']}")
    assert delete.status_code == 200


def test_cannot_delete_category_with_ornaments(admin_client):
    res = admin_client.delete(f"{API}/admin/categories/1")
    assert res.status_code == 400
    assert "ornaments" in res.json()["detail"]


def test_ornament_crud(admin_client):
    created = admin_client.post(
        f"{API}/admin/ornaments",
        json={
            "category_id": 1,
            "name": "Diamond Pendant",
            "purity": "18K",
            "approx_weight_grams": 3.2,
        },
    )
    assert created.status_code == 200
    ornament_id = created.json()["id"]
    assert created.json()["is_visible"] is True

    updated = admin_client.put(
        f"{API}/admin/ornaments/{ornament_id}",
        json={"description": "Updated description"},
    )
    assert updated.status_code == 200
    assert updated.json()["description"] == "Updated description"

    hidden = admin_client.patch(
        f"{API}/admin/ornaments/{ornament_id}/visibility", json={"is_visible": False}
    )
    assert hidden.status_code == 200
    assert hidden.json()["is_visible"] is False

    assert admin_client.get(f"{API}/admin/ornaments/{ornament_id}").status_code == 200
    assert admin_client.delete(f"{API}/admin/ornaments/{ornament_id}").status_code == 200
    assert admin_client.get(f"{API}/admin/ornaments/{ornament_id}").status_code == 404


def test_admin_ornament_search(admin_client):
    admin_client.post(
        f"{API}/admin/ornaments", json={"category_id": 1, "name": "Choker"}
    )
    body = admin_client.get(f"{API}/admin/ornaments", params={"q": "chok"}).json()
    assert [o["name"] for o in body] == ["Choker"]

    visible = admin_client.get(f"{API}/admin/ornaments", params={"visible": "true"}).json()
    assert all(o["is_visible"] for o in visible)
    assert {o["name"] for o in visible} == {"Gold Solitaire Ring", "Choker"}

    hidden = admin_client.get(f"{API}/admin/ornaments", params={"visible": "false"}).json()
    assert [o["name"] for o in hidden] == ["Silver Band"]


def test_media_upload_and_delete_removes_file(admin_client, db):
    res = admin_client.post(
        f"{API}/admin/ornaments/1/media",
        data={"media_type": "photo"},
        files={"file": ("photo.png", PNG, "image/png")},
    )
    assert res.status_code == 200, res.text
    media = res.json()
    assert media["url"].endswith(".png")

    from app.core.config import settings

    path = settings.MEDIA_STORAGE_PATH / "photos" / media["url"].rsplit("/", 1)[-1]
    assert path.is_file()

    delete = admin_client.delete(f"{API}/admin/media/{media['id']}")
    assert delete.status_code == 200, delete.text
    assert not path.exists()


def test_media_rejects_bad_type(admin_client):
    res = admin_client.post(
        f"{API}/admin/ornaments/1/media",
        data={"media_type": "photo"},
        files={"file": ("bad.exe", b"MZ....", "application/x-msdownload")},
    )
    assert res.status_code == 422


def test_delete_ornament_cascades_media_files(admin_client):
    res = admin_client.post(
        f"{API}/admin/ornaments/1/media",
        data={"media_type": "photo"},
        files={"file": ("photo.png", PNG, "image/png")},
    )
    media = res.json()

    from app.core.config import settings

    path = settings.MEDIA_STORAGE_PATH / "photos" / media["url"].rsplit("/", 1)[-1]
    assert path.is_file()

    assert admin_client.delete(f"{API}/admin/ornaments/1").status_code == 200
    assert not path.exists()


def test_rates_set_and_history(admin_client):
    set_rate = admin_client.post(
        f"{API}/admin/rates", json={"metal": "gold", "rate_value": 7300.0}
    )
    assert set_rate.status_code == 200
    assert set_rate.json()["is_active"] is True

    current = admin_client.get(f"{API}/rates/current").json()
    assert current["gold"]["rate_value"] == 7300.0

    history = admin_client.get(f"{API}/admin/rates/history", params={"metal": "gold"}).json()
    assert len(history) == 2
    assert history[0]["rate_value"] == 7300.0
    assert history[0]["is_active"] is True
    assert history[1]["is_active"] is False


def test_enquiry_list_and_status_update(admin_client):
    admin_client.post(
        f"{API}/enquiries",
        json={"customer_name": "Neha", "customer_phone": "9876543210", "ornament_id": 1},
    )
    listing = admin_client.get(f"{API}/admin/enquiries").json()
    assert len(listing) == 1
    enquiry = listing[0]
    assert enquiry["ornament_name"] == "Gold Solitaire Ring"

    patched = admin_client.patch(
        f"{API}/admin/enquiries/{enquiry['id']}", json={"status": "resolved"}
    )
    assert patched.json()["status"] == "resolved"

    filtered = admin_client.get(
        f"{API}/admin/enquiries", params={"status": "resolved"}
    ).json()
    assert len(filtered) == 1

    assert admin_client.patch(
        f"{API}/admin/enquiries/9999", json={"status": "read"}
    ).status_code == 404


def test_enquiry_rate_limited(client):
    payload = {
        "customer_name": "Spam",
        "customer_phone": "9876543210",
        "ornament_id": 1,
    }
    for _ in range(5):
        assert client.post(f"{API}/enquiries", json=payload).status_code == 201
    assert client.post(f"{API}/enquiries", json=payload).status_code == 429
