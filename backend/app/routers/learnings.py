from __future__ import annotations
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from ..models.group import Message

router = APIRouter(prefix="/learnings", tags=["learnings"]) 


class LearningRead(BaseModel):
    id: int
    group_id: int
    user_id: int
    content: str
    likes_count: int


@router.get("", response_model=List[LearningRead])
def list_learnings(session: Session = Depends(get_session)):
    msgs = session.exec(select(Message).where(Message.type == "learning").order_by(Message.created_at.desc())).all()
    return [LearningRead(id=m.id, group_id=m.group_id, user_id=m.user_id, content=m.content, likes_count=m.likes_count) for m in msgs]
