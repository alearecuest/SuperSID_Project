"""
Command Line Interface (CLI) for SuperSID Next.

Provides entry points to run acquisition and API server from the terminal.
"""

import argparse
import uvicorn

from supersid.acquisition.audio_source import AudioSource, AudioConfig
from supersid.processing.filters import VLFChannelBank
from supersid.processing.features import SlidingFeatures
from supersid.processing.events import EventDetector
from supersid.persistence.writer import ParquetWriter
from supersid.api.server import make_app


def main():
    parser = argparse.ArgumentParser(prog="supersid", description="SuperSID Next CLI")
    sub = parser.add_subparsers(dest="cmd")

    # Ingest command
    ingest = sub.add_parser("ingest", help="Start acquisition and data recording")
    ingest.add_argument("--sample-rate", type=int, default=48000, help="Sampling rate in Hz")
    ingest.add_argument("--chunk-ms", type=int, default=250, help="Chunk size in milliseconds")
    ingest.add_argument("--data", type=str, default="./data", help="Path to store data")

    # API command
    api = sub.add_parser("api", help="Start API server")
    api.add_argument("--data", type=str, default="./data", help="Path to data directory")
    api.add_argument("--host", type=str, default="127.0.0.1", help="Host address")
    api.add_argument("--port", type=int, default=8000, help="Port number")

    args = parser.parse_args()

    if args.cmd == "ingest":
        cfg = AudioConfig(sample_rate=args.sample_rate, chunk_ms=args.chunk_ms)
        chans = VLFChannelBank([
            {"name": "DHO38", "freq": 38300, "bw": 40},
            {"name": "GQD22", "freq": 22000, "bw": 40},
        ], fs=cfg.sample_rate)
        feats = SlidingFeatures(window_samples=int(cfg.sample_rate * 5),
                                step_samples=int(cfg.sample_rate * 1))
        det = EventDetector(sensitivity=0.8)
        writer = ParquetWriter(args.data, metadata={"observatory_code": "#281", "operator": "Alejandro Arévalo"})

        with AudioSource(cfg) as src:
            for ts, frame in src.stream():
                banded = chans.apply(frame)
                f = feats.compute(banded)
                events = det.detect(f)
                writer.write_frame(ts, banded, f, events)

    elif args.cmd == "api":
        app = make_app(args.data)
        uvicorn.run(app, host=args.host, port=args.port)

    else:
        parser.print_help()
