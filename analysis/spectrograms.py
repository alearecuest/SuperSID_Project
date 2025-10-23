"""
Spectrogram Visualization

This script generates spectrograms and frequency domain analyses for SuperSID VLF data.

Usage:
    python analysis/spectrograms.py ../data/your_data_file.csv

Requirements:
    numpy, matplotlib, pandas, scipy

Author: Alejandro Arévalo
"""

import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import spectrogram

def load_data(filepath):
    df = pd.read_csv(filepath, parse_dates=['timestamp'])
    return df

def plot_spectrogram(df, signal_col='signal'):
    # Use signal values as time series
    data = df[signal_col].values
    fs = 1
    f, t, Sxx = spectrogram(data, fs)
    plt.figure(figsize=(10, 5))
    plt.pcolormesh(t, f, Sxx, shading='gouraud')
    plt.ylabel('Frequency [Hz]')
    plt.xlabel('Time [sec]')
    plt.title('SuperSID Signal Spectrogram')
    plt.colorbar(label='Intensity')
    plt.tight_layout()
    plt.show()

def main(filepath):
    df = load_data(filepath)
    print(f"Loaded {len(df)} rows for spectrogram analysis.")
    plot_spectrogram(df)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analysis/spectrograms.py ../data/your_data_file.csv")
        sys.exit(1)
    main(sys.argv[1])
