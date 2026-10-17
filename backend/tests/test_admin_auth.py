API = "/api/v1"


def test_admin_requires_auth(client):
    assert client.get(f"{API}/admin/me").status_code == 401
    assert client.get(f"{API}/admin/ornaments").status_code == 401
    assert client.get(f"{API}/admin/stats").status_code == 401


def test_login_wrong_password(client):
    res = client.post(f"{API}/admin/login", json={"username": "admin", "password": "nope"})
    assert res.status_code == 401


def test_login_unknown_user(client):
    res = client.post(f"{API}/admin/login", json={"username": "ghost", "password": "x"})
    assert res.status_code == 401


def test_login_success_sets_cookie_and_profile(client):
    res = client.post(f"{API}/admin/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200
    body = res.json()
    assert body["username"] == "admin"
    assert "password_hash" not in body

    me = client.get(f"{API}/admin/me")
    assert me.status_code == 200
    assert me.json()["full_name"] == "Test Admin"
    assert "access_token" in client.cookies


def test_logout_clears_session(admin_client):
    assert admin_client.post(f"{API}/admin/logout").status_code == 200
    assert admin_client.get(f"{API}/admin/me").status_code == 401


def test_update_profile(admin_client):
    res = admin_client.put(f"{API}/admin/me", json={"full_name": "Shop Owner"})
    assert res.status_code == 200
    assert res.json()["full_name"] == "Shop Owner"
    assert admin_client.get(f"{API}/admin/me").json()["full_name"] == "Shop Owner"


def test_change_password_flow(admin_client):
    bad = admin_client.post(
        f"{API}/admin/change-password",
        json={"current_password": "wrong", "new_password": "brandnewpass"},
    )
    assert bad.status_code == 400

    ok = admin_client.post(
        f"{API}/admin/change-password",
        json={"current_password": "admin123", "new_password": "brandnewpass"},
    )
    assert ok.status_code == 200

    same = admin_client.post(
        f"{API}/admin/change-password",
        json={"current_password": "brandnewpass", "new_password": "brandnewpass"},
    )
    assert same.status_code == 400

    fresh = admin_client.post(
        f"{API}/admin/login", json={"username": "admin", "password": "brandnewpass"}
    )
    assert fresh.status_code == 200
    old = admin_client.post(
        f"{API}/admin/login", json={"username": "admin", "password": "admin123"}
    )
    assert old.status_code == 401


def test_change_password_requires_auth(client):
    res = client.post(
        f"{API}/admin/change-password",
        json={"current_password": "a", "new_password": "brandnewpass"},
    )
    assert res.status_code == 401


def test_login_rate_limited(client):
    for _ in range(5):
        client.post(f"{API}/admin/login", json={"username": "admin", "password": "nope"})
    res = client.post(f"{API}/admin/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 429


def test_short_new_password_rejected(admin_client):
    res = admin_client.post(
        f"{API}/admin/change-password",
        json={"current_password": "admin123", "new_password": "short"},
    )
    assert res.status_code == 422
