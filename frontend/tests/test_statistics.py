import pandas as pd
from analysis.sid_statistics import detect_sid_events

def test_detect_sid_events():
    df = pd.DataFrame({
        "timestamp": pd.date_range("2025-01-01", periods=5, freq="T"),
        "signal": [0.2, 0.7, 0.6, 0.3, 0.8]
    })
    events_df = detect_sid_events(df, threshold=0.5)
    assert len(events_df) >= 1, "Should detect at least one event"
