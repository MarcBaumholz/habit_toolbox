from fastapi.testclient import TestClient
from app.main import app

def test_register_and_login(tmp_path, monkeypatch):
    # Use temp sqlite
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path}/test.db")
    from app.db import init_db
    init_db()

    client = TestClient(app)

    email = "user@example.com"
    password = "secret123"

    r = client.post("/auth/register", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    assert token

    r2 = client.post("/auth/login", json={"email": email, "password": password})
    assert r2.status_code == 200
    assert r2.json()["access_token"]
