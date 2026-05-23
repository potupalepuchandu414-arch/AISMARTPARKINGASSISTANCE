from datetime import datetime

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=8, max_length=20)
    password: str = Field(min_length=4)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    phone: str
    is_admin: bool
    is_online: bool
    last_seen: datetime | None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SlotResponse(BaseModel):
    id: int
    label: str
    is_enabled: bool
    sensor_occupied: bool
    available_for_booking: bool

    class Config:
        from_attributes = True


class SlotUpdate(BaseModel):
    is_enabled: bool | None = None
    label: str | None = Field(None, max_length=20)
    sensor_occupied: bool | None = None


class BookingCreate(BaseModel):
    slot_id: int
    vehicle_make: str = Field(max_length=80)
    registration_plate: str = Field(max_length=32)
    start_time: datetime
    duration_hours: float = Field(gt=0, le=168)


class BookingQuote(BaseModel):
    slot_id: int
    start_time: datetime
    duration_hours: float = Field(gt=0, le=168)
    estimated_price: float


class BookingResponse(BaseModel):
    id: int
    user_id: int
    slot_id: int
    slot_label: str
    vehicle_make: str
    registration_plate: str
    start_time: datetime
    end_time: datetime
    duration_hours: float
    total_price: float
    status: str
    payment_status: str

    class Config:
        from_attributes = True


class HardwareSlotUpdate(BaseModel):
    """Connection-ready payload for IoT (ESP32 / IR). Optional API key in header."""
    sensor_occupied: bool
