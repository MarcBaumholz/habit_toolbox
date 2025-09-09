from __future__ import annotations
from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from pydantic import BaseModel
from fastapi import Form
from sqlmodel import Session, select

from ..deps import get_current_user
from ..db import get_session
from ..config import get_settings
from ..models.group import Group, GroupMember, Proof, Message, MessageReaction
from ..models.user import User

router = APIRouter(prefix="/groups", tags=["groups"]) 

def _ensure_group_columns(session: Session) -> None:
    try:
        conn = session.get_bind().raw_connection()
        cur = conn.cursor()
        # group table (name is reserved, quote it)
        cur.execute("PRAGMA table_info(\"group\")")
        cols = [r[1] for r in cur.fetchall()]
        if "description" not in cols:
            cur.execute("ALTER TABLE \"group\" ADD COLUMN description TEXT")
        # groupmember table
        cur.execute("PRAGMA table_info(groupmember)")
        cols2 = [r[1] for r in cur.fetchall()]
        if "habit_title" not in cols2:
            cur.execute("ALTER TABLE groupmember ADD COLUMN habit_title TEXT")
        if "frequency_per_week" not in cols2:
            cur.execute("ALTER TABLE groupmember ADD COLUMN frequency_per_week INTEGER DEFAULT 7")
        conn.commit(); cur.close()
    except Exception:
        pass

def _ensure_proof_message_columns(session: Session) -> None:
    try:
        conn = session.get_bind().raw_connection()
        cur = conn.cursor()
        # proof.caption
        cur.execute("PRAGMA table_info(proof)")
        cols = [r[1] for r in cur.fetchall()]
        if "caption" not in cols:
            cur.execute("ALTER TABLE proof ADD COLUMN caption TEXT")
        # message.image_url and extended type already tolerated by app; add image_url if missing
        cur.execute("PRAGMA table_info(message)")
        mcols = [r[1] for r in cur.fetchall()]
        if "image_url" not in mcols:
            cur.execute("ALTER TABLE message ADD COLUMN image_url TEXT")
        conn.commit(); cur.close()
    except Exception:
        pass


class GroupCreate(BaseModel):
    name: str
    is_public: bool = True
    description: Optional[str] = None


class GroupRead(BaseModel):
    id: int
    name: str
    members: int
    owner_id: int
    description: Optional[str] = None


class GroupDetail(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    members: List[dict]


@router.post("", response_model=GroupRead)
def create_group(
    payload: GroupCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _ensure_group_columns(session)
    _ensure_proof_message_columns(session)
    _ensure_proof_message_columns(session)
    _ensure_proof_message_columns(session)
    g = Group(name=payload.name, is_public=payload.is_public, owner_id=user.id, description=payload.description) 
    session.add(g)
    session.commit()
    session.refresh(g)

    m = GroupMember(group_id=g.id, user_id=user.id, role="owner")
    session.add(m)
    session.commit()

    return GroupRead(id=g.id, name=g.name, members=1, owner_id=g.owner_id, description=g.description)


@router.get("", response_model=List[GroupRead])
def list_groups(is_public: Optional[bool] = None, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    _ensure_group_columns(session)
    try:
        conn = session.get_bind().raw_connection(); cur = conn.cursor()
        cur.execute("PRAGMA table_info(\"group\")"); cur.fetchall(); cur.close()
    except Exception:
        pass
    q = select(Group).order_by(Group.created_at.desc())
    if is_public is not None:
        q = q.where(Group.is_public == is_public)
    groups = session.exec(q).all()
    result: List[GroupRead] = []
    for g in groups:
        count = session.exec(select(GroupMember).where(GroupMember.group_id == g.id)).all()
        result.append(GroupRead(id=g.id, name=g.name, members=len(count), owner_id=g.owner_id, description=g.description))
    return result

@router.get("/my", response_model=List[GroupRead])
@router.get("/mine", response_model=List[GroupRead])
@router.get("/me/list", response_model=List[GroupRead])
def list_my_groups(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    _ensure_group_columns(session)
    memberships = session.exec(select(GroupMember).where(GroupMember.user_id == user.id)).all()
    if not memberships:
        return []
    ids = [m.group_id for m in memberships]
    groups = session.exec(select(Group).where(Group.id.in_(ids))).all()
    result: List[GroupRead] = []
    for g in groups:
        count = session.exec(select(GroupMember).where(GroupMember.group_id == g.id)).all()
        result.append(GroupRead(id=g.id, name=g.name, members=len(count), owner_id=g.owner_id, description=g.description))
    return result


class JoinRequest(BaseModel):
    habit_title: Optional[str] = None
    frequency_per_week: Optional[int] = 7


@router.post("/{group_id}/join")
def join_group(group_id: int, payload: Optional[JoinRequest] = None, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    _ensure_group_columns(session)
    _ensure_proof_message_columns(session)
    g = session.get(Group, group_id)
    if not g:
        raise HTTPException(status_code=404)
    existing = session.exec(select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == user.id)).first()
    if existing:
        return {"joined": True}
    session.add(GroupMember(
        group_id=group_id,
        user_id=user.id,
        role="member",
        habit_title=(payload.habit_title if payload else None),
        frequency_per_week=(payload.frequency_per_week if (payload and payload.frequency_per_week) else 7)
    ))
    session.commit()
    return {"joined": True}


@router.get("/{group_id}", response_model=GroupDetail)
def get_group(group_id: int, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    _ensure_group_columns(session)
    _ensure_proof_message_columns(session)
    g = session.get(Group, group_id)
    if not g:
        raise HTTPException(status_code=404)
    members = session.exec(select(GroupMember).where(GroupMember.group_id == group_id)).all()
    member_dicts = [{"user_id": m.user_id, "role": m.role, "habit_title": m.habit_title, "frequency_per_week": m.frequency_per_week} for m in members]
    return GroupDetail(id=g.id, name=g.name, description=g.description, members=member_dicts)


class ProofCreate(BaseModel):
    image_url: str
    caption: Optional[str] = None


@router.post("/{group_id}/proofs", status_code=201)
def upload_proof(
    group_id: int,
    payload: ProofCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _ensure_proof_message_columns(session)
    _ensure_proof_message_columns(session)
    _ensure_proof_message_columns(session)
    membership = session.exec(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == user.id)
    ).first()
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    # Enforce weekly proof limit
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    count = session.exec(select(Proof).where(Proof.group_id==group_id, Proof.user_id==user.id, Proof.day>=monday, Proof.day<=today)).all()
    if len(count) >= (membership.frequency_per_week or 7):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Weekly proof limit reached")
    p = Proof(group_id=group_id, user_id=user.id, day=today, image_url=payload.image_url, caption=payload.caption)
    session.add(p)
    session.commit()
    return {"id": p.id}


@router.post("/{group_id}/proofs/upload", status_code=201)
def upload_proof_file(
    group_id: int,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    membership = session.exec(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == user.id)
    ).first()
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    settings = get_settings()
    import os
    os.makedirs(settings.upload_dir, exist_ok=True)
    import re
    safe_name = os.path.basename(file.filename).replace(' ', '_')
    filename = f"g{group_id}_u{user.id}_{date.today().isoformat()}_{safe_name}"
    dest_path = os.path.join(settings.upload_dir, filename)
    with open(dest_path, "wb") as f:
        f.write(file.file.read())
    url = f"/uploads/{filename}"

    # Enforce weekly proof limit for file upload as well
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    count = session.exec(select(Proof).where(Proof.group_id==group_id, Proof.user_id==user.id, Proof.day>=monday, Proof.day<=today)).all()
    if len(count) >= (membership.frequency_per_week or 7):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Weekly proof limit reached")
    p = Proof(group_id=group_id, user_id=user.id, day=today, image_url=url, caption=caption)
    session.add(p)
    session.commit()
    return {"id": p.id, "image_url": url}


@router.get("/{group_id}/proofs/week")
def list_week_proofs(group_id: int, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    _ensure_proof_message_columns(session)
    g = session.get(Group, group_id)
    if not g:
        raise HTTPException(status_code=404)
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    proofs = session.exec(
        select(Proof).where(Proof.group_id == group_id, Proof.day >= monday, Proof.day <= sunday)
    ).all()
    return [{"user_id": p.user_id, "day": p.day.isoformat(), "image_url": p.image_url, "caption": p.caption} for p in proofs]


class MessageCreate(BaseModel):
    content: str
    type: str = "chat"
    image_url: Optional[str] = None


@router.post("/{group_id}/messages", status_code=201)
def post_message(
    group_id: int,
    payload: MessageCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    membership = session.exec(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == user.id)
    ).first()
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    msg = Message(group_id=group_id, user_id=user.id, content=payload.content, type=payload.type, image_url=payload.image_url)
    # If content denotes a proof shortcut like '/proof <caption>' and an image_url is present, also create a Proof
    if payload.type == 'proof' and payload.image_url:
        p = Proof(group_id=group_id, user_id=user.id, day=date.today(), image_url=payload.image_url, caption=payload.content)
        session.add(p)
    session.add(msg)
    session.commit()
    return {"id": msg.id}


@router.get("/{group_id}/messages")
def list_messages(
    group_id: int,
    msg_type: Optional[str] = Query(None, alias="type"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    _ensure_proof_message_columns(session)
    q = select(Message).where(Message.group_id == group_id)
    if msg_type:
        q = q.where(Message.type == msg_type)
    q = q.order_by(Message.created_at.desc())
    msgs = session.exec(q.offset(offset).limit(limit)).all()
    msgs = list(reversed(msgs))
    return [{"id": m.id, "user_id": m.user_id, "content": m.content, "type": m.type, "image_url": m.image_url, "created_at": m.created_at.isoformat()} for m in msgs]
