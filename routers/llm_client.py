import os
from dotenv import load_dotenv
load_dotenv()

import asyncio
import time
import httpx
import requests
import logging
import datetime


from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends
from .models import AiAskRequest, AiAskResponse, AiSuggestion, InitialSuggestionRequest, CreateSubtask, AIContextItem
from helpers import ai_history_service
from helpers.jwt_decode import get_current_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix = "/llm",
    tags = ["llm"]
)

DB_SERVICE = os.getenv("DB_SERVICE_URL_PROD")
LLM_LOCAL = os.getenv("LLM_URL_LOCAL")
LLM_PRODUCTION = os.getenv("LLM_URL_PRODUCTION")

@router.post("/initial-suggestions")
def initial_ai_suggestions(tasks: InitialSuggestionRequest):
    suggestions = []

    tasks = normalize_tasks(tasks.tasks)

    logger.info(f"Initial suggestion {tasks}")

    todayDate = datetime.date.today().strftime("%Y-%m-%d")  
    high_priority = [t for t in tasks if t.get("priority") == "High" and not t.get("completed") and t.get("due_date") == todayDate]
    if high_priority:
        suggestions.append(
            AiSuggestion(
                title="Start with high-priority tasks",
                reason=f"You have {len(high_priority)} high-priority task(s) pending"
            )
        )

    due_today = [t for t in tasks if t.get("due_date") == todayDate]
    if due_today:
        suggestions.append(
            AiSuggestion(
                title="Focus on tasks due soon",
                reason=f"{len(due_today)} task(s) have a due today"
            )
        )


    if not suggestions:
        suggestions.append(
            AiSuggestion(
                title="You’re on track",
                reason="No urgent or high-priority tasks detected"
            )
        )

    return {"suggestions": suggestions}



@router.post("/ask")
async def ask(payload: AiAskRequest, user_id=Depends(get_current_user)):
    tasks = payload.tasks

    logger.info(f"ASK AI payload {tasks}")

    # Sort by priority
    priority_order = {"High": 1, "Medium": 2, "Low": 3}
    sorted_tasks = sorted(
        tasks,
        key=lambda t: priority_order.get(t.priority, 99)
    )

     # Fetch history from DB service
    history = ai_history_service.get_recent_history(user_id)

    # Build context - validate responses have required fields
    context = []
    for h in history:
        try:
            response = h.get("response", {})
            # Only include if response has required AiResponse fields
            if isinstance(response, dict) and "title" in response and "items" in response and "followUps" in response:
                context.append(
                    AIContextItem(
                        previousAIresponse=response,
                        prompt=h.get("prompt", "")
                    )
                )
        except Exception as e:
            logger.warning(f"Skipping invalid history entry: {e}")
            continue

    url = f"{LLM_PRODUCTION}/assist"

    payload.tasks = sorted_tasks
    payload.context = context

    logger.info(f"Payload before sending it to LLM {payload}")

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json = payload.model_dump(mode = "json"))
        response = res.json()
        logger.info("Received response from LLM : {response}")


    # Save interaction
    ai_history_service.save_history({
        "user_id": user_id,
        "prompt": payload.prompt,
        "response": response,
    })


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
