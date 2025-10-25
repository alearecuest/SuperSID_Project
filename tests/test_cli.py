"""
Tests for the CLI entry points.
"""

from click.testing import CliRunner

# Import the CLI entrypoint
from supersid.cli import cli, main


def test_cli_runs_help():
    runner = CliRunner()
    result = runner.invoke(main, ["--help"])
    # Exit code should be 0
    assert result.exit_code == 0
    # Help text should mention usage or options
    assert "Usage" in result.output or "Options" in result.output


def test_cli_runs_version(monkeypatch):
    runner = CliRunner()
    result = runner.invoke(main, ["--version"])
    # Exit code should be 0
    assert result.exit_code == 0
    # Output should contain version string
    assert "supersid" in result.output.lower()


def test_cli_no_args_shows_help():
    runner = CliRunner()
    result = runner.invoke(cli, [])
    # Exit code should be 0
    assert result.exit_code == 0
    # Help text should mention usage
    assert "Usage" in result.output
