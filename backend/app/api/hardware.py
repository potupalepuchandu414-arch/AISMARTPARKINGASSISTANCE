import os

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import ParkingSlot
from app.schemas.schemas import HardwareSlotUpdate

router = APIRouter()

HARDWARE_API_KEY = os.getenv("HARDWARE_API_KEY", "").strip()


def verify_hardware_key(x_api_key: str | None = Header(None, alias="X-API-Key")):
    """If HARDWARE_API_KEY is set, require matching X-API-Key. If unset, allow (prototype / lab only)."""
    if not HARDWARE_API_KEY:
        return
    if not x_api_key or x_api_key != HARDWARE_API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")


@router.patch(
    "/slots/{slot_id}/sensor",
    dependencies=[Depends(verify_hardware_key)],
)
def update_sensor(
    slot_id: int,
    body: HardwareSlotUpdate,
    db: Session = Depends(get_db),
):
    """ESP32 / IR: PATCH occupancy per slot. Example: curl -X PATCH .../hardware/slots/3/sensor -H \"Content-Type: application/json\" -d '{\"sensor_occupied\": true}'"""
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    slot.sensor_occupied = body.sensor_occupied
    db.commit()
    return {"ok": True, "slot_id": slot_id, "sensor_occupied": body.sensor_occupied}
