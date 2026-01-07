import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import APIRouter, HTTPException, requests
from .models import User

router = APIRouter(
    prefix = "/users",
    tags = ["users"]
)


@router.post("/create")
def create_user(user : User):
    url = f"http://localhost:5014/create/users"
    res = requests.post(url , user = user)
    return {"message" : "User created successfully"}

@router.get("/get")
def get_user(user : User):
    url = f"http://localhost:5014/search/user"
    res = requests.post(url , user = user)
    return {"result" : res}

# @router.put("/update")
# def update_user():


# @router.delete("/delete")
# def delete_user():
