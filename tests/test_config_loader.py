"""
Tests for the configuration loader.
"""

from supersid.utils.config_loader import load_config
from pathlib import Path


def test_load_config(tmp_path):
    # Create temporary transmitter catalog
    tx_file = tmp_path / "transmitters.toml"
    tx_file.write_text("""
[[transmitters]]
name = "TEST1"
freq = 12345
bw = 40
location = "Nowhere"
""")

    # Create temporary observatory config
    obs_file = tmp_path / "obs.toml"
    obs_file.write_text("""
[observatory]
code = "#999"
location = "Testland"
operator = "Unit Tester"

[audio]
device = "default"
sample_rate = 48000
channels = 1
chunk_ms = 250

[processing]
window_seconds = 5
step_seconds = 1
sensitivity = 0.8

[[channels]]
name = "TEST1"
freq = 12345
bw = 40
""")

    cfg = load_config(str(obs_file), str(tx_file))

    # Assertions
    assert cfg["observatory"]["code"] == "#999"
    assert len(cfg["channels"]) == 1
    assert cfg["channels"][0]["name"] == "TEST1"
    assert cfg["channels"][0]["freq"] == 12345
