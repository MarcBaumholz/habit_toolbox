#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/marcbaumholz/Desktop/habit"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$ROOT_DIR/.venv"
BACKEND_PORT=8050
FRONTEND_PORT=3010

# Backend setup
if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv "$VENV_DIR"
fi
source "$VENV_DIR/bin/activate"
python -m pip install --upgrade pip
pip install -r "$BACKEND_DIR/requirements.txt"

# Start backend
( cd "$ROOT_DIR" && uvicorn app.main:app --reload --port "$BACKEND_PORT" --app-dir backend ) &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID) on http://localhost:$BACKEND_PORT"

# Frontend setup (use a fresh port to avoid stale service workers on :3000)
if command -v pnpm >/dev/null 2>&1; then
  ( cd "$FRONTEND_DIR" && pnpm i && pnpm dev --port "$FRONTEND_PORT" ) &
elif command -v npm >/dev/null 2>&1; then
  ( cd "$FRONTEND_DIR" && npm i && npm run dev -- --port "$FRONTEND_PORT" ) &
else
  echo "Neither pnpm nor npm found. Please install one of them."
  exit 1
fi
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID) on http://localhost:$FRONTEND_PORT"

echo "Tip: If you previously ran a different app on :3000, clear service workers at chrome://inspect/#service-workers or DevTools > Application > Service Workers > Unregister, then hard refresh."

trap "echo 'Stopping processes...'; kill $BACKEND_PID $FRONTEND_PID || true" INT TERM

# Keep script running to keep background jobs alive
wait
