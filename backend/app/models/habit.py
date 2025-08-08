from __future__ import annotations
from datetime import datetime, date
from typing import Optional, Dict

from sqlmodel import SQLModel, Field, Column, JSON


class Habit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    title: str
    why: Optional[str] = None
    identity_goal: Optional[str] = None
    loop: Optional[Dict] = Field(default=None, sa_column=Column(JSON))
    minimal_dose: Optional[str] = None
    implementation_intentions: Optional[str] = None
    reminders: Optional[Dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HabitLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    habit_id: int = Field(index=True)
    day: date = Field(index=True)
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
