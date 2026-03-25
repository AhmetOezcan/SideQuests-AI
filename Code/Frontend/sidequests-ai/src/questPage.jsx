import "./QuestPage.css";

const STOP_COLORS = [
  "#2f5db2",
  "#3672d8",
  "#4b8dff",
  "#67a8ff",
  "#4f8cc8",
  "#3a6fc1",
  "#5ba1d9",
  "#7dc8ff",
];

function QuestPage({ userAnswers, tasks = [], onToggleTask }) {
  if (!userAnswers) {
    return null;
  }

  const questTasks = tasks.map((task, index) => ({
    ...task,
    id: task.id ?? index,
    title: task.title || `Quest ${index + 1}`,
    prompt: task.prompt || "",
    estimatedMinutes: Number(task.estimatedMinutes) || 15,
    done: Boolean(task.done),
  }));

  const completedTasks = questTasks.filter((task) => task.done).length;
  const totalTasks = questTasks.length;
  const progress = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return (
    <main className="quest-board">
      <section className="quest-board__progress">
        <p className="quest-board__eyebrow">Prompt-Quests</p>
        <p className="quest-board__hint">
          
        </p>

        <div className="quest-board__progress-main">
          <div className="quest-board__progress-number">
            <strong>{progress}%</strong>
            <span>
              {completedTasks} von {totalTasks} erledigt
            </span>
          </div>

          <div className="quest-board__progress-track">
            <div className="quest-board__bar" aria-hidden="true">
              <span
                className="quest-board__fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="quest-board__roadmap-panel">
        <div className="quest-board__roadmap-head">
          <p className="quest-board__eyebrow">Dein Weg</p>
        </div>

        {totalTasks > 0 ? (
          <div className="quest-board__roadmap-scroll">
            <ol
              className="quest-roadmap"
              style={{ "--quest-stop-count": totalTasks }}
            >
              {questTasks.map((task, index) => {
                const isTop = index % 2 === 0;
                const taskNumber = String(index + 1).padStart(2, "0");

                return (
                  <li
                    key={task.id}
                    className={`quest-stop ${isTop ? "is-top" : "is-bottom"} ${
                      task.done ? "is-done" : ""
                    }`}
                    style={{
                      "--stop-color": STOP_COLORS[index % STOP_COLORS.length],
                    }}
                  >
                    <div className="quest-stop__label">
                      <div className="quest-stop__content">
                        <span className="quest-stop__index">{taskNumber}</span>
                        <p className="quest-stop__time">
                          ca. {task.estimatedMinutes} Min
                        </p>
                        <h2>{task.title}</h2>
                        <p className="quest-stop__prompt">{task.prompt}</p>

                        <button
                          className="quest-stop__button"
                          type="button"
                          onClick={() => onToggleTask?.(task.id)}
                        >
                          {task.done ? "Offen" : "Fertig"}
                        </button>
                      </div>
                    </div>

                    <div className="quest-stop__stem" aria-hidden="true">
                      <span className="quest-stop__dot" />
                    </div>

                    <div className="quest-stop__marker" aria-hidden="true">
                      <span>{task.done ? "✓" : taskNumber}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <div className="quest-board__empty">
            <h2>Noch keine Prompt-Quests</h2>
            <p>Hier erscheint dein Weg.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default QuestPage;
