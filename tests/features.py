"""
Tests for the feature extraction module.
"""

import numpy as np
from supersid.processing.features import SlidingFeatures


def test_features_computation():
    # Create a simple sine wave with noise
    fs = 1000
    t = np.linspace(0, 1, fs, endpoint=False)
    signal = np.sin(2 * np.pi * 50 * t) + 0.01 * np.random.randn(fs)

    # Wrap in dict as expected by SlidingFeatures
    banded = {"TEST": signal}

    # Window = 200 samples, step = 100
    feats = SlidingFeatures(window_samples=200, step_samples=100)

    result = feats.compute(banded)

    assert "TEST" in result
    f = result["TEST"]

    # RMS should be close to 0.7 (since sine wave RMS = 1/sqrt(2))
    assert np.isclose(f["rms"], 0.7, atol=0.1)

    # MAD should be positive and smaller than RMS
    assert f["mad"] > 0
    assert f["mad"] < f["rms"]

    # SNR should be reasonably high
    assert f["snr"] > 5
