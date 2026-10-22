"""Customer booking endpoints."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from security import require_role

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


def _to_booking_out(b: models.Booking) -> schemas.BookingOut:
    return schemas.BookingOut(
        id=b.id,
        service_name=b.service.name if b.service else "Unknown",
        professional_name=(b.professional.full_name or b.professional.username)
        if b.professional else "Unknown",
        customer_name=b.customer.username if b.customer else "Unknown",
        status=b.status,
        booking_date=b.booking_date,
        price=b.price,
    )


@router.post("", response_model=schemas.MessageResponse)
def create_booking(
    payload: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("customer")),
):
    service = db.query(models.Service).filter(models.Service.id == payload.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    professional_id = payload.professional_id

    # Check for existing pending/accepted booking for the same service+professional
    if professional_id is not None:
        existing = (
            db.query(models.Booking)
            .filter(
                models.Booking.customer_id == current_user.id,
                models.Booking.professional_id == professional_id,
                models.Booking.service_id == payload.service_id,
                models.Booking.status.in_(["pending", "accepted"]),
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail="You already have an active booking for this service with this professional",
            )

    if professional_id is None:
        # Pick the highest-rated available professional for this service.
        match = (
            db.query(models.User)
            .join(models.ProfessionalService,
                  models.ProfessionalService.professional_id == models.User.id)
            .filter(
                models.ProfessionalService.service_id == payload.service_id,
                models.ProfessionalService.available.is_(True),
                models.User.user_type == "professional",
            )
            .order_by(models.User.rating.desc())
            .first()
        )
        if not match:
            raise HTTPException(
                status_code=400, detail="No professionals available for this service"
            )
        professional_id = match.id

    # Also check after auto-pick
    existing = (
        db.query(models.Booking)
        .filter(
            models.Booking.customer_id == current_user.id,
            models.Booking.professional_id == professional_id,
            models.Booking.service_id == payload.service_id,
            models.Booking.status.in_(["pending", "accepted"]),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already have an active booking for this service with this professional",
        )

    booking = models.Booking(
        customer_id=current_user.id,
        professional_id=professional_id,
        service_id=payload.service_id,
        price=service.base_price,
        status="pending",
        scheduled_date=payload.scheduled_date,
        notes=payload.notes,
    )
    db.add(booking)
    db.commit()
    return schemas.MessageResponse(
        success=True,
        message="Service booked successfully! Waiting for professional confirmation.",
    )


@router.post("/{booking_id}/cancel", response_model=schemas.MessageResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("customer")),
):
    booking = (
        db.query(models.Booking)
        .filter(
            models.Booking.id == booking_id,
            models.Booking.customer_id == current_user.id,
        )
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status not in ("pending", "accepted"):
        raise HTTPException(status_code=400, detail="This booking cannot be cancelled")
    booking.status = "cancelled"
    db.commit()
    return schemas.MessageResponse(success=True, message="Booking cancelled successfully")


@router.get("/my", response_model=List[schemas.BookingOut])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("customer")),
):
    bookings = (
        db.query(models.Booking)
        .filter(models.Booking.customer_id == current_user.id)
        .order_by(models.Booking.booking_date.desc())
        .all()
    )
    return [_to_booking_out(b) for b in bookings]
