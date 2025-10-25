"""
Tests for supersid.processing.features.
"""

import numpy as np

from supersid.processing import features


def test_rms_known_signal():
    x = np.ones(1000) * 2
    val = features.rms(x)
    assert np.isclose(val, 2.0)


def test_mad_known_signal():
    x = np.ones(1000) * 5
    assert np.isclose(features.mad(x), 0.0)

    y = np.array([1, -1, 1, -1])
    assert np.isclose(features.mad(y), 1.0)


def test_snr_simple_case():
    np.random.seed(0)
    signal = np.sin(np.linspace(0, 2 * np.pi, 1000))
    noise = 0.01 * np.random.randn(1000)
    # x = signal + noise
    val = features.snr(signal, noise)
    assert val > 10


def test_sliding_features_window_and_step():
    x = np.arange(1000).astype(float)
    sf = features.SlidingFeatures(window_samples=100, step_samples=50)
    out = sf.compute({"CH1": x})

    assert "CH1" in out
    ch1_feats = out["CH1"]
    assert "rms" in ch1_feats
    assert "mad" in ch1_feats
    assert "snr" in ch1_feats
    assert ch1_feats["rms"] > 0
