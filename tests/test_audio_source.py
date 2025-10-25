"""
Tests for supersid.acquisition.audio_source without requiring real hardware.
"""

import numpy as np

from supersid.acquisition.audio_source import AudioConfig, AudioSource


class DummyStream:
    """Fake replacement for sounddevice.InputStream."""

    def __init__(self, *args, **kwargs):
        self.samplerate = kwargs.get("samplerate", 8000)
        self.blocksize = kwargs.get("blocksize", 800)
        self.channels = kwargs.get("channels", 1)
        self.dtype = kwargs.get("dtype", "float32")
        self.active = False
        self._counter = 0

    def __enter__(self):
        self.active = True
        return self

    def __exit__(self, exc_type, exc, tb):
        self.active = False

    def start(self):
        self.active = True
        return self

    def stop(self):
        self.active = False

    def close(self):
        self.active = False

    def read(self, blocksize):
        """Simulate reading a block of audio samples."""
        if self._counter >= 3:
            raise StopIteration
        frame = np.random.randn(blocksize, self.channels).astype(self.dtype)
        self._counter += 1
        return frame, False


def test_audio_source_stream(monkeypatch):
    import supersid.acquisition.audio_source as audio_source

    monkeypatch.setattr(
        audio_source, "sd", type("SD", (), {"InputStream": DummyStream})
    )

    cfg = AudioConfig(sample_rate=8000, chunk_ms=100)
    with AudioSource(cfg) as src:
        frames = []
        for i, (ts, frame) in enumerate(src.stream()):
            frames.append((ts, frame))
            if i >= 2:
                break

    assert len(frames) == 3
    for ts, frame in frames:
        assert isinstance(ts, float)
        assert frame.shape[0] == int(cfg.sample_rate * cfg.chunk_ms / 1000)
