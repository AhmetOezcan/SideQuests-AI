import "./QuestPage.css";

function getAnswerValue(userAnswers, keys, fallback = "Not specified") {
  for (const key of keys) {
    if (userAnswers?.[key]) {
      return userAnswers[key];
    }
  }

  return fallback;
}

function QuestPage({ userAnswers, tasks = [], onToggleTask }) {
  if (!userAnswers) {
    return null;
  }

  const goal = getAnswerValue(userAnswers, ["goal", "topic"]);
  const outcome = getAnswerValue(userAnswers, ["outcome", "goalLevel", "studyReason"]);
  const experience = getAnswerValue(userAnswers, ["experience", "level"]);
  const learningStyle = getAnswerValue(userAnswers, ["learningStyle"]);

  const roadmapTasks = tasks.map((task, index) => ({
    ...task,
    id: task.id ?? index,
    title: task.title || `Step ${index + 1}`,
    done: Boolean(task.done),
  }));

  const completedTasks = roadmapTasks.filter((task) => task.done).length;
  const progress = roadmapTasks.length
    ? Math.round((completedTasks / roadmapTasks.length) * 100)
    : 0;

  return (
    <main className="roadmap-root">
      <div className="roadmap-noise" />

      <header className="roadmap-top">
        <div>
          <p className="roadmap-kicker">SideQuests AI</p>
          <h1 className="roadmap-title">Your learning roadmap is ready.</h1>
        </div>

        <div className="roadmap-step-pill">
          <span className="roadmap-step-dot" />
          Step 3 of 3
        </div>
      </header>

      <section className="roadmap-hero">
        <div className="roadmap-summary-card">
          <p className="roadmap-eyebrow">Mission overview</p>
          <h2 className="roadmap-headline">
            From goal to
            <span> guided milestones.</span>
          </h2>

          <p className="roadmap-desc">
            This roadmap breaks your learning goal into connected steps so you
            always know what comes next and how far you have already come.
          </p>

          <div className="roadmap-meta">
            <article className="roadmap-meta-card">
              <span className="roadmap-meta-label">Goal</span>
              <strong>{goal}</strong>
            </article>
            <article className="roadmap-meta-card">
              <span className="roadmap-meta-label">Outcome</span>
              <strong>{outcome}</strong>
            </article>
            <article className="roadmap-meta-card">
              <span className="roadmap-meta-label">Level</span>
              <strong>{experience}</strong>
            </article>
            <article className="roadmap-meta-card">
              <span className="roadmap-meta-label">Style</span>
              <strong>{learningStyle}</strong>
            </article>
          </div>
        </div>

        <aside className="roadmap-progress-card">
          <p className="roadmap-progress-label">Quest progress</p>
          <div className="roadmap-progress-value">{progress}%</div>
          <p className="roadmap-progress-copy">
            {completedTasks} of {roadmapTasks.length} milestones completed
          </p>

          <div className="roadmap-progress-bar">
            <span
              className="roadmap-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </aside>
      </section>

      <section className="roadmap-board">
        <div className="roadmap-board-head">
          <div>
            <p className="roadmap-board-kicker">Roadmap</p>
            <h2>Your next milestones</h2>
          </div>
        </div>

        {roadmapTasks.length > 0 ? (
          <div className="roadmap-timeline">
            {roadmapTasks.map((task, index) => {
              const sideClass = index % 2 === 0 ? "left" : "right";

              return (
                <article
                  key={task.id}
                  className={`roadmap-item ${sideClass} ${task.done ? "done" : ""}`}
                >
                  <div className="roadmap-card">
                    <div className="roadmap-card-head">
                      <span className="roadmap-order">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="roadmap-status">
                        {task.done ? "Completed" : "In progress"}
                      </span>
                    </div>

                    <h3>{task.title}</h3>

                    <button
                      className="roadmap-action"
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                    >
                      {task.done ? "Mark as open" : "Mark as done"}
                    </button>
                  </div>

                  <div className="roadmap-node" aria-hidden="true" />
                </article>
              );
            })}
          </div>
        ) : (
          <div className="roadmap-empty">
            <h3>No roadmap tasks yet</h3>
            <p>
              As soon as tasks are generated, they will appear here as connected
              milestones.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default QuestPage;