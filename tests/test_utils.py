"""
Basic test for utils.py
"""

from analysis.utils import load_data

def test_load_data():
    try:
        df = load_data('../data/example_sid_data.csv', parse_dates=['timestamp'])
        assert not df.empty, "DataFrame is empty"
        print("Test passed: Data loaded successfully.")
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    test_load_data()
