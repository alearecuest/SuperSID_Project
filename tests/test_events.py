"""
Tests for the event detection module.
"""

from supersid.processing.events import EventDetector


def test_event_detection_triggers_on_change():
    det = EventDetector(sensitivity=1.0)

    # Simulate a stable baseline
    feats = {"TEST": {"rms": 1.0, "mad": 0.1, "snr": 10.0}}
    for _ in range(20):
        events = det.detect(feats)
        assert events == []  # no events during baseline

    # Now simulate a sudden increase in RMS
    feats_high = {"TEST": {"rms": 2.0, "mad": 0.1, "snr": 20.0}}
    events = det.detect(feats_high)

    # Expect at least one event
    assert any(e["channel"] == "TEST" for e in events)


def test_event_detector_updates_baseline():
    det = EventDetector(sensitivity=1.0)

    # Initial baseline
    feats = {"TEST": {"rms": 1.0, "mad": 0.1, "snr": 10.0}}
    det.detect(feats)

    # Slowly increasing RMS may or may not trigger events depending on implementation
    for val in [1.05, 1.1, 1.15, 1.2]:
        feats = {"TEST": {"rms": val, "mad": 0.1, "snr": 10.0}}
        events = det.detect(feats)
        # If events are returned, they must have the expected structure
        for e in events:
            assert "channel" in e
            assert "type" in e
            assert "value" in e
