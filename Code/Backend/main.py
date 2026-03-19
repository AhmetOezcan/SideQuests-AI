from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

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
    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=f"""
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
Make it practical, clear, and appropriate for the user's level.
""",
            text={
                "format": {
                    "type": "json_schema",
                    "name": "goal_map",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "tasks": {
                                "type": "array",
                                "minItems": 4,
                                "maxItems": 8,
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"}
                                    },
                                    "required": ["title"],
                                    "additionalProperties": False
                                }
                            }
                        },
                        "required": ["tasks"],
                        "additionalProperties": False
                    }
                }
            }
        )

        content = response.output_text
        print("MODEL OUTPUT:")
        print(content)

        import json
        parsed = json.loads(content)

        tasks = []
        for i, task in enumerate(parsed["tasks"]):
            tasks.append({
                "id": i + 1,
                "title": task["title"],
                "done": False
            })

        return {"tasks": tasks, "source": "openai"}

    except Exception as e:
        print("ERROR:", e)

        return {
            "tasks": [
                {
                    "id": 1,
                    "title": "Something went wrong. Please try again.",
                    "done": False
                }
            ],
            "source": "fallback",
            "error": str(e)
            }