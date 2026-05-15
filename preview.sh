#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="127.0.0.1"
PORT="8123"
PYTHON_BIN="${PYTHON_BIN:-python3}"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  PYTHON_BIN="python"
fi

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Need python3 or python to run the preview server." >&2
  exit 1
fi

can_bind_port() {
  local port="$1"
  "$PYTHON_BIN" - "$HOST" "$port" <<'PY'
import socket
import sys

host = sys.argv[1]
port = int(sys.argv[2])

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.settimeout(0.2)
    try:
        sock.bind((host, port))
    except OSError:
        sys.exit(1)
    sys.exit(0)
PY
}

if ! can_bind_port "$PORT"; then
  echo "Port $PORT is already in use; expected preview URL is http://$HOST:$PORT/." >&2
  exit 1
fi

echo "Serving $ROOT_DIR on http://$HOST:$PORT/"
cd "$ROOT_DIR"
exec "$PYTHON_BIN" -m http.server "$PORT" --bind "$HOST"

exit 1
