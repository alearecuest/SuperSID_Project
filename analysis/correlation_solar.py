"""
Solar Activity Correlation Analysis

This script correlates SuperSID data with solar activity indexes (e.g., sunspots, flares, X-ray flux).
Requires external solar data as input (e.g., from NOAA or NASA).

Usage:
    python analysis/correlation_solar.py ../data/sid_data.csv ../data/solar_activity.csv

Expected SID data format:
    - timestamp: Date and time of measurement
    - signal: VLF signal intensity/value

Expected solar activity data format:
    - timestamp: Date and time of measurement
    - sunspots, xray_flux, flares, etc.

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

def align_data(sid_df, solar_df):
    """Align both dataframes by timestamp (e.g., by hour or minute)."""
    sid_df['hour'] = sid_df['timestamp'].dt.floor('H')
    solar_df['hour'] = solar_df['timestamp'].dt.floor('H')
    merged = pd.merge(sid_df, solar_df, on='hour', suffixes=('_sid', '_solar'))
    return merged

def compute_correlation(merged, column1, column2):
    """Compute Pearson correlation between two columns."""
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

def main(sid_path, solar_path):
    sid_df = load_data(sid_path)
    solar_df = load_data(solar_path)
    merged = align_data(sid_df, solar_df)
    print(f'Merged dataset length: {len(merged)}')
    # Example: correlate signal with sunspots
    compute_correlation(merged, 'signal', 'sunspots')
    plot_correlation_scatter(merged, 'signal', 'sunspots')

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python analysis/correlation_solar.py ../data/sid_data.csv ../data/solar_activity.csv")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
