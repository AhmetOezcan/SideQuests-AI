import { useState } from "react";
import "./QuestionPage.css";

const QUESTION_FLOW = [
  {
    id: "topic",
    title: "Was willst du lernen?",
    hint: "Schreib einfach dein Thema hinein.",
    type: "text",
    placeholder: "z. B. Python Basics, Algebra, Datenbanken",
    buttonLabel: "Antworten",
  },
  {
    id: "studyReason",
    title: "Wofür brauchst du das?",
    hint: "Damit der Plan den richtigen Fokus bekommt.",
    type: "choice",
    buttonLabel: "Weiter",
    options: [
      { value: "exam", label: "Für eine Prüfung" },
      { value: "homework", label: "Für Hausaufgaben" },
      { value: "project", label: "Für ein Projekt" },
      { value: "presentation", label: "Für eine Präsentation" },
      { value: "understanding", label: "Einfach besser verstehen" },
    ],
  },
  {
    id: "level",
    title: "Wie sicher bist du gerade?",
    hint: "Ich passe Schwierigkeit und Tempo daran an.",
    type: "choice",
    buttonLabel: "Weiter",
    options: [
      { value: "beginner", label: "Ich starte bei null" },
      { value: "intermediate", label: "Ich kenne die Grundlagen" },
      { value: "advanced", label: "Ich bin schon weit drin" },
    ],
  },
  {
    id: "learningStyle",
    title: "Wie lernst du am liebsten?",
    hint: "Dann sehen deine SideQuests auch wirklich passend aus.",
    type: "choice",
    buttonLabel: "Plan erstellen",
    options: [
      { value: "practical", label: "Durch Üben und Anwenden" },
      { value: "theory", label: "Erst erklärt bekommen" },
      { value: "mixed", label: "Eine Mischung aus beidem" },
    ],
  },
];

export default function QuestionsPage({ onGenerate }) {
  const [answers, setAnswers] = useState({
    topic: "",
    studyReason: "",
    level: "",
    learningStyle: "",
  });
  const [currentStep, setCurrentStep] = useState(0);

  const activeQuestion = QUESTION_FLOW[currentStep];
  const activeValue = answers[activeQuestion.id];
  const progressWidth = `${((currentStep + 1) / QUESTION_FLOW.length) * 100}%`;

  function updateAnswer(id, value) {
    setAnswers((current) => ({
      ...current,
      [id]: value,
    }));
  }

  function handleNext() {
    if (!activeValue) {
      return;
    }

    if (currentStep === QUESTION_FLOW.length - 1) {
      onGenerate(answers);
      return;
    }

    setCurrentStep((step) => step + 1);
  }

  function handleBack() {
    setCurrentStep((step) => Math.max(0, step - 1));
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleNext();
  }

  return (
    <main className="question-screen">
      <div className="question-screen__texture" />

      <form className="question-card" onSubmit={handleSubmit}>
        <div className="question-card__top">
          <span className="question-card__brand">SideQuests AI</span>
          <span className="question-card__step">
            {String(currentStep + 1).padStart(2, "0")} / {QUESTION_FLOW.length}
          </span>
        </div>

        <div className="question-card__progress" aria-hidden="true">
          <span style={{ width: progressWidth }} />
        </div>

        <div className="question-card__content">
          <h1>{activeQuestion.title}</h1>
          <p>{activeQuestion.hint}</p>

          {activeQuestion.type === "text" ? (
            <input
              id={activeQuestion.id}
              className="question-input"
              type="text"
              value={activeValue}
              onChange={(event) =>
                updateAnswer(activeQuestion.id, event.target.value)
              }
              placeholder={activeQuestion.placeholder}
              autoFocus
              required
            />
          ) : (
            <div className="question-options" role="radiogroup">
              {activeQuestion.options.map((option) => {
                const isActive = activeValue === option.value;

                return (
                  <button
                    key={option.value}
                    className={`question-option ${isActive ? "is-active" : ""}`}
                    type="button"
                    onClick={() => updateAnswer(activeQuestion.id, option.value)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="question-card__actions">
          <button
            className="question-button question-button--ghost"
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Zurück
          </button>

          <button
            className="question-button question-button--primary"
            type="submit"
            disabled={!activeValue}
          >
            {activeQuestion.buttonLabel}
          </button>
        </div>
      </form>
    </main>
  );
}
