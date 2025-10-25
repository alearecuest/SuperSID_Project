"""
Tests for the VLF filtering module.
"""

import numpy as np

from supersid.processing.filters import VLFChannel, VLFChannelBank


def test_vlfchannel_filters_in_band_signal():
    fs = 1000  # sample rate
    t = np.linspace(0, 1, fs, endpoint=False)

    # In-band signal: 50 Hz
    sig_in = np.sin(2 * np.pi * 50 * t)
    # Out-of-band signal: 200 Hz
    sig_out = np.sin(2 * np.pi * 200 * t)

    # Combined signal
    signal = sig_in + sig_out

    # Create a VLF channel centered at 50 Hz with 20 Hz bandwidth
    chan = VLFChannel(name="TEST", freq=50, bw=20, fs=fs)
    filtered = chan.apply(signal)

    # Correlation with in-band component should be high
    corr = np.corrcoef(filtered, sig_in)[0, 1]
    assert corr > 0.7


def test_vlfchannelbank_applies_multiple_channels():
    fs = 1000
    t = np.linspace(0, 1, fs, endpoint=False)
    signal = np.sin(2 * np.pi * 50 * t) + np.sin(2 * np.pi * 200 * t)

    chans = [
        {"name": "CH50", "freq": 50, "bw": 20},
        {"name": "CH200", "freq": 200, "bw": 20},
    ]
    bank = VLFChannelBank(chans, fs=fs)
    outputs = bank.apply(signal)

    # Both channels should be present
    assert "CH50" in outputs
    assert "CH200" in outputs

    # Each output should correlate with its target frequency
    corr_50 = np.corrcoef(outputs["CH50"], np.sin(2 * np.pi * 50 * t))[0, 1]
    corr_200 = np.corrcoef(outputs["CH200"], np.sin(2 * np.pi * 200 * t))[0, 1]

    assert corr_50 > 0.7
    assert corr_200 > 0.7
