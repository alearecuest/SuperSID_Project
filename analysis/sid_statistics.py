"""
SID Statistics Analysis

This script analyzes SuperSID VLF data to detect and summarize Sudden Ionospheric Disturbance (SID) events.
Calculates statistics such as frequency, duration, intervals, and event timing.

Usage:
    python analysis/sid_statistics.py ../data/your_data_file.csv

Expected data format:
    - timestamp: Date and time of measurement (ISO format or similar)
    - signal: VLF signal intensity/value

Example data row:
    2025-10-23T20:51:12, 0.342

Requirements:
    pandas, matplotlib

Author: Alejandro Arévalo
"""

import sys
import pandas as pd
import matplotlib.pyplot as plt

def load_sid_data(filepath):
    """Load SID data from a CSV file."""
    df = pd.read_csv(filepath, parse_dates=['timestamp'])
    return df

def detect_sid_events(df, threshold=0.5):
    """
    Detect SID events based on a signal threshold.
    Returns a DataFrame of SID events with start/end times and duration.
    """
    above_thresh = df['signal'] > threshold
    # Find rising edges (event starts) and falling edges (event ends)
    df['event'] = above_thresh.astype(int)
    df['event_shift'] = df['event'].shift(1, fill_value=0)
    starts = df[(df['event'] == 1) & (df['event_shift'] == 0)].index
    ends = df[(df['event'] == 0) & (df['event_shift'] == 1)].index

    events = []
    for start, end in zip(starts, ends):
        start_time = df.loc[start, 'timestamp']
        end_time = df.loc[end, 'timestamp']
        duration = (end_time - start_time).total_seconds() / 60  # in minutes
        events.append({'start': start_time, 'end': end_time, 'duration_min': duration})
    events_df = pd.DataFrame(events)
    return events_df

def plot_event_frequency(events_df):
    """Plot the number of SID events per day."""
    events_df['date'] = events_df['start'].dt.date
    freq = events_df.groupby('date').size()
    plt.figure(figsize=(10, 5))
    freq.plot(kind='bar')
    plt.title('SID Events per Day')
    plt.xlabel('Date')
    plt.ylabel('Number of Events')
    plt.tight_layout()
    plt.show()

def plot_event_duration_histogram(events_df):
    """Plot histogram of SID event durations."""
    plt.figure(figsize=(8, 4))
    plt.hist(events_df['duration_min'], bins=20, color='skyblue', edgecolor='black')
    plt.title('SID Event Duration Histogram')
    plt.xlabel('Duration (minutes)')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.show()

def main(filepath):
    # Load data
    df = load_sid_data(filepath)
    print(f"Loaded {len(df)} rows of SID signal data.")

    # Detect events
    events_df = detect_sid_events(df, threshold=0.5)
    print(f"Detected {len(events_df)} SID events.")

    # Show event statistics
    print(events_df.describe())

    # Plot frequency and duration
    plot_event_frequency(events_df)
    plot_event_duration_histogram(events_df)

    # events_df.to_csv('sid_events_summary.csv', index=False)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analysis/sid_statistics.py ../data/your_data_file.csv")
        sys.exit(1)
    main(sys.argv[1])
