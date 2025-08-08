from __future__ import annotations
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Session, Column, JSON

from ..db import get_session
from ..deps import get_current_user
from ..models.user import User

router = APIRouter(prefix="/tools", tags=["toolbox"]) 


class Tool(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    keywords: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    steps: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    description: str
    created_by_user_id: Optional[int] = Field(default=None, index=True)


class ToolCreate(BaseModel):
    title: str
    keywords: Optional[List[str]] = None
    steps: Optional[List[str]] = None
    description: str


def _ensure_created_by_column(session: Session) -> None:
    """For SQLite dev: add created_by_user_id if missing (no full migrations)."""
    try:
        conn = session.get_bind().raw_connection()
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(tool)")
        cols = [r[1] for r in cur.fetchall()]
        if "created_by_user_id" not in cols:
            cur.execute("ALTER TABLE tool ADD COLUMN created_by_user_id INTEGER")
            conn.commit()
        cur.close()
    except Exception:
        # Best-effort only
        pass


@router.get("", response_model=List[Tool])
def list_tools(session: Session = Depends(get_session)):
    _ensure_created_by_column(session)
    return session.query(Tool).all()


@router.post("", response_model=Tool)
def create_tool(
    payload: ToolCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _ensure_created_by_column(session)
    tool = Tool(**payload.model_dump(), created_by_user_id=user.id)
    session.add(tool)
    session.commit()
    session.refresh(tool)
    return tool
