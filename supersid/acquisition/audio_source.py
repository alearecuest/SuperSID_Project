"""
Audio acquisition module for SuperSID Next.

Provides an AudioSource class to capture audio frames from the system's
sound card using the sounddevice library.
"""

from dataclasses import dataclass
import time
import numpy as np
import sounddevice as sd


@dataclass
class AudioConfig:
    """Configuration for audio acquisition."""
    device: str = "default"
    sample_rate: int = 48000
    channels: int = 1
    chunk_ms: int = 250


class AudioSource:
    """Audio source that streams audio frames from the sound card."""

    def __init__(self, cfg: AudioConfig):
        self.cfg = cfg
        self._stream = sd.InputStream(
            device=cfg.device,
            samplerate=cfg.sample_rate,
            channels=cfg.channels,
            dtype="float32",
            blocksize=int(cfg.sample_rate * cfg.chunk_ms / 1000)
        )

    def __enter__(self):
        self._stream.start()
        return self

    def __exit__(self, exc_type, exc, tb):
        self._stream.stop()
        self._stream.close()

    def stream(self):
        """Generator that yields (timestamp, audio_frame) tuples."""
        blocksize = int(self.cfg.sample_rate * self.cfg.chunk_ms / 1000)
        while True:
            audio, _ = self._stream.read(blocksize)
            ts = time.time()
            yield ts, audio[:, 0]
