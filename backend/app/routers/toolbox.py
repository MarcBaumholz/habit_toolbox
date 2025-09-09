from __future__ import annotations
from typing import List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Session, Column, JSON

from ..db import get_session
from ..deps import get_current_user
from ..models.user import User

router = APIRouter(prefix="/tools", tags=["toolbox"]) 


class Tool(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    keywords: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    steps: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    description: str
    created_by_user_id: Optional[int] = Field(default=None, index=True)


class ToolCreate(BaseModel):
    title: str
    keywords: Optional[List[str]] = None
    steps: Optional[List[str]] = None
    description: str


def _ensure_created_by_column(session: Session) -> None:
    """For SQLite dev: add created_by_user_id if missing (no full migrations)."""
    try:
        conn = session.get_bind().raw_connection()
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(tool)")
        cols = [r[1] for r in cur.fetchall()]
        if "created_by_user_id" not in cols:
            cur.execute("ALTER TABLE tool ADD COLUMN created_by_user_id INTEGER")
            conn.commit()
        cur.close()
    except Exception:
        # Best-effort only
        pass


@router.get("", response_model=List[Tool])
def list_tools(session: Session = Depends(get_session)):
    _ensure_created_by_column(session)
    return session.query(Tool).all()


@router.post("", response_model=Tool)
def create_tool(
    payload: ToolCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _ensure_created_by_column(session)
    tool = Tool(**payload.model_dump(), created_by_user_id=user.id)
    session.add(tool)
    session.commit()
    session.refresh(tool)
    return tool


@router.post("/dev_seed")
def dev_seed_tools(session: Session = Depends(get_session)):
    """Dev-only helper: seed research-backed habit tools if they don't exist."""
    _ensure_created_by_column(session)

    curated = [
        {
            "title": "Pomodoro Technique",
            "description": "Work in focused sprints (typically 25 minutes) followed by short breaks to combat procrastination and mental fatigue.",
            "keywords": ["focus", "time management", "deep work", "procrastination"],
            "steps": [
                "Pick a single task and remove distractions.",
                "Set a 25-minute timer and work with full focus.",
                "Take a 5-minute break; repeat 3–4 cycles.",
                "After 4 cycles, take a longer break (15–30 minutes).",
            ],
        },
        {
            "title": "Implementation Intentions (If-Then Planning)",
            "description": "Pre-commit to a concrete trigger and action to drastically increase follow-through.",
            "keywords": ["planning", "behavior change", "consistency"],
            "steps": [
                "Define your goal: e.g., 'exercise more'.",
                "Write an if-then: 'If it's 7am, then I put on running shoes and jog for 10 minutes.'",
                "Place the plan where you see it daily and rehearse it mentally.",
            ],
        },
        {
            "title": "Habit Stacking",
            "description": "Attach a new behavior to an existing, stable routine to leverage existing context and cues.",
            "keywords": ["cue", "context", "stacking"],
            "steps": [
                "List stable daily habits (e.g., brush teeth, make coffee).",
                "Choose a target behavior that takes <2 minutes to start.",
                "Formulate: 'After I [current habit], I will [new habit].'",
            ],
        },
        {
            "title": "Two-Minute Rule",
            "description": "Make the first step so small it’s hard to say no. Reduce friction and start momentum.",
            "keywords": ["friction", "starting", "motivation"],
            "steps": [
                "Shrink the habit to a 2-minute entry point (e.g., 'read 1 page').",
                "Do the 2-minute version daily to build identity and consistency.",
                "Allow natural expansion once you're in motion.",
            ],
        },
        {
            "title": "Temptation Bundling",
            "description": "Pair a desired habit with an immediately rewarding activity to increase adherence.",
            "keywords": ["reward", "motivation", "pairing"],
            "steps": [
                "Identify an instantly rewarding activity (e.g., favorite podcast).",
                "Only allow it while doing the desired habit (e.g., cleaning).",
                "Track adherence and adjust the pairing if motivation drops.",
            ],
        },
        {
            "title": "Time Blocking",
            "description": "Allocate fixed time blocks for specific tasks or themes to protect focus and reduce context switching.",
            "keywords": ["planning", "calendar", "focus"],
            "steps": [
                "Define 2–4 daily blocks (deep work, admin, health).",
                "Assign concrete tasks to each block the day before.",
                "Honor the boundary; move unfinished tasks to the next block.",
            ],
        },
        {
            "title": "Identity-Based Habits",
            "description": "Shift focus from outcomes to identity ('I am the type of person who…') to make behaviors stick.",
            "keywords": ["identity", "motivation", "self-concept"],
            "steps": [
                "Write the identity you want to embody (e.g., 'runner').",
                "Design daily evidence: simple, repeatable actions.",
                "Track 'votes' for the identity; celebrate small wins.",
            ],
        },
        {
            "title": "WOOP (Wish, Outcome, Obstacle, Plan)",
            "description": "Evidence-based mental contrasting technique to set goals and prepare for obstacles.",
            "keywords": ["planning", "mental contrasting", "obstacles"],
            "steps": [
                "Wish: Define a meaningful, feasible goal.",
                "Outcome: Vividly imagine best results.",
                "Obstacle: Identify your internal obstacle.",
                "Plan: Create an if-then plan to overcome it.",
            ],
        },
        {
            "title": "Habit Loop (Cue–Routine–Reward)",
            "description": "Map the loop driving a behavior to redesign routines while keeping cues and rewards.",
            "keywords": ["cue", "routine", "reward", "loop"],
            "steps": [
                "Identify the cue (time, place, emotion, preceding action).",
                "Clarify the reward (feeling, relief, stimulation).",
                "Experiment with alternate routines that deliver the same reward.",
            ],
        },
        {
            "title": "Environment Design",
            "description": "Shape your surroundings to make desired habits easy and undesired ones hard.",
            "keywords": ["friction", "context", "defaults"],
            "steps": [
                "Add friction to bad habits (remove apps, hide cues).",
                "Reduce friction to good habits (lay out gear, prep night before).",
                "Use visible cues and default placements to nudge behavior.",
            ],
        },
    ]

    # Insert missing by title
    existing_titles = {t.title for t in session.query(Tool).all()}
    created = 0
    for t in curated:
        if t["title"] in existing_titles:
            continue
        tool = Tool(
            title=t["title"],
            description=t["description"],
            keywords=t.get("keywords"),
            steps=t.get("steps"),
            created_by_user_id=None,
        )
        session.add(tool)
        created += 1
    session.commit()
    return {"ok": True, "created": created, "total": session.query(Tool).count()}