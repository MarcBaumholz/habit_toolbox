from __future__ import annotations
from typing import Optional, Dict, List

from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from ..deps import get_current_user
from ..db import get_session
from ..models.user import User
from ..models.habit import Habit, HabitSubscription
from ..models.group import Group, GroupMember
from ..core import hash_password

router = APIRouter(prefix="/users", tags=["users"]) 


def _ensure_user_profile_columns(session: Session) -> None:
    try:
        conn = session.get_bind().raw_connection(); cur = conn.cursor()
        cur.execute("PRAGMA table_info(user)"); cols = [r[1] for r in cur.fetchall()]
        if "description" not in cols:
            cur.execute("ALTER TABLE user ADD COLUMN description TEXT")
        if "big_why" not in cols:
            cur.execute("ALTER TABLE user ADD COLUMN big_why TEXT")
        if "lifebook" not in cols:
            cur.execute("ALTER TABLE user ADD COLUMN lifebook JSON")
        conn.commit(); cur.close()
    except Exception:
        pass


def _ensure_group_description_column(session: Session) -> None:
    try:
        conn = session.get_bind().raw_connection(); cur = conn.cursor()
        cur.execute("PRAGMA table_info(\"group\")"); cols = [r[1] for r in cur.fetchall()]
        if "description" not in cols:
            cur.execute("ALTER TABLE \"group\" ADD COLUMN description TEXT")
        conn.commit(); cur.close()
    except Exception:
        pass

def _ensure_habit_is_public_column(session: Session) -> None:
    try:
        conn = session.get_bind().raw_connection(); cur = conn.cursor()
        cur.execute("PRAGMA table_info(habit)"); cols = [r[1] for r in cur.fetchall()]
        if "is_public" not in cols:
            cur.execute("ALTER TABLE habit ADD COLUMN is_public BOOLEAN DEFAULT 1")
        conn.commit(); cur.close()
    except Exception:
        pass


class UserRead(BaseModel):
    id: int
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    description: Optional[str] = None
    big_why: Optional[str] = None
    lifebook: Optional[Dict] = None


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    description: Optional[str] = None
    big_why: Optional[str] = None
    lifebook: Optional[Dict] = None


class PublicUser(BaseModel):
    id: int
    display_name: Optional[str] = None
    email: EmailStr
    photo_url: Optional[str] = None
    description: Optional[str] = None
    habits_count: int = 0
    groups_count: int = 0


class HabitRead(BaseModel):
    id: int
    title: str
    is_public: bool = True

class HabitDetailPublic(BaseModel):
    id: int
    title: str
    why: Optional[str] = None
    identity_goal: Optional[str] = None
    loop: Optional[Dict] = None
    minimal_dose: Optional[str] = None
    implementation_intentions: Optional[str] = None


class UserGroup(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    members: int


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)):
    return UserRead(
        id=user.id,
        email=user.email,  # type: ignore[arg-type]
        display_name=user.display_name,
        photo_url=user.photo_url,
        description=user.description,
        big_why=user.big_why,
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
    if payload.description is not None:
        user.description = payload.description
    if payload.big_why is not None:
        user.big_why = payload.big_why
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
        description=user.description,
        big_why=user.big_why,
        lifebook=user.lifebook,
    )


@router.get("", response_model=List[PublicUser])
def list_users(search: Optional[str] = None, limit: Optional[int] = 50, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    _ensure_user_profile_columns(session)
    q = select(User)
    if search:
        like = f"%{search}%"
        from sqlalchemy import or_  # type: ignore
        q = q.where(or_(User.display_name.ilike(like), User.email.ilike(like)))  # type: ignore[attr-defined]
    users = session.exec(q.order_by(User.created_at.desc()).limit(max(1, min(limit or 50, 100)))).all()
    result: List[PublicUser] = []
    for u in users:
        habits_count = len(session.exec(select(Habit.id).where(Habit.user_id == u.id)).all())
        groups_count = len(session.exec(select(GroupMember.id).where(GroupMember.user_id == u.id)).all())
        result.append(PublicUser(
            id=u.id, display_name=u.display_name, email=u.email, photo_url=u.photo_url, description=u.description,
            habits_count=habits_count, groups_count=groups_count,
        ))
    return result


@router.get("/{user_id}", response_model=PublicUser)
def get_user_public(user_id: int, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    _ensure_user_profile_columns(session)
    u = session.get(User, user_id)
    if not u:
        from fastapi import HTTPException
        raise HTTPException(status_code=404)
    habits_count = len(session.exec(select(Habit.id).where(Habit.user_id == user_id)).all())
    groups_count = len(session.exec(select(GroupMember.id).where(GroupMember.user_id == user_id)).all())
    return PublicUser(id=u.id, display_name=u.display_name, email=u.email, photo_url=u.photo_url, description=u.description,
                      habits_count=habits_count, groups_count=groups_count)


@router.get("/{user_id}/habits", response_model=List[HabitRead])
def list_user_habits(user_id: int, public_only: Optional[bool] = None, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    q = select(Habit).where(Habit.user_id == user_id)
    if public_only:
        q = q.where(Habit.is_public == True)  # noqa: E712
    rows = session.exec(q).all()
    return [HabitRead(id=h.id, title=h.title, is_public=getattr(h, 'is_public', True)) for h in rows]

@router.get("/{user_id}/habits/{habit_id}", response_model=HabitDetailPublic)
def get_user_habit_detail(user_id: int, habit_id: int, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    h = session.get(Habit, habit_id)
    if not h or h.user_id != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=404)
    return HabitDetailPublic(
        id=h.id,
        title=h.title,
        why=h.why,
        identity_goal=h.identity_goal,
        loop=h.loop,
        minimal_dose=h.minimal_dose,
        implementation_intentions=h.implementation_intentions,
    )

@router.post("/{user_id}/habits/{habit_id}/clone", response_model=HabitRead)
def clone_user_habit(user_id: int, habit_id: int, session: Session = Depends(get_session), me: User = Depends(get_current_user)):
    src = session.get(Habit, habit_id)
    if not src or src.user_id != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=404)
    new_habit = Habit(
        user_id=me.id,
        title=src.title,
        why=src.why,
        identity_goal=src.identity_goal,
        loop=src.loop,
        minimal_dose=src.minimal_dose,
        implementation_intentions=src.implementation_intentions,
    )
    session.add(new_habit)
    session.commit(); session.refresh(new_habit)
    return HabitRead(id=new_habit.id, title=new_habit.title)


@router.get("/{user_id}/groups", response_model=List[UserGroup])
def list_user_groups(user_id: int, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    _ensure_group_description_column(session)
    memberships = session.exec(select(GroupMember).where(GroupMember.user_id == user_id)).all()
    group_ids = [m.group_id for m in memberships]
    if not group_ids:
        return []
    groups = session.exec(select(Group).where(Group.id.in_(group_ids))).all()  # type: ignore[arg-type]
    result: List[UserGroup] = []
    for g in groups:
        member_count = len(session.exec(select(GroupMember.id).where(GroupMember.group_id == g.id)).all())
        result.append(UserGroup(id=g.id, name=g.name, description=getattr(g, 'description', None), members=member_count))
    return result


@router.post("/dev_seed")
def dev_seed(session: Session = Depends(get_session)):
    _ensure_user_profile_columns(session)
    email = "demo_inspo@example.com"
    u = session.exec(select(User).where(User.email == email)).first()
    if not u:
        u = User(email=email, password_hash=hash_password("x"), display_name="Inspo Demo", description="Curates morning routines and deep work rituals.")
        session.add(u)
        session.commit(); session.refresh(u)
        h1 = Habit(user_id=u.id, title="Read 15 minutes")
        h2 = Habit(user_id=u.id, title="Walk 5k steps")
        session.add(h1); session.add(h2)
        session.commit()
    return {"ok": True, "user_id": u.id}

@router.post("/dev_seed_minimal")
def dev_seed_minimal(session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    """Ensure each user has at least one public habit and one owned public group with membership.
    Also set simple profile defaults when missing.
    """
    _ensure_habit_is_public_column(session)
    _ensure_group_description_column(session)
    users = session.exec(select(User)).all()
    for u in users:
        # minimal profile
        if not u.display_name:
            u.display_name = (u.email.split('@')[0])
        if not u.description:
            u.description = "Demo user for community testing."
        if not u.big_why:
            u.big_why = "Learn, improve, and share."
        session.add(u)
        # ensure at least one habit
        has_habit = session.exec(select(Habit).where(Habit.user_id == u.id)).first() is not None
        if not has_habit:
            h = Habit(user_id=u.id, title="Read 10 minutes", is_public=True)
            session.add(h)
        # ensure at least one owned group and membership
        owned_group = session.exec(select(Group).where(Group.owner_id == u.id)).first()
        if not owned_group:
            g = Group(name=f"{u.display_name or 'Demo'} group", is_public=True, owner_id=u.id, description="Demo community group")
            session.add(g); session.commit(); session.refresh(g)
            session.add(GroupMember(group_id=g.id, user_id=u.id, role="owner"))
    session.commit()
    # return counts for quick feedback
    total_users = len(users)
    total_habits = len(session.exec(select(Habit)).all())
    total_groups = len(session.exec(select(Group)).all())
    return {"ok": True, "users": total_users, "habits": total_habits, "groups": total_groups}

class AddHabitsReq(BaseModel):
    email: EmailStr
    titles: Optional[List[str]] = None

@router.post("/dev_add_habits_for_user")
def dev_add_habits_for_user(payload: AddHabitsReq, session: Session = Depends(get_session), _: User = Depends(get_current_user)):
    """Add a few simple public habits for the given user (by email). Keep it basic for testing."""
    _ensure_habit_is_public_column(session)
    u = session.exec(select(User).where(User.email == payload.email)).first()
    if not u:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    titles = payload.titles or ["Drink water", "Walk 10 minutes", "Read 5 minutes"]
    created: List[Dict[str, int]] = []
    for t in titles:
        h = Habit(user_id=u.id, title=t, is_public=True)
        session.add(h); session.commit(); session.refresh(h)
        created.append({"id": h.id})
    return {"ok": True, "user_id": u.id, "created": created}

@router.post("/dev_seed_community")
def dev_seed_community(session: Session = Depends(get_session)):
    """Reset demo community: keep exactly 10 demo users named community_demo_01..10.
    Only affects demo community accounts; does not touch real/dev login users.
    """
    _ensure_user_profile_columns(session)
    base = "community_demo_"
    desired = [f"{base}{i:02d}@example.com" for i in range(1,11)]
    # create missing
    for idx, email in enumerate(desired, start=1):
        u = session.exec(select(User).where(User.email == email)).first()
        if not u:
            display = f"Demo {idx}"
            desc = "Shares routines and learnings." if idx % 2 else "Focuses on mindful productivity."
            u = User(email=email, password_hash=hash_password("x"), display_name=display, description=desc)
            session.add(u); session.commit(); session.refresh(u)
            session.add(Habit(user_id=u.id, title="Read 10 minutes"))
            session.add(Habit(user_id=u.id, title="Stretch 5 minutes"))
            session.commit()
    # delete any extra community_demo_* not in desired
    extras = session.exec(select(User).where(User.email.like(f"{base}%"))).all()
    for u in extras:
        if u.email not in desired:
            # cascade-like manual delete of their habits
            hs = session.exec(select(Habit).where(Habit.user_id == u.id)).all()
            for h in hs: session.delete(h)
            session.delete(u)
    session.commit()
    kept = session.exec(select(User).where(User.email.in_(desired))).all()  # type: ignore[arg-type]
    return {"ok": True, "count": len(kept)}
