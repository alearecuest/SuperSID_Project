"""
Additional tests for supersid.api.server endpoints.
"""

from fastapi.testclient import TestClient

from supersid.api.server import make_app


def test_status_endpoint(tmp_path):
    app = make_app(str(tmp_path))
    client = TestClient(app)

    response = client.get("/status")
    assert response.status_code == 200
    data = response.json()
    assert data["running"] is True
    assert data["data_path"] == str(tmp_path)


def test_channels_endpoint(tmp_path):
    ch_dir = tmp_path / "CH1" / "features" / "subdir"
    ch_dir.mkdir(parents=True)
    (ch_dir / "dummy.parquet").write_text("fake")

    app = make_app(str(tmp_path))
    client = TestClient(app)

    response = client.get("/channels")
    assert response.status_code == 200
    data = response.json()
    assert "channels" in data
    assert "CH1" in data["channels"]


def test_features_endpoint_placeholder(tmp_path):
    app = make_app(str(tmp_path))
    client = TestClient(app)

    response = client.get("/features", params={"channel": "CH1"})
    assert response.status_code == 200
    data = response.json()
    assert data["channel"] == "CH1"
    assert isinstance(data["items"], list)
