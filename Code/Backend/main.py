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

Create a clear step-by-step SideQuests learning path.

Rules:
- Return between 4 and 8 tasks total
- The structure must stay like a sequence of small quests
- Each task must contain:
  1. a short German title
  2. a small, directly usable German prompt that the user can copy into any AI tool
  3. an estimated number of minutes to invest
- The prompts must help the user learn the topic step by step, not just describe what to do
- Adapt the difficulty to the user's level
- Adapt the structure to the user's learning style
- Keep the wording simple, concrete, and practical
- Each prompt should be self-contained and ready to paste
- Each prompt should be short: usually 1 to 3 sentences
- Avoid vague tasks like "learn more", "research", or "read about it"
- Do not mention model names or specific AI brands
- The final task must be a test quest that gives a prompt for generating a test on the learned topic
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
                                        "title": {"type": "string"},
                                        "prompt": {"type": "string"},
                                        "estimatedMinutes": {
                                            "type": "integer",
                                            "minimum": 5,
                                            "maximum": 90
                                        }
                                    },
                                    "required": ["title", "prompt", "estimatedMinutes"],
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
                "prompt": task["prompt"],
                "estimatedMinutes": task["estimatedMinutes"],
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
                "title": f"Überblick zu {data.topic}",
                "prompt": (
                    f"Erkläre mir {data.topic} auf {data.level}-Niveau in einfachen Worten. "
                    f"Gib mir zuerst einen klaren Überblick, dann die 3 bis 5 wichtigsten Grundlagen "
                    f"und schließe mit einer kleinen Verständnisfrage ab."
                ),
                "estimatedMinutes": 15,
                "done": False,
            },
            {
                "id": 2,
                "title": "Grundlagen festigen",
                "prompt": (
                    f"Führe mich Schritt für Schritt durch die wichtigsten Grundlagen von {data.topic}. "
                    f"Nutze einen {data.learningStyle}-Lernstil und baue kurze Beispiele ein, "
                    f"damit ich den Stoff wirklich verstehe."
                ),
                "estimatedMinutes": 20,
                "done": False,
            },
            {
                "id": 3,
                "title": "Erste Übungsquest",
                "prompt": (
                    f"Gib mir eine kleine Übung zu {data.topic}, passend für {data.level}. "
                    f"Lass mich zuerst selbst nachdenken, gib danach Feedback auf meine Lösung "
                    f"und erkläre meine Fehler verständlich."
                ),
                "estimatedMinutes": 25,
                "done": False,
            },
            {
                "id": 4,
                "title": "Mini-Test erzeugen",
                "prompt": (
                    f"Erstelle mir einen kurzen Test zu {data.topic}, passend für {data.level}. "
                    f"Der Test soll 8 bis 10 Fragen mit gemischtem Schwierigkeitsgrad enthalten. "
                    f"Gib die Lösungen erst nach meinem Versuch mit kurzen Erklärungen aus."
                ),
                "estimatedMinutes": 20,
                "done": False,
            }
        ]

        return {
            "tasks": fallback_tasks,
            "source": "fallback",
            "error": str(e)
        }
