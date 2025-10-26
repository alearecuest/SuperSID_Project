"""
SuperSID App API server.

Reads configuration from TOML (observatory, audio, processing, channels, data).
Provides endpoints for status, channels, and FFT using real audio acquisition.
"""

import os
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from supersid.utils.config_loader import load_config
from supersid.acquisition.audio_source import AudioConfig, AudioSource


# ----------------------------
# Models
# ----------------------------

class Status(BaseModel):
    running: bool
    data_path: str
    audio_device: Optional[str]
    sample_rate: int
    channels_cfg: int
    chunk_ms: int
    configured_channels: List[str]


# ----------------------------
# App factory
# ----------------------------

def make_app() -> FastAPI:
    BASE_DIR = Path(__file__).resolve().parents[2]

    OBS_CONFIG = BASE_DIR / "supersid" / "configs" / "montevideo.toml"
    TX_CONFIG = BASE_DIR / "supersid" / "configs" / "transmitters.toml"

    cfg = load_config(str(OBS_CONFIG), str(TX_CONFIG))

    # Data path
    data_path = os.getenv("SUPERSID_DATA", cfg.get("data", {}).get("path", "./data"))
    root = Path(data_path)

    # Audio config
    audio_cfg_block = cfg.get("audio", {})
    audio_device = os.getenv("SUPERSID_AUDIO_DEVICE", audio_cfg_block.get("device", "default"))
    sample_rate = int(os.getenv("SUPERSID_SAMPLE_RATE", audio_cfg_block.get("sample_rate", 48000)))
    channels_cfg = int(os.getenv("SUPERSID_AUDIO_CHANNELS", audio_cfg_block.get("channels", 1)))
    chunk_ms = int(os.getenv("SUPERSID_CHUNK_MS", audio_cfg_block.get("chunk_ms", 250)))

    # Channels list (from [[channels]] in TOML)
    configured_channels = [ch["name"] for ch in cfg.get("channels", [])]

    app = FastAPI(title="SuperSID App API")

    @app.get("/status", response_model=Status)
    def status():
        return Status(
            running=True,
            data_path=str(root),
            audio_device=audio_device,
            sample_rate=sample_rate,
            channels_cfg=channels_cfg,
            chunk_ms=chunk_ms,
            configured_channels=configured_channels,
        )

    @app.get("/channels")
    def channels():
        return {"channels": configured_channels}

    def capture_chunk(duration_s: float = 1.0) -> tuple[list[float], int]:
        """
        Capture a single chunk using AudioSource; returns (samples, samplerate).
        """
        audio_cfg = AudioConfig(
            device=audio_device,
            sample_rate=sample_rate,
            channels=channels_cfg,
            chunk_ms=chunk_ms,
        )

        try:
            samples = []
            n_blocks = max(1, int((duration_s * 1000) / audio_cfg.chunk_ms))
            with AudioSource(audio_cfg) as src:
                stream = src.stream()
                for _ in range(n_blocks):
                    ts, frame = next(stream)
                    samples.extend(frame.tolist())
            return samples, audio_cfg.sample_rate
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Audio acquisition unavailable: {e}. "
                       f"Check SUPERSID_AUDIO_DEVICE or [audio] in TOML."
            )

    @app.get("/fft")
    def get_fft(
        channel: str = Query(..., description="Logical transmitter/channel label (e.g., DHO38)"),
        duration_s: float = Query(1.0, ge=0.1, le=5.0, description="Capture duration in seconds"),
        log_scale: bool = Query(False, description="Return magnitude in dB (20*log10)"),
    ):
        """
        Compute FFT from a freshly captured audio chunk.
        Channel is a logical label; acquisition currently uses the system audio input.
        """
        import numpy as np

        samples, samplerate = capture_chunk(duration_s=duration_s)
        x = np.asarray(samples, dtype=np.float32)
        if x.size == 0:
            raise HTTPException(status_code=500, detail="No samples captured.")

        freqs = np.fft.rfftfreq(x.size, d=1.0 / samplerate)
        spectrum = np.abs(np.fft.rfft(x))
        if log_scale:
            spectrum = 20.0 * np.log10(np.maximum(spectrum, 1e-12))
        else:
            m = np.max(spectrum)
            if m > 0:
                spectrum = spectrum / m

        return {
            "channel": channel,
            "samplerate": samplerate,
            "freqs": freqs.tolist(),
            "spectrum": spectrum.tolist(),
        }

    @app.get("/")
    def root_endpoint():
        return {"message": "SuperSID App API running"}

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app
