import { useState } from "react";
import "./QuestionPage.css";

export default function QuestionsPage({ onGenerate }) {
  const [topic, setTopic] = useState("");
  const [studyReason, setStudyReason] = useState("");
  const [level, setLevel] = useState("");
  const [learningStyle, setLearningStyle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate({ topic, studyReason, level, learningStyle });
  }

  return (
    <main className="quest-root">
      <div className="quest-noise" />

      <header className="quest-top">
        <div>
          <p className="quest-kicker">SideQuests AI</p>
          <h1 className="quest-logo">Build the quest before you start the grind.</h1>
        </div>

        <div className="quest-step-pill">
          <span className="quest-step-dot" />
          Step 2 of 3
        </div>
      </header>

      <section className="quest-main">
        <aside className="quest-sidebar">
          <p className="quest-eyebrow">Quest setup</p>

          <h2 className="quest-headline">
            Shape your
            <span> study route.</span>
          </h2>

          <p className="quest-desc">
            Answer four short prompts so the system can generate a learning
            path that fits your goal, your current level, and the way you
            actually like to study.
          </p>

          <div className="quest-progress-card">
            <div className="quest-progress-head">
              <span className="quest-progress-label">Current phase</span>
              <span className="quest-progress-index">02 / 03</span>
            </div>

            <div className="quest-progress-bar">
              <span className="quest-progress-fill" />
            </div>

            <div className="quest-progress-steps">
              <div className="quest-progress-step">
                <strong>Topic</strong>
                <span>What you want to learn</span>
              </div>
              <div className="quest-progress-step active">
                <strong>Profile</strong>
                <span>Goal, level, and style</span>
              </div>
              <div className="quest-progress-step">
                <strong>Plan</strong>
                <span>Your roadmap gets generated</span>
              </div>
            </div>
          </div>

          <div className="quest-side-notes">
            <article className="quest-note-card">
              <span className="quest-note-value">4</span>
              <p>inputs are enough to personalize the roadmap.</p>
            </article>
            <article className="quest-note-card">
              <span className="quest-note-value">Fast</span>
              <p>No long onboarding, just the essentials.</p>
            </article>
          </div>
        </aside>

        <form className="quest-form-card" onSubmit={handleSubmit}>
          <div className="quest-form-top">
            <p className="quest-form-kicker">Personalization form</p>
            <h3>Tell us enough to generate a useful plan.</h3>
            <p>
              Keep it simple. The better the input, the more focused the
              generated quest will be.
            </p>
          </div>

          <div className="quest-form-grid">
            <div className="quest-field quest-field-wide">
              <label className="quest-label" htmlFor="topic">
                What do you want to learn?
              </label>
              <input
                id="topic"
                className="quest-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Python basics, algebra, databases"
                required
              />
            </div>

            <div className="quest-field">
              <label className="quest-label" htmlFor="studyReason">
                Why are you learning it?
              </label>
              <select
                id="studyReason"
                className="quest-select"
                value={studyReason}
                onChange={(e) => setStudyReason(e.target.value)}
                required
              >
                <option value="">Choose a reason</option>
                <option value="exam">Exam</option>
                <option value="homework">Homework</option>
                <option value="project">Project</option>
                <option value="presentation">Presentation</option>
                <option value="understanding">General understanding</option>
              </select>
            </div>

            <div className="quest-field">
              <label className="quest-label" htmlFor="level">
                What is your current level?
              </label>
              <select
                id="level"
                className="quest-select"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
              >
                <option value="">Choose your level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="quest-field quest-field-wide">
              <label className="quest-label" htmlFor="learningStyle">
                How do you learn best?
              </label>
              <select
                id="learningStyle"
                className="quest-select"
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                required
              >
                <option value="">Choose your style</option>
                <option value="practical">Learning by doing</option>
                <option value="theory">Theory first</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="quest-form-footer">
            <p className="quest-form-hint">
              Next step: we turn this into a structured study plan.
            </p>

            <button className="quest-submit" type="submit">
              Generate my study plan
              <span className="quest-submit-arrow">→</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
