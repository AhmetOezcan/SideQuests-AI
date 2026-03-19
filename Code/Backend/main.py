from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import json

app = FastAPI()

client = OpenAI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
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
    prompt = f"""
You are an expert learning planner.

The user has this goal:
{data.goal}

Desired outcome:
{data.outcome}

Experience level:
{data.experience}

Learning style:
{data.learningStyle}

Create a step-by-step plan.

Rules:
- Create between 4 and 8 steps
- Each step must be short and actionable
- Use simple language
- Adapt to the experience level
- Adapt to the learning style
- Return ONLY valid JSON

Example format:
{{
  "tasks": [
    {{"title": "Learn basic Python syntax"}},
    {{"title": "Write your first small Python program"}}
  ]
}}
"""

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt
        )

        content = response.output_text
        print("MODEL OUTPUT:")
        print(content)

        parsed = json.loads(content)

        tasks = []
        for i, task in enumerate(parsed["tasks"]):
            tasks.append({
                "id": i + 1,
                "title": task["title"],
                "done": False
            })

        return {"tasks": tasks}

    except Exception as e:
        print("ERROR IN /generate:")
        print(e)

        fallback_tasks = [
            {
                "id": 1,
                "title": f"Learn the basics of {data.goal} with a resource or AI tool of your choice.",
                "done": False
            },
            {
                "id": 2,
                "title": f"Define clearly what '{data.outcome}' means for your goal.",
                "done": False
            },
            {
                "id": 3,
                "title": f"Choose a first practice task suitable for a {data.experience} level.",
                "done": False
            },
            {
                "id": 4,
                "title": f"Continue using a {data.learningStyle} learning style.",
                "done": False
            }
        ]

        return {"tasks": fallback_tasks, "source": "fallback"}