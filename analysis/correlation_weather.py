"""
Weather Correlation Analysis

This script correlates SuperSID data with local weather data (temperature, humidity, pressure).

Usage:
    python analysis/correlation_weather.py ../data/sid_data.csv ../data/weather_data.csv

Expected weather data format:
    - timestamp: Date and time
    - temperature, humidity, pressure, etc.

Requirements:
    pandas, matplotlib, scipy

Author: Alejandro Arévalo
"""

import sys
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import pearsonr

def load_data(path):
    return pd.read_csv(path, parse_dates=['timestamp'])

def align_data(sid_df, weather_df):
    sid_df['hour'] = sid_df['timestamp'].dt.floor('H')
    weather_df['hour'] = weather_df['timestamp'].dt.floor('H')
    merged = pd.merge(sid_df, weather_df, on='hour', suffixes=('_sid', '_weather'))
    return merged

def compute_correlation(merged, column1, column2):
    corr, pval = pearsonr(merged[column1], merged[column2])
    print(f'Correlation between {column1} and {column2}: {corr:.3f} (p={pval:.3g})')
    return corr

def plot_correlation_scatter(merged, column1, column2):
    plt.figure(figsize=(7,5))
    plt.scatter(merged[column1], merged[column2], alpha=0.7)
    plt.title(f'{column1} vs {column2}')
    plt.xlabel(column1)
    plt.ylabel(column2)
    plt.tight_layout()
    plt.show()

def main(sid_path, weather_path):
    sid_df = load_data(sid_path)
    weather_df = load_data(weather_path)
    merged = align_data(sid_df, weather_df)
    print(f'Merged dataset length: {len(merged)}')
    # Example: correlate signal with temperature
    compute_correlation(merged, 'signal', 'temperature')
    plot_correlation_scatter(merged, 'signal', 'temperature')

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python analysis/correlation_weather.py ../data/sid_data.csv ../data/weather_data.csv")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
