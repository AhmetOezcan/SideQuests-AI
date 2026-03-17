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

  function goToQuestions() {
    setCurrentPage("questions");
  }

  function handleGenerate(data) {
    setUserAnswers(data);

    const demoTasks = [
      {
        id: 1,
        title: "Understand the basics of your topic with an AI or tutorial of your choice.",
        done: false,
      },
      {
        id: 2,
        title: "Summarize what you learned in your own words.",
        done: false,
      },
      {
        id: 3,
        title: "Do a small practical exercise related to your goal.",
        done: false,
      },
      {
        id: 4,
        title: "Review what was difficult and repeat the weak part once more.",
        done: false,
      },
    ];

    setTasks(demoTasks);
    setCurrentPage("quests");
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

      {currentPage === "quests" && (
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