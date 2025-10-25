"""
Integration test for the CLI ingest command using a simulated AudioSource.
"""

import os
import tempfile

import numpy as np
from click.testing import CliRunner

import supersid.cli as cli


class DummyAudioSource:
    """Simulated AudioSource that yields a few frames and then stops."""

    def __init__(self, cfg):
        self.cfg = cfg

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def stream(self):
        # Yield 3 fake frames of 1 second each
        for i in range(3):
            ts = 1735100000.0 + i
            frame = np.random.randn(self.cfg.sample_rate)
            yield ts, frame


def test_cli_ingest_runs_and_writes(monkeypatch):
    runner = CliRunner()

    # Patch AudioSource to use DummyAudioSource
    monkeypatch.setattr(cli, "AudioSource", DummyAudioSource)

    with tempfile.TemporaryDirectory() as tmpdir:
        result = runner.invoke(
            cli.main,
            ["ingest", "--sample-rate", "96000", "--chunk-ms", "100", "--data", tmpdir],
        )

        # CLI should exit cleanly
        assert result.exit_code == 0, result.output

        # Data directory should contain a date folder
        contents = os.listdir(tmpdir)
        assert any(name.isdigit() for name in contents)  # e.g. "20241225"
        daydir = os.path.join(tmpdir, contents[0])
        assert os.path.isdir(daydir)

        # Signals must exist
        assert "signals" in os.listdir(daydir)

        # Features and events are optional, but if present they must be dirs
        for optional in ["features", "events"]:
            if optional in os.listdir(daydir):
                assert os.path.isdir(os.path.join(daydir, optional))
