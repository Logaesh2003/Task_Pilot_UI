import requests
import os
from dotenv import load_dotenv
load_dotenv()

DB_SERVICE_URL = os.getenv("DB_SERVICE_URL_LOCAL")


def get_recent_history(user_id: int, limit: int = 5):
    res = requests.get(
        f"{DB_SERVICE_URL}/ai-history/{user_id}",
        params={"limit": limit}
    )
    res.raise_for_status()
    return res.json()


def save_history(payload: dict):
    requests.post(f"{DB_SERVICE_URL}/ai-history/", json=payload)
