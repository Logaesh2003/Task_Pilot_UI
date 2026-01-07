import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import asyncio
import time
import httpx
import requests

from fastapi.responses import StreamingResponse
from fastapi import APIRouter
from .models import AiAskRequest, AiAskResponse, AiSuggestion, InitialSuggestionRequest, CreateSubtask

router = APIRouter(
    prefix = "/llm",
    tags = ["llm"]
)

DB_SERVICE = "http://localhost:5014"

@router.post("/initial-suggestions")
def initial_ai_suggestions(tasks: InitialSuggestionRequest):
    suggestions = []

    tasks = normalize_tasks(tasks.tasks)

    logger.info(f"Initial suggestion {tasks}")

    # Rule 1: High priority tasks
    high_priority = [t for t in tasks if t.get("priority") == "High" and not t.get("completed")]
    if high_priority:
        suggestions.append(
            AiSuggestion(
                title="Start with high-priority tasks",
                reason=f"You have {len(high_priority)} high-priority task(s) pending"
            )
        )

    # Rule 2: Tasks due today
    due_today = [t for t in tasks if t.get("due_date")]
    if due_today:
        suggestions.append(
            AiSuggestion(
                title="Focus on tasks due soon",
                reason=f"{len(due_today)} task(s) have a due date"
            )
        )

    # Rule 3: No urgent tasks
    if not suggestions:
        suggestions.append(
            AiSuggestion(
                title="You’re on track",
                reason="No urgent or high-priority tasks detected"
            )
        )

    return {"suggestions": suggestions}



@router.post("/ask")
async def ask_ai(payload: AiAskRequest):
    tasks = payload.tasks

    logger.info(f"ASK AI payload {tasks}")

    # Sort by priority (simple logic)
    priority_order = {"High": 1, "Medium": 2, "Low": 3}
    sorted_tasks = sorted(
        tasks,
        key=lambda t: priority_order.get(t.priority, 99)
    )
    payload.tasks = sorted_tasks

    logger.info(f"Payload before sending it to LLM {payload}")

    url = f"http://localhost:7000/assist"

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json = payload.model_dump(mode = "json"))
        response = res.json()
        logger.info("Received response from LLM : {response}")


    return response


@router.post("/subtasks/create")
def create_subtasks(payload: dict):
    created = []

    for sub in payload["subtasks"]:
        requests.post(
            f"{DB_SERVICE}/create/subtasks",
            json={
                "task_id": sub["parentTaskId"],
                "title": sub["title"],
                "estimate": sub.get("estimate"),
                "priority": sub.get("priority"),
                "source": "ai",
                "confidence": 0.85
            }
        )
        created.append(sub["title"])

    return {
        "status": "created",
        "count": len(created)
    }


@router.post("/subtasks/replace")
def replace_subtasks(payload: CreateSubtask):
    logger.info("Incoming payload :",payload)

    response = requests.post(
        f"{DB_SERVICE}/create/subtasks/replace",
        json = payload.model_dump(mode="json")
    )

    return response.json()



def normalize_tasks(tasks):
    normalized = []

    for t in tasks:
        if hasattr(t, "id"):  # TaskContext
            normalized.append({
                "id": t.id,
                "title": t.title,
                "completed": t.completed,
                "priority": t.priority,
                "due_date": t.dueDate,
                "description": t.description
            })
        else:  # tuple
            normalized.append({
                "id": t[0] if len(t) > 0 else None,
                "title": t[1] if len(t) > 1 else None,
                "completed": t[2] if len(t) > 2 else False,
                "due_date": t[3] if len(t) > 3 else None,
                "description": t[4] if len(t) > 4 else None,
                "priority": t[5] if len(t) > 5 else None
            })

    return normalized


