import pandas as pd
from analysis.sid_statistics import detect_sid_events

def test_detect_sid_events_basic():
    df = pd.DataFrame({
        "timestamp": pd.date_range("2025-01-01", periods=5, freq="min"),
        "signal": [0.1, 0.7, 0.8, 0.2, 0.9]
    })
    events = detect_sid_events(df, threshold=0.5)
    assert len(events) >= 1, "Debe haber al menos un evento SID detectado"
