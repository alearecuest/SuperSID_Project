"""
API server module for SuperSID Next.

Provides a FastAPI application to expose system status,
available channels, and data endpoints.
"""

from fastapi import FastAPI
from pathlib import Path
import duckdb


def make_app(data_path: str) -> FastAPI:
    """
    Create and configure the FastAPI application.

    Parameters
    ----------
    data_path : str
        Path to the root directory where Parquet data is stored.

    Returns
    -------
    FastAPI
        Configured FastAPI application.
    """
    app = FastAPI(title="SuperSID Next API")
    root = Path(data_path)
    db = duckdb.connect(database=":memory:")

    @app.get("/status")
    def status():
        """Return basic system status."""
        return {"running": True, "data_path": str(root)}

    @app.get("/channels")
    def channels():
        """List available channels based on stored features."""
        chans = sorted({p.parent.name for p in root.glob("*/features/*/*")})
        return {"channels": chans}

    @app.get("/features")
    def features(channel: str):
        """
        Placeholder endpoint for features.
        TODO: Implement DuckDB query to return feature data.
        """
        return {"channel": channel, "items": []}

    return app
