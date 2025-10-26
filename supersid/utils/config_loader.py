"""
Configuration loader for SuperSID App.

- Reads observatory-specific configuration (obs_file).
- Optionally merges with a global transmitter catalog (tx_file).
- Returns a unified dict with observatory info and enriched channel definitions.
"""

import tomllib
from pathlib import Path
from typing import Optional, Dict, Any


def load_config(obs_file: str, tx_file: Optional[str] = None) -> Dict[str, Any]:
    """
    Load observatory configuration and optionally merge with global transmitters.

    Parameters
    ----------
    obs_file : str
        Path to observatory TOML file (e.g., montevideo.toml).
    tx_file : str, optional
        Path to global transmitters TOML file.

    Returns
    -------
    dict
        Combined configuration with observatory info and selected channels.
    """
    obs_path = Path(obs_file)
    if not obs_path.exists():
        raise FileNotFoundError(f"Observatory config not found: {obs_path}")

    obs = tomllib.loads(obs_path.read_text(encoding="utf-8"))

    # If a global transmitter catalog is provided, merge it
    if tx_file:
        tx_path = Path(tx_file)
        if not tx_path.exists():
            raise FileNotFoundError(f"Transmitters file not found: {tx_path}")

        txs = tomllib.loads(tx_path.read_text(encoding="utf-8"))
        tx_lookup = {t["name"]: t for t in txs.get("transmitters", [])}

        channels = []
        for c in obs.get("channels", []):
            if c["name"] in tx_lookup:
                merged = {**tx_lookup[c["name"]], **c}
                channels.append(merged)
            else:
                channels.append(c)
        obs["channels"] = channels

    return obs
