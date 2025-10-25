"""
Persistence module for SuperSID Next.

Provides a ParquetWriter class to store signals, features, and events
with associated metadata.
"""

import json
from pathlib import Path
import pyarrow as pa
import pyarrow.parquet as pq
import numpy as np
from datetime import datetime, timezone


class ParquetWriter:
    """Writes signals, features, and events to Parquet datasets."""

    def __init__(self, path: str, metadata: dict):
        """
        Parameters
        ----------
        path : str
            Root directory where data will be stored.
        metadata : dict
            Metadata about the observatory, hardware, and configuration.
        """
        self.root = Path(path)
        self.root.mkdir(parents=True, exist_ok=True)
        self.meta = metadata

    def write_frame(self, ts: float, banded: dict[str, np.ndarray],
                    feats: dict, events: list[dict]):
        """
        Write one frame of data to disk.

        Parameters
        ----------
        ts : float
            Timestamp (epoch seconds).
        banded : dict[str, np.ndarray]
            Filtered signals per channel.
        feats : dict
            Features per channel.
        events : list of dict
            Detected events.
        """
        dt = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y%m%d")
        base = self.root / dt
        base.mkdir(exist_ok=True)

        # Signals: store each channel’s signal as a list in one row
        for name, x in banded.items():
            table = pa.Table.from_pylist([{
                "ts": ts,
                "channel": name,
                "signal": x.tolist()
            }])
            pq.write_to_dataset(table, base / "signals", partition_cols=["channel"])

        # Features
        rows = [{"ts": ts, "channel": n, **f} for n, f in feats.items()]
        if rows:
            table = pa.Table.from_pylist(rows)
            pq.write_to_dataset(table, base / "features", partition_cols=["channel"])

        # Events
        if events:
            table = pa.Table.from_pylist(events)
            pq.write_to_dataset(table, base / "events")

        # Metadata sidecar (once per day)
        sidecar = base / "metadata.json"
        if not sidecar.exists():
            sidecar.write_text(json.dumps(self.meta, indent=2))
