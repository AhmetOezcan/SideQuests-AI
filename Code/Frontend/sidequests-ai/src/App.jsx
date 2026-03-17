import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import IntroPage from './ introPage'
import QuestionsPage from './questionPage'
import QuestPage from './questPage'

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

    try {
      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      setTasks(result.tasks);
      setCurrentPage("quests");
    } catch (error) {
      console.error("Error while generating tasks:", error);
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