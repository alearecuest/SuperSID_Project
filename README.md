# SuperSID Next

An open‑source platform for monitoring Sudden Ionospheric Disturbances (SID) using VLF signals.  
This project is a modern re‑implementation of the Stanford Solar Center’s SuperSID system, with a modular backend, real‑time API, and a modern frontend.

## Features
- **Robust acquisition** from sound card or recorded files.
- **Modular signal processing**: band‑pass filters per transmitter, RMS/SNR/variability metrics, event detection.
- **FastAPI backend** with REST and WebSocket endpoints.
- **Modern React frontend** for real‑time dashboards, spectrograms, and event timelines.
- **Data persistence** in Parquet with metadata sidecars and DuckDB catalog.
- **Optional integrations** with NOAA/GOES solar event data and geomagnetic indices.

## Quick Start
1. Install Python 3.11+ and Node.js 18+.
2. Backend:
   ```bash
   uv pip install -e .
   supersid ingest --config supersid/configs/montevideo.toml
   supersid api --data ./data

## Observatory Information
- Official code: **#281**
- Location: Montevideo, Uruguay
- Operator: Alejandro Arévalo
