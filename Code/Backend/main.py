from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GoalRequest(BaseModel):
    goal: str
    outcome: str
    experience: str
    learningStyle: str

@app.get("/")
def read_root():
    return {"message": "SideQuests backend is running"}

@app.post("/generate")
def generate_goal_map(data: GoalRequest):
    demo_tasks = [
        {
            "id": 1,
            "title": f"Understand the fundamentals needed for: {data.goal}",
            "done": False,
        },
        {
            "id": 2,
            "title": f"Focus on this concrete result: {data.outcome}",
            "done": False,
        },
        {
            "id": 3,
            "title": f"Follow a {data.learningStyle} learning approach for your next step",
            "done": False,
        },
        {
            "id": 4,
            "title": f"Choose a task that fits your {data.experience} experience level and complete it",
            "done": False,
        },
    ]

    return {
        "goal": data.goal,
        "tasks": demo_tasks,
    }