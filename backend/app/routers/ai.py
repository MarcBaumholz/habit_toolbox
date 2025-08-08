from __future__ import annotations
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from ..routers.toolbox import Tool

router = APIRouter(prefix="/ai", tags=["ai"]) 


class SuggestRequest(BaseModel):
    query: str


@router.post("/suggest", response_model=List[Tool])
def suggest_tools(payload: SuggestRequest, session: Session = Depends(get_session)):
    q = payload.query.lower()
    tools = session.exec(select(Tool)).all()
    scored = []
    for t in tools:
        score = 0
        if q in (t.title or '').lower():
            score += 2
        if t.keywords:
            score += sum(1 for kw in t.keywords if kw.lower() in q)
        if q in (t.description or '').lower():
            score += 1
        if score:
            scored.append((score, t))
    return [t for _, t in sorted(scored, key=lambda x: -x[0])][:3]
