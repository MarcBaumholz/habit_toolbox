from typing import Generator

from sqlmodel import SQLModel, create_engine, Session

from .config import get_settings


def _get_engine_url() -> str:
    settings = get_settings()
    return settings.database_url


def get_engine():
    return create_engine(_get_engine_url(), echo=False)


def init_db() -> None:
    engine = get_engine()
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    engine = get_engine()
    with Session(engine) as session:
        yield session
