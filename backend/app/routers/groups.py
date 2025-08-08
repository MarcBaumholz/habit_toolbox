from __future__ import annotations
from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..deps import get_current_user
from ..db import get_session
from ..config import get_settings
from ..models.group import Group, GroupMember, Proof, Message, MessageReaction
from ..models.user import User

router = APIRouter(prefix="/groups", tags=["groups"]) 


class GroupCreate(BaseModel):
    name: str
    is_public: bool = True


class GroupRead(BaseModel):
    id: int
    name: str
    members: int


class GroupDetail(BaseModel):
    id: int
    name: str
    members: List[dict]


@router.post("", response_model=GroupRead)
def create_group(
    payload: GroupCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    g = Group(name=payload.name, is_public=payload.is_public, owner_id=user.id)
    session.add(g)
    session.commit()
    session.refresh(g)

    m = GroupMember(group_id=g.id, user_id=user.id, role="owner")
    session.add(m)
    session.commit()

    return GroupRead(id=g.id, name=g.name, members=1)


@router.get("", response_model=List[GroupRead])
def list_groups(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    groups = session.exec(select(Group).order_by(Group.created_at.desc())).all()
    result: List[GroupRead] = []
    for g in groups:
        count = session.exec(select(GroupMember).where(GroupMember.group_id == g.id)).all()
        result.append(GroupRead(id=g.id, name=g.name, members=len(count)))
    return result


@router.post("/{group_id}/join")
def join_group(group_id: int, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    g = session.get(Group, group_id)
    if not g:
        raise HTTPException(status_code=404)
    existing = session.exec(select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == user.id)).first()
    if existing:
        return {"joined": True}
    session.add(GroupMember(group_id=group_id, user_id=user.id, role="member"))
    session.commit()
    return {"joined": True}


@router.get("/{group_id}", response_model=GroupDetail)
def get_group(group_id: int, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    g = session.get(Group, group_id)
    if not g:
        raise HTTPException(status_code=404)
    members = session.exec(select(GroupMember).where(GroupMember.group_id == group_id)).all()
    member_dicts = [{"user_id": m.user_id, "role": m.role} for m in members]
    return GroupDetail(id=g.id, name=g.name, members=member_dicts)


class ProofCreate(BaseModel):
    image_url: str


@router.post("/{group_id}/proofs", status_code=201)
def upload_proof(
    group_id: int,
    payload: ProofCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    membership = session.exec(
        select(GroupMember).where(GroupMember.group_id == group_id, GroupMember.user_id == user.id)
    ).first()
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    p = Proof(group_id=group_id, user_id=user.id, day=date.today(), image_url=payload.image_url)
    session.add(p)
    session.commit()
    return {"id": p.id}


@router.post("/{group_id}/proofs/upload", status_code=201)
def upload_proof_file(
    group_id: int,
    file: UploadFile = File(...),
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
    filename = f"g{group_id}_u{user.id}_{date.today().isoformat()}_{file.filename}"
    dest_path = os.path.join(settings.upload_dir, filename)
    with open(dest_path, "wb") as f:
        f.write(file.file.read())
    url = f"/uploads/{filename}"

    p = Proof(group_id=group_id, user_id=user.id, day=date.today(), image_url=url)
    session.add(p)
    session.commit()
    return {"id": p.id, "image_url": url}


@router.get("/{group_id}/proofs/week")
def list_week_proofs(group_id: int, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    g = session.get(Group, group_id)
    if not g:
        raise HTTPException(status_code=404)
    today = date.today()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    proofs = session.exec(
        select(Proof).where(Proof.group_id == group_id, Proof.day >= monday, Proof.day <= sunday)
    ).all()
    return [{"user_id": p.user_id, "day": p.day.isoformat(), "image_url": p.image_url} for p in proofs]


class MessageCreate(BaseModel):
    content: str
    type: str = "chat"


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

    msg = Message(group_id=group_id, user_id=user.id, content=payload.content, type=payload.type)
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
    q = select(Message).where(Message.group_id == group_id)
    if msg_type:
        q = q.where(Message.type == msg_type)
    q = q.order_by(Message.created_at.desc())
    msgs = session.exec(q.offset(offset).limit(limit)).all()
    msgs = list(reversed(msgs))
    return [{"id": m.id, "user_id": m.user_id, "content": m.content, "type": m.type, "created_at": m.created_at.isoformat()} for m in msgs]
