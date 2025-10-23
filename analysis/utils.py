"""
Utility Functions

Common utility functions for data loading, cleaning, and transformation.

Author: Alejandro Arecuest
"""

import pandas as pd

def load_data(path, parse_dates=None):
    """Load data from CSV and parse dates if provided."""
    return pd.read_csv(path, parse_dates=parse_dates)
