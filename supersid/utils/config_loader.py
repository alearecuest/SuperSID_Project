"""
Configuration loader for SuperSID Next.

Reads observatory-specific configuration and merges it with
the global transmitter catalog.
"""

import tomllib
from pathlib import Path


def load_config(obs_file: str, tx_file: str) -> dict:
    """
    Load observatory configuration and merge with global transmitters.

    Parameters
    ----------
    obs_file : str
        Path to observatory TOML file (e.g., montevideo.toml).
    tx_file : str
        Path to global transmitters TOML file.

    Returns
    -------
    dict
        Combined configuration with observatory info and selected channels.
    """
    obs = tomllib.loads(Path(obs_file).read_text(encoding="utf-8"))
    txs = tomllib.loads(Path(tx_file).read_text(encoding="utf-8"))

    # Build a lookup for transmitters
    tx_lookup = {t["name"]: t for t in txs["transmitters"]}

    # Replace channels in observatory config with full info from catalog
    channels = []
    for c in obs.get("channels", []):
        if c["name"] in tx_lookup:
            merged = {**tx_lookup[c["name"]], **c}
            channels.append(merged)
        else:
            channels.append(c)

    obs["channels"] = channels
    return obs
