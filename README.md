# 🧠 Task-Pilot UI  
**AI-Powered Task Management — Frontend + API Gateway**

Task-Pilot UI is the main user-facing service of the Task-Pilot platform.  
It serves:

• Angular frontend  
• Authentication (JWT)  
• Task APIs  
• AI orchestration 

    Angular → /ai/ask
        → UI Backend
        → DB Service (fetch tasks)
        → DB Service (fetch AI history)
        → LLM Service
        → Structured JSON
        → Stored in ai_history table
        → Returned to UI

• Database orchestration  

This service is the **only backend exposed to the browser**.

---

# 📦 Tech Stack

| Layer | Tech |
|------|------|
| UI | Angular 17 |
| Backend | FastAPI |
| Auth | JWT + Basic Auth |
| AI | LangChain + Groq |
| Database | PostgreSQL (Railway) |
| Hosting | Railway |

---

## 🏗 Architecture

Browser
↓
Task-Pilot-UI (FastAPI + Angular)
↓
Task-Pilot-DB (Postgres Microservice)
Task-Pilot-LLM (AI Microservice)

---

# 📁 Repo Structure

TASK_PILOT_UI/
|
|-- frontend/
|
├── routers/
│ ├── models.py
│ ├── users.py
│ ├── tasks.py
│ └── llm_client.py
├── static/ ← Angular build goes here
├── main.py
├── requirements.txt
└── .env


## 3️⃣ Start UI Backend
cd Task_Pilot_UI
pip install -r requirements.txt
python main.py


## 4️⃣ Start Angular
cd Task_Pilot_UI/frontend
ng serve - Angular runs on localhost:4200

---


# 🏗 Build Angular for Production

From Angular project:

ng build

# 📦 Copy Angular into FastAPI

From Angular project root: 

cp -r dist/frontend/browser/* ../static/