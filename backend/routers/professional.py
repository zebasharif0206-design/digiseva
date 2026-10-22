"""Professional dashboard endpoints: requests, profile, services."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from security import require_role
from routers.bookings import _to_booking_out

router = APIRouter(prefix="/api/professional", tags=["professional"])


@router.get("/requests", response_model=List[schemas.BookingOut])
def incoming_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("professional")),
):
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.professional_id == current_user.id)
        .order_by(models.Booking.booking_date.desc())
        .all()
    )
    return [_to_booking_out(b) for b in bookings]


def _update_booking_status(booking_id, professional, db, new_status):
    booking = (
        db.query(models.Booking)
        .filter(
            models.Booking.id == booking_id,
            models.Booking.professional_id == professional.id,
        )
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = new_status
    db.commit()


@router.post("/requests/{booking_id}/accept", response_model=schemas.MessageResponse)
def accept(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("professional")),
):
    _update_booking_status(booking_id, current_user, db, "accepted")
    return schemas.MessageResponse(success=True, message="Booking accepted!")


@router.post("/requests/{booking_id}/decline", response_model=schemas.MessageResponse)
def decline(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("professional")),
):
    _update_booking_status(booking_id, current_user, db, "declined")
    return schemas.MessageResponse(success=True, message="Booking declined")


@router.get("/profile", response_model=schemas.ProfessionalProfileOut)
def get_profile(
    current_user: models.User = Depends(require_role("professional")),
):
    return current_user


@router.put("/profile", response_model=schemas.MessageResponse)
def update_profile(
    payload: schemas.ProfessionalProfileInput,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("professional")),
):
    for field in (
        "full_name", "bio", "specializations", "certifications", "work_history",
        "portfolio_links", "hourly_rate", "service_areas", "languages_spoken",
        "experience_years", "availability",
    ):
        setattr(current_user, field, getattr(payload, field))
    db.commit()
    return schemas.MessageResponse(success=True, message="Profile updated successfully")


@router.get("/services", response_model=List[schemas.ServiceOut])
def my_services(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("professional")),
):
    services = (
        db.query(models.Service)
        .join(models.ProfessionalService,
              models.ProfessionalService.service_id == models.Service.id)
        .filter(models.ProfessionalService.professional_id == current_user.id)
        .order_by(models.Service.name)
        .all()
    )
    return services


@router.post("/services/{service_id}", response_model=schemas.MessageResponse)
def add_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("professional")),
):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    existing = (
        db.query(models.ProfessionalService)
        .filter(
            models.ProfessionalService.professional_id == current_user.id,
            models.ProfessionalService.service_id == service_id,
        )
        .first()
    )
    if existing:
        existing.available = True
    else:
        db.add(models.ProfessionalService(
            professional_id=current_user.id, service_id=service_id, available=True
        ))
    db.commit()
    return schemas.MessageResponse(success=True, message="Service added successfully!")
