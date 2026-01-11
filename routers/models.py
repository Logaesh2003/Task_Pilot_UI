from pydantic import BaseModel, EmailStr
from sqlmodel import SQLModel, Field
from typing import Optional, List, Literal
from datetime import date, datetime

class User(BaseModel):
    user_name : str
    email : str
    password : str

class Task(BaseModel):
    user_id : Optional[int] = None
    title : str
    description : Optional[str] = None
    dueDate : date
    priority : str
    completed : bool = False

class FetchTask(BaseModel):
    user_id : Optional[int] | None

class DeleteTask(BaseModel):
    task_id : Optional[int] | None

class ToggleTask(BaseModel):
    task_id : Optional[int] | None

class GetTask(BaseModel):
    task_id : Optional[int] | None

class UpdateTask(BaseModel):
    task_id : Optional[int] = None
    title : str
    description : Optional[str] = None
    dueDate : date
    priority : str

# AI models

class TaskContext(BaseModel):
    id: int
    title: str
    completed: bool
    priority: Optional[str] = None
    description: Optional[str] = None
    dueDate: Optional[str] |None

class PlanItem(BaseModel):
    taskId: Optional[int]
    title: Optional[str]
    meta: Optional[str] = None

class AiResponse(BaseModel):
    type: Optional[str] = "plan"
    title: Optional[str] = None
    items: Optional[List[PlanItem]] = None
    followUps: Optional[List[str]] = None

class AIContextItem(BaseModel):
    prompt: str
    previousAIresponse: AiResponse
    created_at: Optional[datetime] = None


class AiAskRequest(BaseModel):
    prompt: str
    context: List[AIContextItem] = []
    tasks: List[TaskContext]


class AiSuggestion(BaseModel):
    title: str
    reason: str


class AiAskResponse(BaseModel):
    suggestions: List[AiSuggestion]

class InitialSuggestionRequest(BaseModel):
    tasks: List[TaskContext]



# Subtasks

class ToggleSubtask(BaseModel):
    id : Optional[int] | None

class DeleteSubtask(BaseModel):
    id : Optional[int] | None

class subTaskContext(BaseModel):
    estimate : Optional[str] | None
    priority : Optional[str] | None
    title : Optional[str] | None

class CreateSubtask(BaseModel):
    parentTaskId: Optional[int] | None
    subtasks: List[subTaskContext]

# AUTH Models

class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"