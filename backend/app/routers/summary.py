from __future__ import annotations
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from ..db import get_session
from ..deps import get_current_user
from ..models.habit import Habit, HabitLog
from ..models.group import Message
from ..models.social import Trust
from ..models.user import User

router = APIRouter(prefix="/summary", tags=["summary"]) 


@router.get("")
def weekly_summary(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    # Stats
    since = date.today() - timedelta(days=7)
    logs = session.exec(select(HabitLog).join(Habit, Habit.id == HabitLog.habit_id).where(Habit.user_id == user.id, HabitLog.day >= since, HabitLog.completed == True)).all()  # noqa: E712
    total_completions = len(logs)

    # Best habit by completions
    counts: dict[int, int] = {}
    for l in logs:
        counts[l.habit_id] = counts.get(l.habit_id, 0) + 1
    best = None
    if counts:
        best_id = max(counts, key=counts.get)
        best = session.get(Habit, best_id)

    # Trusted insights
    trusted_ids = [t.trustee_id for t in session.exec(select(Trust).where(Trust.truster_id == user.id)).all()]
    insights = []
    if trusted_ids:
        insights = session.exec(
            select(Message).where(Message.type == "learning", Message.user_id.in_(trusted_ids)).order_by(Message.likes_count.desc())
        ).all()

    return {
        "total_completions": total_completions,
        "best_habit": {"id": best.id, "title": best.title} if best else None,
        "trusted_insights": [{"id": m.id, "user_id": m.user_id, "content": m.content, "likes_count": m.likes_count} for m in insights],
    }
