import { useState } from "react";
import "./App.css";
import IntroPage from "./IntroPage";
import QuestionsPage from "./QuestionPage";
import QuestPage from "./QuestPage";

function App() {
  const [currentPage, setCurrentPage] = useState("intro");
  const [userAnswers, setUserAnswers] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

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
      setTasks(newTasks);
      setCurrentPage("quests");
    } catch (error) {
      console.error("Error while generating study plan:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleToggleTask(taskId) {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );

    setTasks(updatedTasks);
  }

  return (
    <>
      {currentPage === "intro" && <IntroPage onStart={goToQuestions} />}

      {currentPage === "questions" && (
        <QuestionsPage onGenerate={handleGenerate} />
      )}

      {loading && (
        <main>
          <section>
            <h1>Generating your study plan...</h1>
            <p>Please wait a moment.</p>
          </section>
        </main>
      )}

      {currentPage === "quests" && !loading && (
        <QuestPage
          userAnswers={userAnswers}
          tasks={tasks}
          onToggleTask={handleToggleTask}
        />
      )}
    </>
  );
}

export default App;