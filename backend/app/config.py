from functools import lru_cache
from pydantic_settings import BaseSettings
from pathlib import Path

# Resolve repo root (two levels up from this file: backend/app -> repo)
_REPO_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_UPLOAD_DIR = str((_REPO_ROOT / "uploads").resolve())

class Settings(BaseSettings):
    app_name: str = "HabitLink API"
    environment: str = "development"
    database_url: str = "sqlite:///./habit.db"
    jwt_secret: str = "change_me"
    cors_origins: list[str] = ["*"]
    upload_dir: str = _DEFAULT_UPLOAD_DIR

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
