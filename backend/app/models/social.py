from __future__ import annotations
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class Trust(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    truster_id: int = Field(index=True)
    trustee_id: int = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
