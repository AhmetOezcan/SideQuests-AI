from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import json

app = FastAPI()

client = OpenAI()

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


@app.post("/generate")
def generate_goal_map(data: GoalRequest):

    prompt = f"""
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
    - Each step must be clear and actionable
    - Keep steps simple and practical
    - Adapt to the experience level
    - Adapt to the learning style

    Return ONLY valid JSON in this format:

    {{
      "tasks": [
        {{"title": "Step 1 description"}},
        {{"title": "Step 2 description"}}
      ]
    }}
    """

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    content = response.output_text

    try:
        parsed = json.loads(content)

        tasks = []
        for i, t in enumerate(parsed["tasks"]):
            tasks.append({
                "id": i + 1,
                "title": t["title"],
                "done": False
            })

        return {"tasks": tasks}

    except Exception as e:
        print("ERROR:", e)
        return {"tasks": []}
