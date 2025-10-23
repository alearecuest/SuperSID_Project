"""
Advanced Comparisons

Provides various advanced visualizations, e.g., scatter plots of event intensity vs. duration,
seasonal comparisons, overlay with satellite data, etc.

Usage:
    python analysis/comparisons.py ../data/events.csv

Requirements:
    pandas, matplotlib, seaborn

Author: Alejandro Arévalo
"""

import sys
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def load_data(path):
    return pd.read_csv(path, parse_dates=['start', 'end'])

def plot_intensity_vs_duration(events_df):
    if 'intensity' in events_df.columns and 'duration_min' in events_df.columns:
        plt.figure(figsize=(7,5))
        sns.scatterplot(x='intensity', y='duration_min', data=events_df)
        plt.title('SID Event Intensity vs Duration')
        plt.xlabel('Intensity')
        plt.ylabel('Duration (min)')
        plt.tight_layout()
        plt.show()
    else:
        print("Columns 'intensity' and/or 'duration_min' not found.")

def plot_seasonal_trend(events_df):
    events_df['month'] = events_df['start'].dt.month
    monthly_counts = events_df.groupby('month').size()
    plt.figure(figsize=(8,4))
    monthly_counts.plot(kind='bar')
    plt.title('SID Events per Month')
    plt.xlabel('Month')
    plt.ylabel('Number of Events')
    plt.tight_layout()
    plt.show()

def main(events_path):
    events_df = load_data(events_path)
    plot_intensity_vs_duration(events_df)
    plot_seasonal_trend(events_df)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analysis/comparisons.py ../data/events.csv")
        sys.exit(1)
    main(sys.argv[1])
