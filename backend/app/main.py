from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db import init_db
from .routers import health, auth, habits, groups, toolbox, users, social, learnings, summary, ai

app = FastAPI(title="HabitLink API", version="0.1.0")

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB is initialized on startup events or explicitly in tests

@app.on_event("startup")
def on_startup() -> None:
    init_db()

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(groups.router)
app.include_router(toolbox.router)
app.include_router(users.router)
app.include_router(social.router)
app.include_router(learnings.router)
app.include_router(summary.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {"message": "HabitLink API"}

# Static file serving for uploaded proofs
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
