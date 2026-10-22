"""Authentication endpoints: register, login, current user."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.MessageResponse)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        username=payload.username,
        email=payload.email,
        phone=payload.phone,
        location=payload.location,
        user_type=payload.user_type,
        password_hash=hash_password(payload.password),
    )

    if payload.user_type == "professional" and payload.professional:
        p = payload.professional
        user.full_name = p.full_name
        user.bio = p.bio
        user.specializations = p.specializations
        user.certifications = p.certifications
        user.work_history = p.work_history
        user.portfolio_links = p.portfolio_links
        user.hourly_rate = p.hourly_rate
        user.service_areas = p.service_areas
        user.languages_spoken = p.languages_spoken
        user.experience_years = p.experience_years
        user.availability = p.availability

    db.add(user)
    db.commit()
    return schemas.MessageResponse(
        success=True, message=f"Account created successfully! Welcome {user.username}!"
    )


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = create_access_token(user)
    return schemas.TokenResponse(access_token=token, user=user)


@router.get("/me", response_model=schemas.UserPublic)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
