"""
Tests for the API server built with FastAPI.
"""

import tempfile

from fastapi.testclient import TestClient

from supersid.api.server import make_app


def test_api_root_returns_ok():
    with tempfile.TemporaryDirectory() as tmpdir:
        app = make_app(tmpdir)
        client = TestClient(app)

        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "supersid" in data["message"].lower()


def test_api_health_endpoint():
    with tempfile.TemporaryDirectory() as tmpdir:
        app = make_app(tmpdir)
        client = TestClient(app)

        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "ok"


def test_api_data_listing(tmp_path):
    # Create fake data directory
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    (data_dir / "dummy.txt").write_text("hello")

    app = make_app(str(data_dir))
    client = TestClient(app)

    response = client.get("/data")
    assert response.status_code == 200
    files = response.json()
    assert "dummy.txt" in files


def test_api_returns_404_for_missing_file(tmp_path):
    app = make_app(str(tmp_path))
    client = TestClient(app)

    response = client.get("/data/nonexistent.txt")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "File not found"
