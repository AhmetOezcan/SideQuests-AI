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
    topic: str
    studyReason: str
    level: str
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
You are an expert study coach for students and pupils.

The user wants to learn:
{data.topic}

They are learning it for:
{data.studyReason}

Current level:
{data.level}

Preferred learning style:
{data.learningStyle}

Create a clear step-by-step study plan.

Rules:
- Create between 4 and 8 tasks
- Each task must be short, clear, and actionable
- Focus on learning and understanding
- Adapt the difficulty to the user's level
- Adapt the structure to the user's learning style
- Keep the wording simple
""",
            text={
                "format": {
                    "type": "json_schema",
                    "name": "study_plan",
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

        parsed = json.loads(content)

        tasks = []
        for i, task in enumerate(parsed["tasks"]):
            tasks.append({
                "id": i + 1,
                "title": task["title"],
                "done": False
            })

        return {
            "tasks": tasks,
            "source": "openai"
        }

    except Exception as e:
        print("ERROR IN /generate:")
        print(e)

        fallback_tasks = [
            {
                "id": 1,
                "title": f"Get an overview of {data.topic} using your notes, a textbook, or an AI tool.",
                "done": False
            },
            {
                "id": 2,
                "title": f"Identify the most important basics of {data.topic}.",
                "done": False
            },
            {
                "id": 3,
                "title": f"Work on a first learning task that fits a {data.level} level.",
                "done": False
            },
            {
                "id": 4,
                "title": f"Continue studying {data.topic} in a {data.learningStyle} way.",
                "done": False
            }
        ]

        return {
            "tasks": fallback_tasks,
            "source": "fallback",
            "error": str(e)
        }