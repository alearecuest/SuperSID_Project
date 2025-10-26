# SuperSID App

SuperSID App is a modern, extensible open-source platform for monitoring Sudden Ionospheric Disturbances (SID) using VLF signals. Inspired by the Stanford Solar Center's SuperSID system, it enables observatories worldwide to capture, process, and visualize VLF signals from multiple transmitters, with a modular backend and a modern frontend.

---

## Requirements

- Python 3.11+ (virtual environment recommended)
- Node.js 18+ and npm (for the frontend)
- Dependencies listed in `requirements.txt` and `package.json`

---

## Configuration

Configuration files are located in `supersid/configs/`:
- `montevideo.toml`: local observatory configuration
- `transmitters.toml`: global VLF transmitters catalog

Each observatory can:
- Create its own TOML file in `supersid/configs/`
- Define its channels (`[[channels]]`) and audio parameters
- Use the global `transmitters.toml` catalog to enrich transmitter information

This design allows multiple stations in different countries to use the same codebase efficiently and automatically.

---

## Makefile Commands

### Backend API

- `make api` → Start FastAPI backend at [http://127.0.0.1:8000](http://127.0.0.1:8000)
- `make devices` → List available audio devices

### Frontend UI

- `make ui` → Start frontend (Vite/React) at [http://127.0.0.1:5173](http://127.0.0.1:5173)

### QA and Development

- `make lint` → Run Ruff linter
- `make format` → Format code with Black
- `make test` → Run unit tests
- `make coverage` → Run test coverage report
- `make types` → Type checking with mypy
- `make qa` → Full QA pipeline (lint + format + test + coverage + types)
- `make clean` → Clean caches and temporary files

---

## API Endpoints

- `GET /status` → Backend status and loaded configuration
- `GET /channels` → Configured channel list
- `GET /fft?channel=DHO38` → Real-time FFT for a logical channel
- `GET /health` → Quick health check

---

## Features

- **Robust acquisition** from sound card or recorded files
- **Modular signal processing**: band-pass filters per transmitter, RMS/SNR/variability metrics, event detection
- **FastAPI backend** with REST and WebSocket endpoints
- **Modern React frontend** for real-time dashboards, spectrograms, and event timelines
- **Data persistence** in Parquet with metadata sidecars and DuckDB catalog
- **Optional integrations** with NOAA/GOES solar event data and geomagnetic indices

---

## Quick Start

1. Install Python 3.11+ and Node.js 18+.
2. Install dependencies and run:
    ```bash
    uv pip install -e .
    supersid ingest --config supersid/configs/montevideo.toml
    supersid api --data ./data
    ```
3. Example execution with data in `/path/to/data`:
    ```bash
    export SUPERSID_DATA=/path/to/data
    make api
    ```

---

## Observatory Information

- Official code: **#281**
- Location: Montevideo, Uruguay
- Operator: Alejandro Arévalo

---

## License

MIT License