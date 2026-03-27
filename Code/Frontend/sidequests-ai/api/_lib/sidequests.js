import OpenAI from "openai";

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function createFallbackTasks(data) {
  return [
    {
      id: 1,
      title: `Uberblick zu ${data.topic}`,
      prompt:
        `Erklare mir ${data.topic} auf ${data.level}-Niveau in einfachen Worten. ` +
        "Gib mir zuerst einen klaren Uberblick, dann die 3 bis 5 wichtigsten Grundlagen " +
        "und schliesse mit einer kleinen Verstandnisfrage ab.",
      estimatedMinutes: 15,
      done: false,
    },
    {
      id: 2,
      title: "Grundlagen festigen",
      prompt:
        `Fuhre mich Schritt fur Schritt durch die wichtigsten Grundlagen von ${data.topic}. ` +
        `Nutze einen ${data.learningStyle}-Lernstil und baue kurze Beispiele ein, ` +
        "damit ich den Stoff wirklich verstehe.",
      estimatedMinutes: 20,
      done: false,
    },
    {
      id: 3,
      title: "Erste Ubungsquest",
      prompt:
        `Gib mir eine kleine Ubung zu ${data.topic}, passend fur ${data.level}. ` +
        "Lass mich zuerst selbst nachdenken, gib danach Feedback auf meine Losung " +
        "und erklare meine Fehler verstandlich.",
      estimatedMinutes: 25,
      done: false,
    },
    {
      id: 4,
      title: "Mini-Test erzeugen",
      prompt:
        `Erstelle mir einen kurzen Test zu ${data.topic}, passend fur ${data.level}. ` +
        "Der Test soll 8 bis 10 Fragen mit gemischtem Schwierigkeitsgrad enthalten. " +
        "Gib die Losungen erst nach meinem Versuch mit kurzen Erklarungen aus.",
      estimatedMinutes: 20,
      done: false,
    },
  ];
}

export function sendJson(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

export function ensurePostMethod(request, response) {
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return false;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return false;
  }

  return true;
}

export function parseRequestBody(request) {
  if (!request.body) {
    return {};
  }

  if (typeof request.body === "string") {
    try {
      return JSON.parse(request.body);
    } catch {
      return {};
    }
  }

  return request.body;
}

export async function generateTasks(data) {
  try {
    const response = await getClient().responses.create({
      model: "gpt-4.1-mini",
      input: `
You are an expert study coach for students and pupils.

The user wants to learn:
${data.topic}

They are learning it for:
${data.studyReason}

Current level:
${data.level}

Preferred learning style:
${data.learningStyle}

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
      `,
      text: {
        format: {
          type: "json_schema",
          name: "study_plan",
          schema: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                minItems: 4,
                maxItems: 8,
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    prompt: { type: "string" },
                    estimatedMinutes: {
                      type: "integer",
                      minimum: 5,
                      maximum: 90,
                    },
                  },
                  required: ["title", "prompt", "estimatedMinutes"],
                  additionalProperties: false,
                },
              },
            },
            required: ["tasks"],
            additionalProperties: false,
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);
    const tasks = parsed.tasks.map((task, index) => ({
      id: index + 1,
      title: task.title,
      prompt: task.prompt,
      estimatedMinutes: task.estimatedMinutes,
      done: false,
    }));

    return {
      tasks,
      source: "openai",
    };
  } catch (error) {
    console.error("ERROR IN /generate", error);

    return {
      tasks: createFallbackTasks(data),
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function generateChatReply(data) {
  const cleanedMessages = Array.isArray(data.messages)
    ? data.messages
        .filter(
          (message) =>
            message &&
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string" &&
            message.content.trim()
        )
        .map((message) => ({
          role: message.role,
          content: message.content.trim(),
        }))
    : [];

  if (!cleanedMessages.length) {
    return {
      status: 400,
      payload: { error: "No messages provided" },
    };
  }

  try {
    const response = await getClient().responses.create({
      model: "gpt-4.1-mini",
      instructions: `
You are a focused German learning coach inside SideQuests AI.

Current study topic:
${data.topic || "Unbekannt"}

Current quest:
${data.taskTitle || "Quest"}

Rules:
- Answer in German
- Use only the messages from this single quest as context
- Be practical, clear, and concise
- Stay focused on helping the user complete this specific quest
- If the user answers an exercise, give feedback and explain mistakes clearly
- Do not answer as one long text block
- Use short paragraphs with visible line breaks
- Use bullet points or numbered steps when listing actions
- Use simple Markdown emphasis like **wichtige Begriffe** or short **Zwischenuberschriften** when useful
      `,
      input: cleanedMessages,
    });

    return {
      status: 200,
      payload: {
        reply: response.output_text,
        source: "openai",
      },
    };
  } catch (error) {
    console.error("ERROR IN /chat", error);

    return {
      status: 200,
      payload: {
        reply:
          "Ich konnte gerade keine neue Quest-Antwort erzeugen. Versuche es bitte in einem Moment noch einmal.",
        source: "fallback",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
