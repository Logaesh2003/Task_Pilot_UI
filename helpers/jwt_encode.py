import os
from dotenv import load_dotenv
load_dotenv()

from datetime import datetime, timedelta, timezone
from jose import jwt

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM")

def create_access_token(user_id: int):

    expire = datetime.now(timezone.utc) + timedelta(hours=10)

    return jwt.encode(
        {
            "sub": str(user_id),
            "exp": expire
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def create_refresh_token(user_id: int):
    return jwt.encode(
        {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(days=7)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
