"""DigiSeva FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import Base, SessionLocal, engine
from routers import admin, auth, bookings, professional, services
from seed import seed_database

app = FastAPI(title="DigiSeva API", version="1.0.0")

# Allow the Vite dev server (and common local origins) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "DigiSeva API"}


app.include_router(auth.router)
app.include_router(services.router)
app.include_router(bookings.router)
app.include_router(professional.router)
app.include_router(admin.router)
