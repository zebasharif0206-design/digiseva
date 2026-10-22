"""SQLAlchemy ORM models for DigiSeva."""
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    location = Column(String, nullable=False)
    user_type = Column(String, nullable=False)  # customer | professional | admin
    password_hash = Column(String, nullable=False)
    rating = Column(Float, default=0.0)
    experience_years = Column(Integer, default=0)
    availability = Column(String, default="available")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Extended professional profile fields
    full_name = Column(String, default="")
    bio = Column(Text, default="")
    specializations = Column(Text, default="")
    certifications = Column(Text, default="")
    work_history = Column(Text, default="")
    portfolio_links = Column(Text, default="")
    hourly_rate = Column(Float, default=0.0)
    service_areas = Column(Text, default="")
    languages_spoken = Column(Text, default="")

    services = relationship("ProfessionalService", back_populates="professional",
                            cascade="all, delete-orphan")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    base_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ProfessionalService(Base):
    __tablename__ = "professional_services"
    __table_args__ = (UniqueConstraint("professional_id", "service_id"),)

    id = Column(Integer, primary_key=True, index=True)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    custom_price = Column(Float, nullable=True)
    available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    professional = relationship("User", back_populates="services")
    service = relationship("Service")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    status = Column(String, default="pending")  # pending|accepted|declined|completed|cancelled
    booking_date = Column(DateTime, default=datetime.utcnow)
    scheduled_date = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    price = Column(Float, nullable=True)

    customer = relationship("User", foreign_keys=[customer_id])
    professional = relationship("User", foreign_keys=[professional_id])
    service = relationship("Service")
