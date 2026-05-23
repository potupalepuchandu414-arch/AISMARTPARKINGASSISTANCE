from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse, TokenResponse

router = APIRouter()


class LoginJson(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


@router.post("/register", response_model=UserResponse)
def register(body: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == body.username.strip()).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        username=body.username.strip(),
        phone=body.phone.strip(),
        hashed_password=hash_password(body.password),
        is_admin=False,
        is_online=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login/json", response_model=TokenResponse)
def login_json(body: LoginJson, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username.strip()).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user.is_online = True
    user.last_seen = datetime.utcnow()
    db.commit()
    token = create_access_token({"sub": user.username, "adm": user.is_admin})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/logout")
def logout(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.is_online = False
    db.commit()
    return {"ok": True}
