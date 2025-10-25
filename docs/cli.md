# SuperSID Next CLI

The SuperSID Next project provides a command-line interface (CLI) to manage data acquisition, analysis, and API serving.

## Main Commands

### `supersid ingest`
Starts data acquisition from the sound card and writes processed data to the configured storage path.

**Options**
- `--duration <seconds>`: run acquisition for a fixed duration.
- `--output <path>`: specify output directory for data files.

---

### `supersid api`
Launches the FastAPI server to expose REST endpoints.

**Options**
- `--host <ip>`: host address (default: 127.0.0.1).
- `--port <port>`: port number (default: 8000).

---

### `supersid analyze`
Runs analysis routines on previously acquired data.

**Options**
- `--input <file>`: path to a Parquet or JSON file.
- `--fft`: compute FFT and generate a spectrogram.
- `--stats`: compute temporal statistics (RMS, MAD, SNR).

---

### `supersid --help`
Displays general help and lists all available commands.

---

## Usage Examples

```bash
# Start acquisition for 60 seconds
supersid ingest --duration 60

# Run the API server on port 9000
supersid api --port 9000

# Analyze a stored dataset and compute FFT
supersid analyze --input data/session1.parquet --fft
