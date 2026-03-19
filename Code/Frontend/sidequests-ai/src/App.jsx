import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import IntroPage from './IntroPage'
import QuestionsPage from './QuestionPage'
import QuestPage from './QuestPage'

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
    
    console.log("🚀 handleGenerate called with:", data);

    try {
      console.log("📡 Sending request to http://localhost:8000/generate");
      
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response OK?:", response.ok);

      const result = await response.json();
      console.log("📥 Response body:", result);

      const tasks = Array.isArray(result?.tasks) ? result.tasks : [];
      console.log("✅ Tasks extracted:", tasks);
      
      if (!Array.isArray(result?.tasks)) {
        console.warn("⚠️ Unexpected /generate response (not an array):", result);
      }

      setTasks(tasks);
      setCurrentPage("quests");
      console.log("✅ Page changed to 'quests'");
      
    } catch (error) {
      console.error("❌ Error while generating tasks:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
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
            <h1>Generating your quests...</h1>
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