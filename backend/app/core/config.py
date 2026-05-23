import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smart_parking.db")
SECRET_KEY = os.getenv("SECRET_KEY", "exsel-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
BASE_HOURLY_RATE = float(os.getenv("BASE_HOURLY_RATE", "50"))
PEAK_MULTIPLIER = float(os.getenv("PEAK_MULTIPLIER", "1.25"))
