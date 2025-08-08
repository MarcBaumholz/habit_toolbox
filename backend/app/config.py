from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "HabitLink API"
    environment: str = "development"
    database_url: str = "sqlite:///./habit.db"
    jwt_secret: str = "change_me"
    cors_origins: list[str] = ["*"]
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
