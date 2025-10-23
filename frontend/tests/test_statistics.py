import pandas as pd

def filter_station_and_power(df, station, threshold):
    filtered = df[(df['station_id'] == station) & (df['intensity'] >= threshold)]
    return filtered

def test_filter_station_and_power():
    df = pd.DataFrame({
        "station_id": ["A", "B", "A", "B"],
        "intensity": [0.2, 0.8, 0.7, 0.5]
    })
    result = filter_station_and_power(df, "A", 0.5)
    assert len(result) == 1
    assert result.iloc[0]['intensity'] == 0.7
