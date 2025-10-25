"""
API server module for SuperSID Next.

Provides a FastAPI application to expose system status,
available channels, and data endpoints.
"""

import os
from pathlib import Path

# import duckdb
from fastapi import FastAPI, HTTPException


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
    # db = duckdb.connect(database=":memory:")

    # --- Basic endpoints for health and root ---
    @app.get("/")
    def root_endpoint():
        return {"message": "SuperSID API running"}

    @app.get("/health")
    def health():
        return {"status": "ok"}

    # --- Status endpoint ---
    @app.get("/status")
    def status():
        """Return basic system status."""
        return {"running": True, "data_path": str(root)}

    # --- Channels endpoint ---
    @app.get("/channels")
    def channels():
        """List available channels based on stored features."""
        # Subir dos niveles para obtener el nombre del canal
        chans = sorted({p.parents[2].name for p in root.glob("*/features/*/*")})
        return {"channels": chans}

    # --- Features endpoint ---
    @app.get("/features")
    def features(channel: str):
        """
        Placeholder endpoint for features.
        Returns empty list if no data for the channel.
        """
        if not any(root.glob(f"{channel}/features/*/*")):
            return {"channel": channel, "items": []}
        return {"channel": channel, "items": []}

    # --- Data endpoints ---
    @app.get("/data")
    def list_data():
        """List files in the data directory."""
        if not root.exists():
            return []
        return os.listdir(root)

    @app.get("/data/{filename}")
    def get_file(filename: str):
        """Return metadata for a file, or 404 if missing."""
        file_path = root / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        return {"filename": filename, "size": file_path.stat().st_size}

    return app
