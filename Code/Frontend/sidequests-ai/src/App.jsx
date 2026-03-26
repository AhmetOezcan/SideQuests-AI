import { useEffect, useRef, useState } from "react";
import "./App.css";
import IntroPage from "./IntroPage";
import QuestionsPage from "./QuestionPage";
import QuestPage from "./QuestPage";

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

    console.log("handleGenerate called with:", data);

    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("Response status:", response.status);

      const result = await response.json();
      console.log("Response body:", result);

      const newTasks = Array.isArray(result?.tasks) ? result.tasks : [];
      setTasks(newTasks.map(normalizeTask));
      setCurrentPage("quests");
    } catch (error) {
      console.error("Error while generating study plan:", error);
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
      const response = await fetch("http://localhost:8000/chat", {
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Chat request failed");
      }

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
        <QuestionsPage onGenerate={handleGenerate} isGenerating={loading} />
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
