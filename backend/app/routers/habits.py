from __future__ import annotations
from datetime import date, timedelta, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..deps import get_current_user
from ..db import get_session
from ..models.habit import Habit, HabitLog
from ..models.user import User

router = APIRouter(prefix="/habits", tags=["habits"]) 


class HabitCreate(BaseModel):
    title: str
    why: Optional[str] = None
    identity_goal: Optional[str] = None
    loop: Optional[dict] = None
    minimal_dose: Optional[str] = None
    implementation_intentions: Optional[str] = None


class HabitRead(BaseModel):
    id: int
    title: str
    current_streak: int


class HabitDetail(BaseModel):
    id: int
    title: str
    current_streak: int
    created_at: datetime
    why: Optional[str] = None
    identity_goal: Optional[str] = None
    loop: Optional[dict] = None
    minimal_dose: Optional[str] = None
    implementation_intentions: Optional[str] = None


@router.post("", response_model=HabitRead)
def create_habit(
    payload: HabitCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    habit = Habit(
        user_id=user.id,
        title=payload.title,
        why=payload.why,
        identity_goal=payload.identity_goal,
        loop=payload.loop,
        minimal_dose=payload.minimal_dose,
        implementation_intentions=payload.implementation_intentions,
    )
    session.add(habit)
    session.commit()
    session.refresh(habit)
    return HabitRead(id=habit.id, title=habit.title, current_streak=0)


@router.get("", response_model=List[HabitRead])
def list_my_habits(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    habits = session.exec(select(Habit).where(Habit.user_id == user.id).order_by(Habit.created_at.desc())).all()

    result: List[HabitRead] = []
    for h in habits:
        streak = _compute_current_streak(session, h.id)
        result.append(HabitRead(id=h.id, title=h.title, current_streak=streak))
    return result


@router.get("/{habit_id}", response_model=HabitDetail)
def get_habit(
    habit_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    streak = _compute_current_streak(session, habit_id)
    return HabitDetail(
        id=habit.id,
        title=habit.title,
        current_streak=streak,
        created_at=habit.created_at,
        why=habit.why,
        identity_goal=habit.identity_goal,
        loop=habit.loop,
        minimal_dose=habit.minimal_dose,
        implementation_intentions=habit.implementation_intentions,
    )


class WeekStatus(BaseModel):
    week_start: date
    days: dict


@router.get("/{habit_id}/week", response_model=WeekStatus)
def get_week(
    habit_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    today = date.today()
    monday = today - timedelta(days=(today.weekday()))
    days = {}
    for offset in range(7):
        d = monday + timedelta(days=offset)
        log = session.exec(
            select(HabitLog).where(HabitLog.habit_id == habit_id, HabitLog.day == d)
        ).first()
        days[d.isoformat()] = bool(log and log.completed)
    return WeekStatus(week_start=monday, days=days)


@router.post("/{habit_id}/toggle/{day}")
def toggle_day(
    habit_id: int,
    day: date,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    log = session.exec(select(HabitLog).where(HabitLog.habit_id == habit_id, HabitLog.day == day)).first()
    if not log:
        log = HabitLog(habit_id=habit_id, day=day, completed=True)
        session.add(log)
    else:
        log.completed = not log.completed
    session.add(log)
    session.commit()
    return {"habit_id": habit_id, "day": day.isoformat(), "completed": log.completed}


def _compute_current_streak(session: Session, habit_id: int) -> int:
    # Walk backwards from today
    count = 0
    today = date.today()
    for offset in range(0, 200):
        d = today - timedelta(days=offset)
        log = session.exec(select(HabitLog).where(HabitLog.habit_id == habit_id, HabitLog.day == d)).first()
        if log and log.completed:
            count += 1
        else:
            break
    return count
