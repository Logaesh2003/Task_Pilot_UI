import os
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse

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


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:4200",
#         "http://127.0.0.1:4200",
#         "http://localhost:8000",    
#         "http://127.0.0.1:8000"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

STATIC_DIR = "static"
INDEX_FILE = os.path.join(STATIC_DIR, "index.html")

app.mount("/static",StaticFiles(directory=STATIC_DIR),name="static")


app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(llm_client.router)

# Serve index.html for Angular routes
@app.get("/", include_in_schema=False)
def serve_spa():
    return RedirectResponse(url="/login")


@app.get("/{full_path:path}", include_in_schema=False)
def serve_spa(full_path: str):
    file_path = os.path.join(STATIC_DIR, full_path)

    # If real file exists (js, css, assets) → serve it
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # Otherwise return Angular index.html
    return FileResponse(INDEX_FILE)


if __name__ == "__main__":
    uvicorn.run(app,host="localhost",port=8000)

