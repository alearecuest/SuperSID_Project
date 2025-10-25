# Developer Guide

## QA and code quality
- `make qa` → runs lint, format, tests, coverage, and mypy.
- `pytest` → run unit tests.
- `ruff check . --fix` → fix style and imports.
- `mypy supersid` → static type checking.

## Recommended workflow
1. Create a feature branch.
2. Implement changes.
3. Run `make qa` and ensure all checks pass.
4. Commit and open a PR.

## Extending modules
- Add new analyses in `supersid/features/`.
- Document new endpoints in `docs/api.md`.
- Maintain test coverage >95%.
