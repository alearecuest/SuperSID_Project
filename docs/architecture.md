# SuperSID Next Architecture

## Overview
1. **Acquisition**: Antenna → sound card → `AudioSource`.
2. **Processing**: Digital filters, feature extraction (RMS, MAD, SNR).
3. **Event detection**: Identification of SIDs and anomalies.
4. **Persistence**: Storage in Parquet + JSON metadata.
5. **API**: FastAPI exposes REST endpoints (`/status`, `/channels`, `/features`, `/data`).
6. **Frontend**: React + Vite + TypeScript for interactive dashboards.

## Main components
- **Backend (Python)**: acquisition, analysis, API.
- **Frontend (React)**: dashboard and visualization.
- **CLI**: ingestion and server commands.
