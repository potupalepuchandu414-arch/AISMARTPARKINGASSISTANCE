from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admin, auth, bookings, hardware, slots
from app.core.security import hash_password
from app.db.session import Base, SessionLocal, engine
from app.models.models import ParkingSlot, User


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    _seed_database()
    yield


def _seed_database() -> None:
    db = SessionLocal()
    try:
        if db.query(ParkingSlot).count() == 0:
            for i in range(1, 11):
                db.add(
                    ParkingSlot(
                        id=i,
                        label=f"P-{i:02d}",
                        is_enabled=True,
                        sensor_occupied=False,
                    )
                )
            db.commit()
        if db.query(User).filter(User.username == "admin").first() is None:
            db.add(
                User(
                    username="admin",
                    phone="0000000000",
                    hashed_password=hash_password("admin123"),
                    is_admin=True,
                    is_online=False,
                )
            )
            db.commit()
    finally:
        db.close()


app = FastAPI(title="EXSEL Smart Parking API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://aismartparking.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(slots.router, prefix="/slots", tags=["slots"])
app.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(hardware.router, prefix="/hardware", tags=["hardware"])


@app.get("/health")
def health():
    return {"status": "ok"}
