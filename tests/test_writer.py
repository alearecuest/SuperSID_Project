"""
Tests for the persistence ParquetWriter module, without pandas dependency.
"""

import os
import tempfile
from datetime import datetime, timezone

import numpy as np
import pyarrow.parquet as pq

from supersid.persistence.writer import ParquetWriter


def test_parquet_writer_creates_parquet_files():
    # Temporary directory for output
    with tempfile.TemporaryDirectory() as tmpdir:
        # Metadata for the writer
        metadata = {"station": "TEST", "location": "Lab"}
        writer = ParquetWriter(tmpdir, metadata)

        # Dummy data
        ts = 1735100000.0
        banded = {"CH1": np.arange(5)}
        feats = {"CH1": {"rms": 0.5, "mad": 0.1, "snr": 10.0}}
        events = [{"ts": ts, "channel": "CH1", "type": "sid_candidate"}]

        # Write one frame
        writer.write_frame(ts, banded, feats, events)

        # Compute expected day directory dynamically
        daydir = os.path.join(
            tmpdir, datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y%m%d")
        )
        assert os.path.isdir(daydir)

        # Signals parquet
        signals_path = os.path.join(daydir, "signals")
        table = pq.read_table(signals_path)
        # Validate columns exist
        assert set(table.column_names) >= {"ts", "channel", "signal"}
        # Check first row values without pandas
        ts_val = table.column("ts")[0].as_py()
        ch_val = table.column("channel")[0].as_py()
        sig_val = table.column("signal")[0].as_py()
        assert ts_val == ts
        assert ch_val == "CH1"
        assert isinstance(sig_val, list)
        assert sig_val == [0, 1, 2, 3, 4]

        # Features parquet
        features_path = os.path.join(daydir, "features")
        table = pq.read_table(features_path)
        assert set(table.column_names) >= {"ts", "channel", "rms", "mad", "snr"}
        # We wrote one row per channel
        assert table.num_rows == 1
        assert table.column("rms")[0].as_py() == 0.5

        # Events parquet
        events_path = os.path.join(daydir, "events")
        table = pq.read_table(events_path)
        assert set(table.column_names) >= {"ts", "channel", "type"}
        assert table.num_rows == 1
        assert table.column("type")[0].as_py() == "sid_candidate"

        # Metadata sidecar
        meta_path = os.path.join(daydir, "metadata.json")
        assert os.path.exists(meta_path)
