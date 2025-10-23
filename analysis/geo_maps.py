"""
Geographical Mapping of SID Events

Visualizes the spatial distribution of SID events using map plots.
Requires station location metadata.

Usage:
    python analysis/geo_maps.py ../data/events.csv ../data/stations.csv

Expected stations.csv format:
    - station_id, latitude, longitude

Requirements:
    pandas, matplotlib

Author: Alejandro Arévalo
"""

import sys
import pandas as pd
import matplotlib.pyplot as plt

def load_data(path):
    return pd.read_csv(path)

def plot_geo_map(events_df, stations_df):
    plt.figure(figsize=(8,6))
    for idx, row in stations_df.iterrows():
        plt.scatter(row['longitude'], row['latitude'], marker='o', s=100, label=row['station_id'])
    plt.title('SID Stations Geographic Map')
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()

def main(events_path, stations_path):
    events_df = load_data(events_path)
    stations_df = load_data(stations_path)
    plot_geo_map(events_df, stations_df)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python analysis/geo_maps.py ../data/events.csv ../data/stations.csv")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
