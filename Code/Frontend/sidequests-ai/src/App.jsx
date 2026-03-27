import { useEffect, useRef, useState } from "react";
import "./App.css";
import IntroPage from "./IntroPage";
import QuestionsPage from "./QuestionPage";
import QuestPage from "./QuestPage";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:8000" : "")
)
  .trim()
  .replace(/\/$/, "");

function getApiUrl(path) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function parseApiResponse(response, endpoint) {
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();

  let payload = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      if (!response.ok || !contentType.includes("application/json")) {
        throw new Error(
          `Der API-Endpunkt ${endpoint} hat ${response.status} geliefert, aber keine JSON-Antwort. Auf Vercel bedeutet das meist: Endpoint fehlt oder VITE_API_BASE_URL zeigt auf die falsche Backend-URL.`
        );
      }

      throw new Error(
        `Der API-Endpunkt ${endpoint} hat ungultiges JSON zuruckgegeben.`
      );
    }
  }

  if (!response.ok) {
    if (typeof payload?.error === "string" && payload.error.trim()) {
      throw new Error(payload.error.trim());
    }

    throw new Error(`Der API-Endpunkt ${endpoint} hat ${response.status} geliefert.`);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error(
      `Der API-Endpunkt ${endpoint} hat keine verwendbare JSON-Antwort geliefert.`
    );
  }

  return payload;
}

function createMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    role,
    content,
  };
}

function normalizeTask(task, index) {
  return {
    ...task,
    id: task.id ?? index + 1,
    title: task.title || `Quest ${index + 1}`,
    prompt: task.prompt || "",
    estimatedMinutes: Number(task.estimatedMinutes) || 15,
    done: Boolean(task.done),
    started: Boolean(task.started),
    messages: Array.isArray(task.messages) ? task.messages : [],
    draft: typeof task.draft === "string" ? task.draft : "",
    chatLoading: Boolean(task.chatLoading),
    chatError: task.chatError || "",
  };
}

function App() {
  const [currentPage, setCurrentPage] = useState("intro");
  const [userAnswers, setUserAnswers] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const tasksRef = useRef(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  function goToQuestions() {
    setCurrentPage("questions");
  }

  async function handleGenerate(data) {
    setUserAnswers(data);
    setLoading(true);
    setGenerationError("");

    console.log("handleGenerate called with:", data);
    console.log("Generate request URL:", getApiUrl("/generate"));

    try {
      const response = await fetch(getApiUrl("/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);

      const result = await parseApiResponse(response, getApiUrl("/generate"));
      console.log("Response body:", result);

      const newTasks = Array.isArray(result?.tasks) ? result.tasks : [];
      setTasks(newTasks.map(normalizeTask));
      setCurrentPage("quests");
    } catch (error) {
      console.error("Error while generating study plan:", error);
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Der Lernplan konnte gerade nicht erstellt werden."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleToggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    );
  }

  function handleUpdateTaskDraft(taskId, draft) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, draft } : task
      )
    );
  }

  async function sendQuestMessage(taskId, content, options = {}) {
    const text = content.trim();
    const { clearDraft = true } = options;

    if (!text) {
      return;
    }

    const task = tasksRef.current.find((entry) => entry.id === taskId);

    if (!task || task.chatLoading) {
      return;
    }

    const userMessage = createMessage("user", text);
    const nextMessages = [...task.messages, userMessage];

    setTasks((currentTasks) =>
      currentTasks.map((entry) =>
        entry.id === taskId
          ? {
              ...entry,
              started: true,
              chatLoading: true,
              chatError: "",
              draft: clearDraft ? "" : entry.draft,
              messages: nextMessages,
            }
          : entry
      )
    );

    try {
      console.log("Chat request URL:", getApiUrl("/chat"));

      const response = await fetch(getApiUrl("/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: userAnswers?.topic || "",
          taskTitle: task.title,
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });

      const result = await parseApiResponse(response, getApiUrl("/chat"));

      const assistantReply =
        typeof result?.reply === "string" && result.reply.trim()
          ? result.reply.trim()
          : "Ich konnte gerade keine passende Antwort erzeugen.";

      setTasks((currentTasks) =>
        currentTasks.map((entry) =>
          entry.id === taskId
            ? {
                ...entry,
                chatLoading: false,
                chatError: "",
                messages: [
                  ...entry.messages,
                  createMessage("assistant", assistantReply),
                ],
              }
            : entry
        )
      );
    } catch (error) {
      console.error("Error while sending quest message:", error);

      setTasks((currentTasks) =>
        currentTasks.map((entry) =>
          entry.id === taskId
            ? {
                ...entry,
                chatLoading: false,
                chatError:
                  "Die Quest-Antwort konnte gerade nicht geladen werden.",
              }
            : entry
        )
      );
    }
  }

  function handleStartTask(taskId) {
    const task = tasksRef.current.find((entry) => entry.id === taskId);

    if (!task || task.messages.length > 0) {
      return;
    }

    sendQuestMessage(taskId, task.prompt, { clearDraft: false });
  }

  function handleSubmitTaskMessage(taskId) {
    const task = tasksRef.current.find((entry) => entry.id === taskId);

    if (!task) {
      return;
    }

    sendQuestMessage(taskId, task.draft);
  }

  return (
    <>
      {currentPage === "intro" && <IntroPage onStart={goToQuestions} />}

      {(currentPage === "questions" || (currentPage === "quests" && loading)) && (
        <QuestionsPage
          onGenerate={handleGenerate}
          isGenerating={loading}
          errorMessage={generationError}
        />
      )}

      {currentPage === "quests" && !loading && (
        <QuestPage
          userAnswers={userAnswers}
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onStartTask={handleStartTask}
          onUpdateTaskDraft={handleUpdateTaskDraft}
          onSubmitTaskMessage={handleSubmitTaskMessage}
        />
      )}
    </>
  );
}

export default App;
