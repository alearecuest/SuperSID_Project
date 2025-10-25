"""
Command Line Interface (CLI) for SuperSID Next.

Provides entry points to run acquisition and API server from the terminal.
"""

import click
import uvicorn

from supersid.acquisition.audio_source import AudioConfig, AudioSource
from supersid.api.server import make_app
from supersid.persistence.writer import ParquetWriter
from supersid.processing.events import EventDetector
from supersid.processing.features import SlidingFeatures
from supersid.processing.filters import VLFChannelBank


@click.group(invoke_without_command=True)
@click.version_option("0.1.0", prog_name="supersid-next")
@click.pass_context
def cli(ctx):
    """SuperSID Next command-line interface."""
    if ctx.invoked_subcommand is None:
        # Mostrar ayuda si no se pasa ningún subcomando
        click.echo(ctx.get_help())


# Alias para compatibilidad con código existente
main = cli


@cli.command()
@click.option(
    "--sample-rate",
    type=int,
    default=48000,
    show_default=True,
    help="Sampling rate in Hz",
)
@click.option(
    "--chunk-ms",
    type=int,
    default=250,
    show_default=True,
    help="Chunk size in milliseconds",
)
@click.option(
    "--data",
    type=click.Path(file_okay=False),
    default="./data",
    show_default=True,
    help="Path to store data",
)
def ingest(sample_rate, chunk_ms, data):
    """Start acquisition and data recording."""
    cfg = AudioConfig(sample_rate=sample_rate, chunk_ms=chunk_ms)
    chans = VLFChannelBank(
        [
            {"name": "DHO38", "freq": 38300, "bw": 40},
            {"name": "GQD22", "freq": 22000, "bw": 40},
        ],
        fs=cfg.sample_rate,
    )
    feats = SlidingFeatures(
        window_samples=int(cfg.sample_rate * 5), step_samples=int(cfg.sample_rate * 1)
    )
    det = EventDetector(sensitivity=0.8)
    writer = ParquetWriter(
        data, metadata={"observatory_code": "#281", "operator": "Alejandro Arévalo"}
    )

    with AudioSource(cfg) as src:
        for ts, frame in src.stream():
            banded = chans.apply(frame)
            f = feats.compute(banded)
            events = det.detect(f)
            writer.write_frame(ts, banded, f, events)


@cli.command()
@click.option(
    "--data",
    type=click.Path(file_okay=False),
    default="./data",
    show_default=True,
    help="Path to data directory",
)
@click.option(
    "--host", type=str, default="127.0.0.1", show_default=True, help="Host address"
)
@click.option("--port", type=int, default=8000, show_default=True, help="Port number")
def api(data, host, port):
    """Start API server."""
    app = make_app(data)
    uvicorn.run(app, host=host, port=port)
