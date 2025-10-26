"""
API server module for SuperSID App.

Provides a FastAPI application to expose system status,
available channels, and data endpoints.
"""

import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from supersid.utils.config_loader import load_config

def make_app(config_file: str = "./configs/montevideo.toml") -> FastAPI:
    """
    Create and configure the FastAPI application.

    Priority for data path:
    1. Environment variable SUPERSID_DATA
    2. Config file (TOML)
    3. Default ./data
    """
    data_path = os.getenv("SUPERSID_DATA")

    if not data_path and config_file and Path(config_file).exists():
        cfg = load_config(config_file)
        data_path = cfg.get("data", {}).get("path")

    if not data_path:
        data_path = "./data"

    root = Path(data_path)
    app = FastAPI(title="SuperSID App API")

    @app.get("/")
    def root_endpoint():
        return {"message": "SuperSID API running"}

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/status")
    def status():
        return {"running": True, "data_path": str(root)}

    @app.get("/channels")
    def channels():
        chans = sorted({p.parents[2].name for p in root.glob("*/features/*/*")})
        return {"channels": chans}

    @app.get("/features")
    def features(channel: str):
        if not any(root.glob(f"{channel}/features/*/*")):
            return {"channel": channel, "items": []}
        return {"channel": channel, "items": []}

    @app.get("/data")
    def list_data():
        if not root.exists():
            return []
        return os.listdir(root)

    @app.get("/data/{filename}")
    def get_file(filename: str):
        file_path = root / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        return {"filename": filename, "size": file_path.stat().st_size}

    @app.get("/fft")
    def get_fft(channel: str):
        import numpy as np
        samplerate = 48000
        t = np.linspace(0, 1, samplerate)
        samples = np.sin(2 * np.pi * 1000 * t)
        freqs = np.fft.rfftfreq(len(samples), d=1.0/samplerate)
        spectrum = np.abs(np.fft.rfft(samples))
        spectrum = spectrum / np.max(spectrum)
        return {"channel": channel, "freqs": freqs.tolist(), "spectrum": spectrum.tolist()}

    return app
