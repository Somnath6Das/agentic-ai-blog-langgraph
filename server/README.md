uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

uv sync --reinstall

# deploy on render command

## inside the server terminal

uv add "uvicorn[standard]"
uv lock

## render build command

uv sync --locked

## render server run command

uv run --active uvicorn main:app --host 0.0.0.0 --port $PORT

## set environment variable

PYTHON_VERSION=3.11.9
