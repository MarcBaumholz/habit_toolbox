# HabitLink

Monorepo for a social habit-building app with accountability groups, AI tool finder, and weekly tracking.

## Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- Backend: FastAPI (Python 3.12), SQLModel (PostgreSQL), Redis, S3 storage
- Realtime: FastAPI WebSockets or Pusher-compatible
- Testing: pytest

## Local Setup

### Backend
1. Create venv
```
python3 -m venv .venv
source .venv/bin/activate
```
2. Install deps
```
pip install -r backend/requirements.txt
```
3. Env
Create `.env` at repo root:
```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/habitlink
JWT_SECRET=change_me
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=habitlink
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```
4. Run dev
```
uvicorn app.main:app --reload --port 8000 --app-dir backend
```

### Frontend (to be added)
- Scaffold Next.js app in `frontend/`

## Scripts
- Format: `black backend`
- Tests: `pytest -q`

## Notes
- Keep files < 500 lines. Add unit tests for new features.
