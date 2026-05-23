from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_admin
from app.db.session import get_db
from app.models.models import Booking, ParkingSlot, User
from app.schemas.schemas import SlotUpdate, UserResponse

router = APIRouter()


class AdminBookingRow(BaseModel):
    id: int
    slot_label: str
    username: str
    phone: str
    registration_plate: str
    vehicle_make: str
    start_time: datetime
    end_time: datetime
    duration_hours: float
    total_price: float
    status: str
    payment_status: str


def _booking_row(db: Session, b: Booking) -> AdminBookingRow:
    user = db.query(User).filter(User.id == b.user_id).first()
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == b.slot_id).first()
    return AdminBookingRow(
        id=b.id,
        slot_label=slot.label if slot else "?",
        username=user.username if user else "?",
        phone=user.phone if user else "?",
        registration_plate=b.registration_plate,
        vehicle_make=b.vehicle_make,
        start_time=b.start_time,
        end_time=b.end_time,
        duration_hours=b.duration_hours,
        total_price=b.total_price,
        status=b.status,
        payment_status=b.payment_status,
    )


@router.get("/bookings", response_model=list[AdminBookingRow])
def all_bookings(db: Session = Depends(get_db), _admin: User = Depends(get_admin)):
    rows = db.query(Booking).order_by(Booking.start_time.desc()).all()
    return [_booking_row(db, b) for b in rows]


@router.get("/users", response_model=list[UserResponse])
def all_users(db: Session = Depends(get_db), _admin: User = Depends(get_admin)):
    return db.query(User).order_by(User.id).all()


@router.patch("/slots/{slot_id}")
def update_slot(
    slot_id: int,
    body: SlotUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin),
):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if body.is_enabled is not None:
        slot.is_enabled = body.is_enabled
    if body.label is not None:
        slot.label = body.label.strip()
    if body.sensor_occupied is not None:
        slot.sensor_occupied = body.sensor_occupied
    db.commit()
    return {"ok": True, "slot_id": slot_id}


class BookingStatusBody(BaseModel):
    status: str
    payment_status: str | None = None


@router.patch("/bookings/{booking_id}")
def patch_booking(
    booking_id: int,
    body: BookingStatusBody,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin),
):
    allowed_status = {"confirmed", "pending", "cancelled", "completed"}
    allowed_pay = {"pending", "paid", "refunded"}
    if body.status not in allowed_status:
        raise HTTPException(status_code=400, detail="Invalid status")
    if body.payment_status is not None and body.payment_status not in allowed_pay:
        raise HTTPException(status_code=400, detail="Invalid payment_status")
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    b.status = body.status
    if body.payment_status is not None:
        b.payment_status = body.payment_status
    db.commit()
    return {"ok": True}
