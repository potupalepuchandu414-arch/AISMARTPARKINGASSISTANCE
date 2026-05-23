from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import Booking, ParkingSlot, User
from app.schemas.schemas import SlotResponse

router = APIRouter()


def _build_slot_list(db: Session) -> list[SlotResponse]:
    now = datetime.utcnow()
    slots = db.query(ParkingSlot).order_by(ParkingSlot.id).all()
    out: list[SlotResponse] = []
    for s in slots:
        occupied_booking = False
        for b in (
            db.query(Booking)
            .filter(Booking.slot_id == s.id, Booking.status.in_(["confirmed", "pending"]))
            .all()
        ):
            end = b.start_time + timedelta(hours=b.duration_hours)
            if b.start_time <= now < end:
                occupied_booking = True
                break
        available = s.is_enabled and not s.sensor_occupied and not occupied_booking
        out.append(
            SlotResponse(
                id=s.id,
                label=s.label,
                is_enabled=s.is_enabled,
                sensor_occupied=s.sensor_occupied,
                available_for_booking=available,
            )
        )
    return out


@router.get("", response_model=list[SlotResponse])
def list_slots(_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _build_slot_list(db)


@router.get("/public", response_model=list[SlotResponse])
def list_slots_public(db: Session = Depends(get_db)):
    return _build_slot_list(db)


def slot_free_for_interval(
    db: Session, slot_id: int, start: datetime, duration_hours: float, exclude_booking_id: int | None = None
) -> bool:
    new_end = start + timedelta(hours=duration_hours)
    q = db.query(Booking).filter(
        Booking.slot_id == slot_id,
        Booking.status.in_(["confirmed", "pending"]),
    )
    if exclude_booking_id:
        q = q.filter(Booking.id != exclude_booking_id)
    for b in q.all():
        b_end = b.start_time + timedelta(hours=b.duration_hours)
        if start < b_end and b.start_time < new_end:
            return False
    return True
