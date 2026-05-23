from datetime import datetime

from app.core.config import BASE_HOURLY_RATE, PEAK_MULTIPLIER


def is_peak_hour(dt: datetime) -> bool:
    h = dt.hour
    return (8 <= h < 10) or (17 <= h < 20)


def compute_price(start: datetime, duration_hours: float) -> float:
    if duration_hours <= 0:
        return 0.0
    rate = BASE_HOURLY_RATE * (PEAK_MULTIPLIER if is_peak_hour(start) else 1.0)
    return round(rate * duration_hours, 2)
