import os
from dotenv import load_dotenv
load_dotenv()

import logging
import httpx
import json
import requests
from fastapi import APIRouter, Depends

from helpers.jwt_decode import get_current_user
from .models import Task, FetchTask, DeleteTask, UpdateTask, GetTask, ToggleTask, ToggleSubtask, DeleteSubtask

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_SERVICE = os.getenv("DB_SERVICE_URL_PROD")

router = APIRouter(
    prefix = "/tasks",
    tags = ["tasks"]
)

@router.post("/create")
async def create_tasks(task : Task, user_id=Depends(get_current_user)):

    logger.info("Payload from frontend : ",task)
    task.user_id = int(user_id)
    logger.info(f"Current User = {user_id}")
    url = f"{DB_SERVICE}/create/tasks"

    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.post(url, json = task.model_dump(mode="json"))


    return {"message" : "Tasks created successfully"}


@router.get("/search")
async def search_tasks(user_id=Depends(get_current_user)):

    payload = FetchTask(
        user_id = int(user_id)
    )

    url = f"{DB_SERVICE}/search/userTasks"
    
    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.post(url, json = payload.model_dump(mode="json"))
        r = res.json()
        logger.info(f"Full response: {r}")
        result = r
        logger.info(f"Tasks: {result}")

    return result



@router.post("/delete")
async def delete_task(payload : DeleteTask):

    logger.info(payload)

    url = f"{DB_SERVICE}/delete/task"

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    
    return res.json()



@router.put("/update")
async def update_task(payload : UpdateTask):
    
    logger.info(payload)

    url = f"{DB_SERVICE}/update/task"

    async with httpx.AsyncClient() as client:
        res = await client.put(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    return res.json()


@router.post("/getTask")
async def get_task(payload : GetTask):

    logger.info(payload)

    url = f"{DB_SERVICE}/search/task"

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    
    return res.json()


@router.put("/toggleTask")
async def toggle_task(payload : ToggleTask):
    logger.info(payload)

    url = f"{DB_SERVICE}/update/toggleTask"

    async with httpx.AsyncClient() as client:
        res = await client.put(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    return res.json()

@router.get("/{task_id}/subtasks")
def get_subtasks(task_id: int):
    url = f"{DB_SERVICE}/search/tasks/{task_id}/subtasks"
    response = requests.get(
        url
    )

    return response.json()

@router.put("/toggleSubtask")
async def toggle_task(payload : ToggleSubtask):
    logger.info(payload)

    url = f"{DB_SERVICE}/update/toggleSubtask"

    async with httpx.AsyncClient() as client:
        res = await client.put(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    return res.json()

@router.post("/deleteSubtask")
async def delete_subtask(payload : DeleteSubtask):

    logger.info(payload)

    url = f"{DB_SERVICE}/delete/subtask"

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    
    return res.json()
