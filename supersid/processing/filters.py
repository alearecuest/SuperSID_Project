"""
VLF filtering module for SuperSID Next.

Provides classes to isolate specific VLF transmitter signals
using band-pass filters.
"""

import numpy as np
from scipy.signal import iirfilter, sosfilt


class VLFChannel:
    """Represents a single VLF channel with a band-pass filter."""

    def __init__(self, name: str, freq: float, bw: float, fs: int):
        """
        Parameters
        ----------
        name : str
            Identifier for the channel (e.g., transmitter code).
        freq : float
            Center frequency of the transmitter in Hz.
        bw : float
            Bandwidth around the center frequency in Hz.
        fs : int
            Sampling rate in Hz.
        """
        lo = max(freq - bw / 2, 10.0)
        hi = freq + bw / 2
        self.name = name
        self.sos = iirfilter(
            N=6, Wn=[lo, hi], btype="band", ftype="butter", fs=fs, output="sos"
        )

    def apply(self, x: np.ndarray) -> np.ndarray:
        """Apply the band-pass filter to the input signal."""
        return sosfilt(self.sos, x)


class VLFChannelBank:
    """A collection of VLF channels to process multiple transmitters."""

    def __init__(self, chans: list[dict], fs: int):
        """
        Parameters
        ----------
        chans : list of dict
            Each dict must contain {"name": str, "freq": float, "bw": float}.
        fs : int
            Sampling rate in Hz.
        """
        self.channels = [VLFChannel(c["name"], c["freq"], c["bw"], fs) for c in chans]

    def apply(self, x: np.ndarray) -> dict[str, np.ndarray]:
        """Apply all filters and return a dict of channel -> filtered signal."""
        return {c.name: c.apply(x) for c in self.channels}
