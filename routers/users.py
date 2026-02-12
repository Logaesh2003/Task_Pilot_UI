import os
from dotenv import load_dotenv
load_dotenv()

import httpx
from fastapi import APIRouter, HTTPException

from .models import RegisterRequest, LoginRequest, TokenResponse
from helpers.security import verify_password
from helpers.jwt_encode import create_access_token, create_refresh_token

DB_SERVICE = os.getenv("DB_SERVICE_URL_PROD")

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(payload: RegisterRequest):
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{DB_SERVICE}/users", json=payload.dict())
        if res.status_code != 200:
            raise HTTPException(res.status_code, res.text)

    return {"message": "User registered successfully"}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{DB_SERVICE}/users/by-email/{payload.email}")
        if res.status_code != 200:
            raise HTTPException(401, "Invalid credentials")

        user = res.json()

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")

    return {
        "access_token": create_access_token(user["id"]),
        "refresh_token": create_refresh_token(user["id"])
    }
