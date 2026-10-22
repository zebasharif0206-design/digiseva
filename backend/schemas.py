"""Pydantic request/response schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# --- Auth ---

class ProfessionalProfileInput(BaseModel):
    full_name: str = ""
    bio: str = ""
    specializations: str = ""
    certifications: str = ""
    work_history: str = ""
    portfolio_links: str = ""
    hourly_rate: float = 25.0
    service_areas: str = ""
    languages_spoken: str = ""
    experience_years: int = 1
    availability: str = "available"


class RegisterRequest(BaseModel):
    username: str
    password: str
    email: EmailStr
    phone: str
    location: str
    user_type: str = Field(pattern="^(customer|professional)$")
    professional: Optional[ProfessionalProfileInput] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserPublic(BaseModel):
    id: int
    username: str
    email: str
    user_type: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


# --- Services / professionals ---

class ServiceOut(BaseModel):
    id: int
    name: str
    description: str
    base_price: float

    class Config:
        from_attributes = True


class ProfessionalOut(BaseModel):
    id: int
    username: str
    full_name: str = ""
    email: str
    phone: str
    location: str
    rating: float
    experience_years: int
    availability: str
    bio: str = ""
    specializations: str = ""
    hourly_rate: float = 0.0
    service_areas: str = ""
    languages_spoken: str = ""

    class Config:
        from_attributes = True


class ProfessionalProfileOut(ProfessionalOut):
    certifications: str = ""
    work_history: str = ""
    portfolio_links: str = ""


# --- Bookings ---

class BookingCreate(BaseModel):
    service_id: int
    professional_id: Optional[int] = None
    scheduled_date: Optional[str] = None
    notes: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    service_name: str
    professional_name: str
    customer_name: str
    status: str
    booking_date: datetime
    price: Optional[float]

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    success: bool
    message: str


# --- Admin ---

class AdminUserOut(BaseModel):
    id: int
    username: str
    email: str
    phone: str
    location: str
    user_type: str

    class Config:
        from_attributes = True


class AdminStats(BaseModel):
    total_users: int
    total_professionals: int
    customers: int
    total_bookings: int
    total_services: int
