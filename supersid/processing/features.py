"""
Feature extraction utilities for SuperSID Next.

Provides basic statistical features (RMS, MAD, SNR) and a class
for computing them over sliding windows.
"""

import numpy as np


def rms(x: np.ndarray) -> float:
    """Root Mean Square of a signal."""
    return float(np.sqrt(np.mean(np.square(x))))


def mad(x: np.ndarray) -> float:
    """Mean Absolute Deviation of a signal."""
    return float(np.mean(np.abs(x - np.mean(x))))


def snr(signal: np.ndarray, noise: np.ndarray) -> float:
    """Signal-to-Noise Ratio in dB."""
    p_signal = np.mean(signal**2)
    p_noise = np.mean(noise**2)
    return 10 * np.log10(p_signal / p_noise) if p_noise > 0 else float("inf")


class SlidingFeatures:
    """
    Compute features over sliding windows for multiple channels.
    """

    def __init__(self, window_samples: int, step_samples: int):
        self.window_samples = window_samples
        self.step_samples = step_samples

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
            if len(x) < self.window_samples:
                continue
            window = x[-self.window_samples :]
            feats[name] = {
                "rms": rms(window),
                "mad": mad(window),
                "snr": snr(
                    window,
                    (
                        x[: -self.window_samples]
                        if len(x) > self.window_samples
                        else np.zeros_like(window)
                    ),
                ),
            }
        return feats
