from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.slots import slot_free_for_interval
from app.db.session import get_db
from app.models.models import Booking, ParkingSlot, User
from app.schemas.schemas import BookingCreate, BookingQuote, BookingResponse
from app.services.pricing import compute_price

router = APIRouter()


def _to_response(b: Booking, slot_label: str) -> BookingResponse:
    return BookingResponse(
        id=b.id,
        user_id=b.user_id,
        slot_id=b.slot_id,
        slot_label=slot_label,
        vehicle_make=b.vehicle_make,
        registration_plate=b.registration_plate,
        start_time=b.start_time,
        end_time=b.end_time,
        duration_hours=b.duration_hours,
        total_price=b.total_price,
        status=b.status,
        payment_status=b.payment_status,
    )


@router.post("/quote", response_model=BookingQuote)
def quote(body: BookingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == body.slot_id).first()
    if not slot or not slot.is_enabled:
        raise HTTPException(status_code=400, detail="Invalid or disabled slot")
    price = compute_price(body.start_time, body.duration_hours)
    return BookingQuote(
        slot_id=body.slot_id,
        start_time=body.start_time,
        duration_hours=body.duration_hours,
        estimated_price=price,
    )


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(body: BookingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == body.slot_id).first()
    if not slot or not slot.is_enabled:
        raise HTTPException(status_code=400, detail="Invalid or disabled slot")
    if slot.sensor_occupied:
        raise HTTPException(status_code=409, detail="Slot reports occupied (sensor)")

    if not slot_free_for_interval(db, body.slot_id, body.start_time, body.duration_hours):
        raise HTTPException(status_code=409, detail="Slot already booked for this time range")

    total = compute_price(body.start_time, body.duration_hours)
    booking = Booking(
        user_id=user.id,
        slot_id=body.slot_id,
        vehicle_make=body.vehicle_make.strip(),
        registration_plate=body.registration_plate.strip().upper(),
        start_time=body.start_time,
        duration_hours=body.duration_hours,
        total_price=total,
        status="confirmed",
        payment_status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _to_response(booking, slot.label)


@router.get("/me", response_model=list[BookingResponse])
def my_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(Booking).filter(Booking.user_id == user.id).order_by(Booking.start_time.desc()).all()
    out = []
    for b in rows:
        slot = db.query(ParkingSlot).filter(ParkingSlot.id == b.slot_id).first()
        out.append(_to_response(b, slot.label if slot else "?"))
    return out


@router.post("/{booking_id}/pay", response_model=BookingResponse)
def confirm_payment(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    b = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    b.payment_status = "paid"
    db.commit()
    db.refresh(b)
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == b.slot_id).first()
    return _to_response(b, slot.label if slot else "?")
