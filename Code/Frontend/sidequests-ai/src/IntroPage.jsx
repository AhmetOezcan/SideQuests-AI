import "./IntroPage.css";
import professorImg from "./assets/professor_transparent2.png";

export default function IntroPage({ onStart }) {
  return (
    <main className="intro-root">
      <div className="intro-noise" />

      <header className="intro-top">
        <div>
          <p className="intro-kicker">SideQuests AI</p>
          <h1 className="intro-logo">
            Learn like a strategist,
            <br />
            not like a grinder.
          </h1>
        </div>

        <div className="intro-step-pill">
          <span className="intro-step-dot" />
          Step 1 of 3
        </div>
      </header>

      <section className="intro-hero">
        <div className="intro-copy">
          <p className="intro-eyebrow">Your personal study guide</p>

          <h2 className="intro-headline">
            Turn vague goals into
            <span> focused learning quests.</span>
          </h2>

          <p className="intro-sub">
            Tell us what you want to learn and the professor will build a
            clear, motivating path with the right pace, difficulty, and next
            steps.
          </p>

          <div className="intro-cta-row">
            <button className="intro-cta" onClick={onStart}>
              Start your first quest
            </button>
            <p className="intro-hint">No sign-up. Just pick a topic and begin.</p>
          </div>

          <div className="intro-highlights">
            <article className="intro-highlight-card">
              <span className="intro-highlight-value">4</span>
              <p className="intro-highlight-label">quick questions to set your path</p>
            </article>
            <article className="intro-highlight-card">
              <span className="intro-highlight-value">AI</span>
              <p className="intro-highlight-label">adapts the plan to your level</p>
            </article>
            <article className="intro-highlight-card">
              <span className="intro-highlight-value">03</span>
              <p className="intro-highlight-label">simple steps from topic to roadmap</p>
            </article>
          </div>
        </div>

        <div className="intro-visual">
          <div className="intro-orbit intro-orbit-one" />
          <div className="intro-orbit intro-orbit-two" />

          <div className="intro-professor-card">
            <div className="intro-professor-copy">
              <p className="intro-professor-label">Meet your guide</p>
              <h3>The Professor</h3>
              <p>
                He turns messy goals into structured quests with momentum,
                checkpoints, and clarity.
              </p>
            </div>

            <div className="intro-professor-stage">
              <div className="intro-professor-glow" />
              <img src={professorImg} alt="Professor character" />
            </div>

            <div className="intro-professor-note intro-professor-note-top">
              <strong>Quest setup</strong>
              <span>topic, level, motivation</span>
            </div>

            <div className="intro-professor-note intro-professor-note-bottom">
              <strong>Outcome</strong>
              <span>clear study path in minutes</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
