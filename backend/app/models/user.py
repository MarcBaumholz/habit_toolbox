from datetime import datetime
from typing import Optional, Dict

from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Column, JSON


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: EmailStr = Field(unique=True, index=True)
    password_hash: str
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    lifebook: Optional[Dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
