"""Seed the database with default services, an admin, and sample professionals."""
from sqlalchemy.orm import Session

import models
from security import hash_password

SERVICES = [
    ("House Cleaning", "Professional house cleaning service", 50.0),
    ("Plumbing", "Plumbing repairs and installations", 75.0),
    ("Electrical Work", "Electrical repairs and installations", 80.0),
    ("Gardening", "Garden maintenance and landscaping", 40.0),
    ("AC Repair", "Air conditioning repair and maintenance", 90.0),
    ("Painting", "Interior and exterior painting services", 60.0),
    ("Carpentry", "Furniture repair and custom woodwork", 70.0),
    ("Appliance Repair", "Repair of home appliances", 65.0),
    ("Cooking Service", "Personal chef and home cooking service", 55.0),
]

# username, email, phone, location, rating, experience, availability, full_name, service
PROFESSIONALS = [
    ("rajesh_cleaner", "rajesh@email.com", "9876543210", "Mumbai", 4.8, 5, "available", "Rajesh Kumar", "House Cleaning"),
    ("priya_plumber", "priya@email.com", "9876543211", "Delhi", 4.5, 8, "available", "Priya Sharma", "Plumbing"),
    ("amit_electrician", "amit@email.com", "9876543212", "Bangalore", 4.9, 12, "available", "Amit Patel", "Electrical Work"),
    ("sunita_gardener", "sunita@email.com", "9876543213", "Pune", 4.3, 6, "busy", "Sunita Rao", "Gardening"),
    ("kumar_ac_tech", "kumar@email.com", "9876543214", "Chennai", 4.7, 10, "available", "Kumar Swamy", "AC Repair"),
    ("meera_painter", "meera@email.com", "9876543215", "Hyderabad", 4.6, 7, "available", "Meera Nair", "Painting"),
    ("ravi_carpenter", "ravi@email.com", "9876543216", "Kolkata", 4.4, 15, "available", "Ravi Das", "Carpentry"),
    ("anjali_appliance", "anjali@email.com", "9876543217", "Ahmedabad", 4.8, 9, "busy", "Anjali Mehta", "Appliance Repair"),
    ("deepak_cleaner", "deepak@email.com", "9876543218", "Mumbai", 4.2, 3, "available", "Deepak Joshi", "House Cleaning"),
    ("kavya_plumber", "kavya@email.com", "9876543219", "Delhi", 4.6, 6, "available", "Kavya Reddy", "Plumbing"),
    ("suresh_electrician", "suresh@email.com", "9876543220", "Bangalore", 4.9, 14, "available", "Suresh Babu", "Electrical Work"),
    ("neha_gardener", "neha@email.com", "9876543221", "Pune", 4.1, 4, "available", "Neha Gupta", "Gardening"),
    ("chef_priya", "chefpriya@email.com", "9876543222", "Mumbai", 4.9, 11, "available", "Chef Priya", "Cooking Service"),
    ("cook_ravi", "cookravi@email.com", "9876543223", "Delhi", 4.5, 7, "available", "Cook Ravi", "Cooking Service"),
]


def seed_database(db: Session) -> None:
    """Populate the DB if it is empty. Idempotent."""
    if db.query(models.Service).count() == 0:
        for name, desc, price in SERVICES:
            db.add(models.Service(name=name, description=desc, base_price=price))
        db.commit()

    service_by_name = {s.name: s for s in db.query(models.Service).all()}

    # Admin
    if not db.query(models.User).filter(models.User.username == "admin").first():
        db.add(models.User(
            username="admin", email="admin@digiseva.com", phone="000-000-0000",
            location="HQ", user_type="admin", password_hash=hash_password("admin123"),
        ))
        db.commit()

    # Professionals
    for (username, email, phone, location, rating, exp, avail, full_name, svc) in PROFESSIONALS:
        if db.query(models.User).filter(models.User.username == username).first():
            continue
        prof = models.User(
            username=username, email=email, phone=phone, location=location,
            user_type="professional", password_hash=hash_password("pass123"),
            rating=rating, experience_years=exp, availability=avail,
            full_name=full_name, hourly_rate=round(20 + rating * 5, 2),
            bio=f"Experienced {svc.lower()} professional with {exp} years on the job.",
            specializations=svc, service_areas=location, languages_spoken="English, Hindi",
        )
        db.add(prof)
        db.commit()
        db.refresh(prof)
        service = service_by_name.get(svc)
        if service:
            db.add(models.ProfessionalService(
                professional_id=prof.id, service_id=service.id, available=True
            ))
            db.commit()

    # A sample customer for convenience
    if not db.query(models.User).filter(models.User.username == "customer").first():
        db.add(models.User(
            username="customer", email="customer@digiseva.com", phone="111-111-1111",
            location="Mumbai", user_type="customer", password_hash=hash_password("customer123"),
        ))
        db.commit()
