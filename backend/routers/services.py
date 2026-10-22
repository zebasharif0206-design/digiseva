"""Service catalog and professional lookup endpoints."""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=List[schemas.ServiceOut])
def list_services(db: Session = Depends(get_db)):
    return db.query(models.Service).order_by(models.Service.name).all()


@router.get("/{service_id}/professionals", response_model=List[schemas.ProfessionalOut])
def professionals_for_service(service_id: int, db: Session = Depends(get_db)):
    professionals = (
        db.query(models.User)
        .join(models.ProfessionalService,
              models.ProfessionalService.professional_id == models.User.id)
        .filter(
            models.ProfessionalService.service_id == service_id,
            models.ProfessionalService.available.is_(True),
            models.User.user_type == "professional",
        )
        .order_by(models.User.rating.desc(), models.User.experience_years.desc())
        .distinct()
        .all()
    )
    return professionals
