from __future__ import annotations
from datetime import date, timedelta, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from ..deps import get_current_user
from ..db import get_session
from ..models.habit import Habit, HabitLog, HabitSubscription, HabitToolLink
from ..models.user import User
from ..routers.toolbox import Tool

router = APIRouter(prefix="/habits", tags=["habits"]) 


class HabitCreate(BaseModel):
    title: str
    why: Optional[str] = None
    identity_goal: Optional[str] = None
    loop: Optional[dict] = None
    minimal_dose: Optional[str] = None
    implementation_intentions: Optional[str] = None
    is_public: Optional[bool] = True


class HabitRead(BaseModel):
    id: int
    title: str
    current_streak: int


class SubscriptionRead(BaseModel):
    habit_id: int


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
    tools: List[dict] = []
    is_own: bool = True
    is_subscribed: bool = False


@router.post("", response_model=HabitRead)
def create_habit(
    payload: HabitCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _ensure_habit_columns(session)
    habit = Habit(
        user_id=user.id,
        title=payload.title,
        why=payload.why,
        identity_goal=payload.identity_goal,
        loop=payload.loop,
        minimal_dose=payload.minimal_dose,
        implementation_intentions=payload.implementation_intentions,
        is_public=(payload.is_public if payload.is_public is not None else True),
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
    _ensure_habit_columns(session)
    habits = session.exec(select(Habit).where(Habit.user_id == user.id).order_by(Habit.created_at.desc())).all()

    result: List[HabitRead] = []
    for h in habits:
        streak = _compute_current_streak(session, h.id)
        result.append(HabitRead(id=h.id, title=h.title, current_streak=streak))
    return result

# Public habits discovery
class HabitPublicBrief(BaseModel):
    id: int
    title: str
    user_id: int

@router.get("/discover", response_model=List[HabitPublicBrief])
@router.get("/public/discover", response_model=List[HabitPublicBrief])
def list_public_habits(
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _ensure_habit_columns(session)
    q = select(Habit).where(Habit.is_public == True)  # noqa: E712
    if search:
        try:
            q = q.where(Habit.title.ilike(f"%{search}%"))
        except Exception:
            # Fallback for SQLite if ilike unavailable
            q = q.where(Habit.title.contains(search))
    q = q.order_by(Habit.created_at.desc()).limit(limit)
    rows = session.exec(q).all()
    return [HabitPublicBrief(id=h.id, title=h.title, user_id=h.user_id) for h in rows]


@router.post("/{habit_id}/subscribe", response_model=SubscriptionRead)
def subscribe_habit(
    habit_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    if habit.user_id == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot subscribe to your own habit")
    existing = session.exec(select(HabitSubscription).where(HabitSubscription.user_id==user.id, HabitSubscription.habit_id==habit_id)).first()
    if not existing:
        session.add(HabitSubscription(user_id=user.id, habit_id=habit_id))
        session.commit()
    return SubscriptionRead(habit_id=habit_id)

@router.delete("/{habit_id}/subscribe", response_model=SubscriptionRead)
def unsubscribe_habit(
    habit_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    # Allow unsubscribing only from external habits; silently ignore if it's your own or not subscribed
    sub = session.exec(select(HabitSubscription).where(HabitSubscription.user_id==user.id, HabitSubscription.habit_id==habit_id)).first()
    if sub:
        session.delete(sub)
        session.commit()
    return SubscriptionRead(habit_id=habit_id)

# Some environments block DELETE or rewrite it. Provide POST alternative for unsubscribing.
@router.post("/{habit_id}/unsubscribe", response_model=SubscriptionRead)
def unsubscribe_habit_post(
    habit_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    sub = session.exec(select(HabitSubscription).where(HabitSubscription.user_id==user.id, HabitSubscription.habit_id==habit_id)).first()
    if sub:
        session.delete(sub)
        session.commit()
    return SubscriptionRead(habit_id=habit_id)


@router.get("/subscriptions", response_model=List[HabitRead])
def list_subscribed(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    subs = session.exec(select(HabitSubscription).where(HabitSubscription.user_id==user.id)).all()
    result: List[HabitRead] = []
    for s in subs:
        h = session.get(Habit, s.habit_id)
        if h:
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
    # linked tools
    links = session.exec(select(HabitToolLink).where(HabitToolLink.habit_id == habit_id)).all()
    tools: List[dict] = []
    for lk in links:
        t = session.get(Tool, lk.tool_id)
        if t:
            tools.append({"id": t.id, "title": t.title, "keywords": t.keywords, "description": t.description})
    # subscription state for current user
    sub_exists = session.exec(select(HabitSubscription).where(HabitSubscription.user_id == user.id, HabitSubscription.habit_id == habit_id)).first() is not None
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
        tools=tools,
        is_own=(habit.user_id == user.id),
        is_subscribed=sub_exists,
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


class LinkRequest(BaseModel):
    tool_id: int


@router.post("/{habit_id}/tools")
def link_tool(
    habit_id: int,
    payload: LinkRequest,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    tool = session.get(Tool, payload.tool_id)
    if not tool:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tool not found")
    exists = session.exec(
        select(HabitToolLink).where(HabitToolLink.habit_id == habit_id, HabitToolLink.tool_id == payload.tool_id)
    ).first()
    if not exists:
        session.add(HabitToolLink(habit_id=habit_id, tool_id=payload.tool_id))
        session.commit()
    return {"linked": True}


@router.delete("/{habit_id}/tools/{tool_id}")
def unlink_tool(
    habit_id: int,
    tool_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    lk = session.exec(
        select(HabitToolLink).where(HabitToolLink.habit_id == habit_id, HabitToolLink.tool_id == tool_id)
    ).first()
    if not lk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    session.delete(lk)
    session.commit()
    return {"unlinked": True}

@router.get("/public/{habit_id}", response_model=HabitDetail)
def get_public_habit(
    habit_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    habit = session.get(Habit, habit_id)
    if not habit or not habit.is_public:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    streak = _compute_current_streak(session, habit_id)
    links = session.exec(select(HabitToolLink).where(HabitToolLink.habit_id == habit_id)).all()
    tools: List[dict] = []
    for lk in links:
        t = session.get(Tool, lk.tool_id)
        if t:
            tools.append({"id": t.id, "title": t.title, "keywords": t.keywords, "description": t.description})
    sub_exists = session.exec(select(HabitSubscription).where(HabitSubscription.user_id == user.id, HabitSubscription.habit_id == habit_id)).first() is not None
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
        tools=tools,
        is_own=(habit.user_id == user.id),
        is_subscribed=sub_exists,
    )

@router.post("/public/{habit_id}/clone", response_model=HabitRead)
def clone_public_habit(
    habit_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    src = session.get(Habit, habit_id)
    if not src:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    new_habit = Habit(
        user_id=user.id,
        title=src.title,
        why=src.why,
        identity_goal=src.identity_goal,
        loop=src.loop,
        minimal_dose=src.minimal_dose,
        implementation_intentions=src.implementation_intentions,
        is_public=True,
    )
    session.add(new_habit)
    session.commit(); session.refresh(new_habit)
    streak = _compute_current_streak(session, new_habit.id)
    return HabitRead(id=new_habit.id, title=new_habit.title, current_streak=streak)


# Dev helper for SQLite to add new columns

def _ensure_habit_columns(session: Session) -> None:
    try:
        conn = session.get_bind().raw_connection()
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(habit)")
        cols = [r[1] for r in cur.fetchall()]
        if "is_public" not in cols:
            cur.execute("ALTER TABLE habit ADD COLUMN is_public BOOLEAN DEFAULT 1")
        conn.commit(); cur.close()
    except Exception:
        pass

@router.post("/dev_seed_public")
def dev_seed_public(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    """Create a few demo public habits for the current user to test discovery."""
    _ensure_habit_columns(session)
    titles = ["Read 10 minutes", "Walk 5k steps", "Stretch 5 minutes"]
    created = []
    for t in titles:
        h = Habit(user_id=user.id, title=t, is_public=True)
        session.add(h); session.commit(); session.refresh(h)
        created.append({"id": h.id, "title": h.title})
    return {"ok": True, "created": created}

def _compute_current_streak(session: Session, habit_id: int) -> int:
    """Return consecutive days streak ending at the most recent completed day (today or earlier)."""
    today = date.today()
    # Find the most recent completed day (up to 200 days back)
    last_completed = None
    for offset in range(0, 200):
        d = today - timedelta(days=offset)
        log = session.exec(select(HabitLog).where(HabitLog.habit_id == habit_id, HabitLog.day == d)).first()
        if log and log.completed:
            last_completed = d
            break
    if last_completed is None:
        return 0
    # Count consecutive days backwards from last_completed
    count = 0
    d = last_completed
    for _ in range(0, 200):
        log = session.exec(select(HabitLog).where(HabitLog.habit_id == habit_id, HabitLog.day == d)).first()
        if log and log.completed:
            count += 1
            d = d - timedelta(days=1)
        else:
            break
    return count
