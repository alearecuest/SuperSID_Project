from fastapi.testclient import TestClient

from supersid.api.server import make_app


def test_features_endpoint_with_nonexistent_channel(tmp_path):
    app = make_app(str(tmp_path))
    client = TestClient(app)

    response = client.get("/features", params={"channel": "NOPE"})
    assert response.status_code == 200
    data = response.json()
    assert data["channel"] == "NOPE"
    assert data["items"] == []
