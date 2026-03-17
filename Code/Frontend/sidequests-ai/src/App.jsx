import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import IntroPage from './ introPage'
import QuestionsPage from './questionPage'

function App() {
  const [currentPage, setCurrentPage] = useState("intro");
  const [userAnswers, setUserAnswers] = useState(null);

  function goToQuestions() {
    setCurrentPage("questions");
  }

  function handleGenerate(data) {
    setUserAnswers(data);
    setCurrentPage("quests");
  }

  return (
    <>
      {currentPage === "intro" && <IntroPage onStart={goToQuestions} />}

      {currentPage === "questions" && (
        <QuestionsPage onGenerate={handleGenerate} />
      )}

      {currentPage === "quests" && (
        <main>
          <section>
            <h1>Your Quest Page</h1>
            <p>This is the next page.</p>

            <h2>Your Answers:</h2>
            <p><strong>Goal:</strong> {userAnswers.goal}</p>
            <p><strong>Outcome:</strong> {userAnswers.outcome}</p>
            <p><strong>Experience:</strong> {userAnswers.experience}</p>
            <p><strong>Learning Style:</strong> {userAnswers.learningStyle}</p>
          </section>
        </main>
      )}
    </>
  );
}

export default App;