from __future__ import annotations
from typing import Optional, Dict

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlmodel import Session

from ..deps import get_current_user
from ..db import get_session
from ..models.user import User

router = APIRouter(prefix="/users", tags=["users"]) 


class UserRead(BaseModel):
    id: int
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    lifebook: Optional[Dict] = None


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    lifebook: Optional[Dict] = None


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)):
    return UserRead(
        id=user.id,
        email=user.email,  # type: ignore[arg-type]
        display_name=user.display_name,
        photo_url=user.photo_url,
        lifebook=user.lifebook,
    )


@router.put("/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    if payload.display_name is not None:
        user.display_name = payload.display_name
    if payload.photo_url is not None:
        user.photo_url = payload.photo_url
    if payload.lifebook is not None:
        user.lifebook = payload.lifebook
    session.add(user)
    session.commit()
    session.refresh(user)
    return UserRead(
        id=user.id,
        email=user.email,  # type: ignore[arg-type]
        display_name=user.display_name,
        photo_url=user.photo_url,
        lifebook=user.lifebook,
    )
