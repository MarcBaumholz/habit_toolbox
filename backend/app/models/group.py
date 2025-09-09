from __future__ import annotations
from datetime import datetime, date
from typing import Optional

from sqlmodel import SQLModel, Field


class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    is_public: bool = True
    owner_id: int = Field(index=True)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GroupMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(index=True)
    user_id: int = Field(index=True)
    role: str = "member"
    habit_title: Optional[str] = None
    frequency_per_week: int = 7
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Proof(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(index=True)
    user_id: int = Field(index=True)
    day: date = Field(index=True)
    image_url: str
    caption: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(index=True)
    user_id: int = Field(index=True)
    content: str
    type: str = Field(default="chat", description="chat|learning|challenge|proof")
    image_url: Optional[str] = None
    likes_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MessageReaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    message_id: int = Field(index=True)
    user_id: int = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
