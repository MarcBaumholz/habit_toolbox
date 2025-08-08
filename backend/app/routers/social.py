from __future__ import annotations
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..db import get_session
from ..deps import get_current_user
from ..models.social import Trust
from ..models.user import User

router = APIRouter(prefix="/social", tags=["social"]) 


@router.post("/trust/{user_id}")
def trust_user(user_id: int, session: Session = Depends(get_session), me: User = Depends(get_current_user)):
    if me.id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot trust yourself")
    exists = session.exec(select(Trust).where(Trust.truster_id == me.id, Trust.trustee_id == user_id)).first()
    if exists:
        return {"trusted": True}
    t = Trust(truster_id=me.id, trustee_id=user_id)
    session.add(t)
    session.commit()
    return {"trusted": True}


@router.delete("/trust/{user_id}")
def untrust_user(user_id: int, session: Session = Depends(get_session), me: User = Depends(get_current_user)):
    t = session.exec(select(Trust).where(Trust.truster_id == me.id, Trust.trustee_id == user_id)).first()
    if t:
        session.delete(t)
        session.commit()
    return {"trusted": False}


@router.get("/trusted", response_model=List[int])
def list_trusted(session: Session = Depends(get_session), me: User = Depends(get_current_user)):
    rows = session.exec(select(Trust).where(Trust.truster_id == me.id)).all()
    return [r.trustee_id for r in rows]
