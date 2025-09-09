from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from ..config import get_settings
from ..core import create_access_token, hash_password, verify_password
from ..db import get_session
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["auth"]) 


def _ensure_user_profile_columns(session: Session) -> None:
    """SQLite dev helper: add newly introduced nullable columns if missing."""
    try:
        conn = session.get_bind().raw_connection()
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(user)")
        cols = [r[1] for r in cur.fetchall()]
        if "description" not in cols:
            cur.execute("ALTER TABLE user ADD COLUMN description TEXT")
        if "big_why" not in cols:
            cur.execute("ALTER TABLE user ADD COLUMN big_why TEXT")
        if "lifebook" not in cols:
            # JSON in SQLite is TEXT under the hood; SQLModel maps via Column(JSON)
            cur.execute("ALTER TABLE user ADD COLUMN lifebook TEXT")
        conn.commit()
        cur.close()
    except Exception:
        # best effort only in dev
        pass


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, session: Session = Depends(get_session)):
    _ensure_user_profile_columns(session)
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(email=payload.email, password_hash=hash_password(payload.password))
    session.add(user)
    session.commit()
    session.refresh(user)

    settings = get_settings()
    token = create_access_token(str(user.id), secret_key=settings.jwt_secret, expires_delta=timedelta(minutes=30))
    return AuthResponse(access_token=token)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    _ensure_user_profile_columns(session)
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    settings = get_settings()
    token = create_access_token(str(user.id), secret_key=settings.jwt_secret, expires_delta=timedelta(minutes=30))
    return AuthResponse(access_token=token)
