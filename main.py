import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import users, tasks, llm_client

app = FastAPI(
    title = "Task Pilot User Interface",
    docs_url = "/swagger",
    description = "Assists in planning your day with the help of Gen AI",
    version = "1.0",
    servers = [
        {
            "url": "http://localhost:8000",
            "description": "Local development server"
        }
    ],
    swagger_ui_parameters = {"defaultModelsExpandDepth" : -1}
    
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static",StaticFiles(directory="static"),name="static")

app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(llm_client.router)


if __name__ == "__main__":
    uvicorn.run(app,host="localhost",port=8000)

