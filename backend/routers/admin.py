"""Admin dashboard endpoints."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from security import require_role

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[schemas.AdminUserOut])
def all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    return (
        db.query(models.User)
        .order_by(models.User.user_type, models.User.username)
        .all()
    )


@router.get("/professionals", response_model=List[schemas.ProfessionalOut])
def all_professionals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    return (
        db.query(models.User)
        .filter(models.User.user_type == "professional")
        .order_by(models.User.rating.desc(), models.User.username)
        .all()
    )


@router.get("/stats", response_model=schemas.AdminStats)
def stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    total_users = db.query(models.User).count()
    total_professionals = (
        db.query(models.User).filter(models.User.user_type == "professional").count()
    )
    customers = db.query(models.User).filter(models.User.user_type == "customer").count()
    total_bookings = db.query(models.Booking).count()
    total_services = db.query(models.Service).count()
    return schemas.AdminStats(
        total_users=total_users,
        total_professionals=total_professionals,
        customers=customers,
        total_bookings=total_bookings,
        total_services=total_services,
    )
