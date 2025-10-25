# Makefile for SuperSID Next
# Automates linting, formatting, testing, and coverage

.PHONY: lint format test coverage qa clean types

# Lint with ruff (fast and modern linter)
lint:
	ruff check supersid tests

# Format code with black
format:
	black supersid tests

# Run unit tests
test:
	pytest -q

# Run tests with coverage report
coverage:
	pytest --cov=supersid --cov-report=term-missing

# Type checking with mypy (optional)
types:
	mypy supersid

# Full QA pipeline
qa: lint format test coverage types

# Clean temporary files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .coverage htmlcov
