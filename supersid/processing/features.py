"""
Feature extraction module for SuperSID Next.

Computes basic signal features such as RMS, MAD, and SNR
over sliding windows for each VLF channel.
"""

import numpy as np


class SlidingFeatures:
    """Compute features over sliding windows for multiple channels."""

    def __init__(self, window_samples: int, step_samples: int):
        """
        Parameters
        ----------
        window_samples : int
            Number of samples in each analysis window.
        step_samples : int
            Step size between consecutive windows.
        """
        self.win = window_samples
        self.step = step_samples

    def compute(self, banded: dict[str, np.ndarray]) -> dict[str, dict[str, float]]:
        """
        Compute features for each channel.

        Parameters
        ----------
        banded : dict[str, np.ndarray]
            Dictionary mapping channel name -> filtered signal.

        Returns
        -------
        dict[str, dict[str, float]]
            Features per channel: {"rms": float, "mad": float, "snr": float}
        """
        feats: dict[str, dict[str, float]] = {}
        for name, x in banded.items():
            if len(x) < self.win:
                continue
            w = x[-self.win:]
            rms = float(np.sqrt(np.mean(w**2)))
            mad = float(np.median(np.abs(w - np.median(w))))
            snr = float(rms / (mad + 1e-6))
            feats[name] = {"rms": rms, "mad": mad, "snr": snr}
        return feats
