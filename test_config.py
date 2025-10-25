from supersid.utils.config_loader import load_config

cfg = load_config("supersid/configs/montevideo.toml",
                  "supersid/configs/transmitters.toml")
print(cfg["channels"])
