import os
import logging
import httpx
import json
import requests
from dotenv import load_dotenv
load_dotenv()

from fastapi import APIRouter
from .models import Task, FetchTask, DeleteTask, UpdateTask, GetTask, ToggleTask, ToggleSubtask, DeleteSubtask

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix = "/tasks",
    tags = ["tasks"]
)

@router.post("/create")
async def create_tasks(task : Task):

    task.user_id = 1
    logger.info(f"Task payload = {task}")
    url = "http://localhost:5014/create/tasks"

    async with httpx.AsyncClient(timeout=5) as client:
        res = await client.post(url, json = task.model_dump(mode="json"))


    return {"message" : "Tasks created successfully"}


@router.post("/search")
async def search_tasks(payload : FetchTask):

    url = f"http://localhost:5014/search/userTasks"
    
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

    url = f"http://localhost:5014/delete/task"

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    
    return res.json()



@router.put("/update")
async def update_task(payload : UpdateTask):
    
    logger.info(payload)

    url = f"http://localhost:5014/update/task"

    async with httpx.AsyncClient() as client:
        res = await client.put(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    return res.json()



@router.post("/getTask")
async def get_task(payload : GetTask):

    logger.info(payload)

    url = f"http://localhost:5014/search/task"

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    
    return res.json()

@router.put("/toggleTask")
async def toggle_task(payload : ToggleTask):
    logger.info(payload)

    url = f"http://localhost:5014/update/toggleTask"

    async with httpx.AsyncClient() as client:
        res = await client.put(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    return res.json()

@router.get("/{task_id}/subtasks")
def get_subtasks(task_id: int):
    url = f"http://localhost:5014/search/tasks/{task_id}/subtasks"
    response = requests.get(
        url
    )

    return response.json()

@router.put("/toggleSubtask")
async def toggle_task(payload : ToggleSubtask):
    logger.info(payload)

    url = f"http://localhost:5014/update/toggleSubtask"

    async with httpx.AsyncClient() as client:
        res = await client.put(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    return res.json()

@router.post("/deleteSubtask")
async def delete_subtask(payload : DeleteSubtask):

    logger.info(payload)

    url = f"http://localhost:5014/delete/subtask"

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json = payload.model_dump(mode="json"))
        logger.info(res.json())
    
    return res.json()
