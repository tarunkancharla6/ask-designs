from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, Token, UserResponse
from app.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    username: str
    password: str
    shop_name: str = "ASK DESIGNS"


@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=UserResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(
        username=req.username,
        password_hash=get_password_hash(req.password),
        shop_name=req.shop_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/change-password")
def change_password(
    old_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = get_password_hash(new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/setup", response_model=UserResponse)
def setup(db: Session = Depends(get_db)):
    existing = db.query(User).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = User(
        username="admin",
        password_hash=get_password_hash("admin"),
        shop_name="ASK DESIGNS",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
