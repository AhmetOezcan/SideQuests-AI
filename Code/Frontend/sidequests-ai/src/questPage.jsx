import { useState } from "react";
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

function QuestPage({
  userAnswers,
  tasks = [],
  onToggleTask,
  onStartTask,
  onUpdateTaskDraft,
  onSubmitTaskMessage,
}) {
  const questTasks = tasks.map((task, index) => ({
    ...task,
    id: task.id ?? index + 1,
    title: task.title || `Quest ${index + 1}`,
    prompt: task.prompt || "",
    estimatedMinutes: Number(task.estimatedMinutes) || 15,
    done: Boolean(task.done),
    started: Boolean(task.started),
    messages: Array.isArray(task.messages) ? task.messages : [],
    draft: typeof task.draft === "string" ? task.draft : "",
    chatLoading: Boolean(task.chatLoading),
    chatError: task.chatError || "",
  }));
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const completedTasks = questTasks.filter((task) => task.done).length;
  const totalTasks = questTasks.length;
  const progress = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;
  const activeTaskId =
    questTasks.find((task) => task.id === selectedTaskId)?.id ??
    questTasks[0]?.id ??
    null;
  const activeTaskIndex = questTasks.findIndex(
    (task) => task.id === activeTaskId
  );
  const activeTask = activeTaskIndex >= 0 ? questTasks[activeTaskIndex] : null;
  const startButtonLabel =
    activeTaskIndex === 0 ? "Start 1. Quest" : "Start Quest";

  function handleChatSubmit(event) {
    event.preventDefault();

    if (!activeTask) {
      return;
    }

    onSubmitTaskMessage?.(activeTask.id);
  }

  if (!userAnswers) {
    return null;
  }

  return (
    <main className="quest-board">
      <section className="quest-board__progress">
        <p className="quest-board__eyebrow">Prompt-Quests</p>
        <p className="quest-board__hint">
          Ein Prompt pro Quest. Kurz, klar, machbar.
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
                    aria-current={task.id === activeTaskId ? "step" : undefined}
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
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          {task.id === activeTaskId ? "Aktive Quest" : "Quest öffnen"}
                        </button>

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

      <section className="quest-board__chat-panel">
        <div className="quest-board__roadmap-head">
          <p className="quest-board__eyebrow">Quest Chat</p>
        </div>

        {activeTask ? (
          <>
            <div className="quest-board__chat-meta">
              <h2>{activeTask.title}</h2>
              <p>{activeTask.prompt}</p>
            </div>

            {!activeTask.started ? (
              <div className="quest-board__chat-empty">
                <p>
                  Diese Quest hat ihren eigenen Chat. Beim Start wird der
                  hinterlegte Prompt automatisch als erste Nachricht gesendet.
                </p>

                <button
                  type="button"
                  onClick={() => onStartTask?.(activeTask.id)}
                  disabled={!activeTask.prompt || activeTask.chatLoading}
                >
                  {activeTask.chatLoading ? "Quest startet..." : startButtonLabel}
                </button>
              </div>
            ) : (
              <>
                <div className="quest-board__messages">
                  {activeTask.messages.map((message) => (
                    <article key={message.id} className="quest-board__message">
                      <strong>
                        {message.role === "assistant" ? "AI" : "Du"}
                      </strong>
                      <p>{message.content}</p>
                    </article>
                  ))}
                </div>

                {activeTask.chatError ? (
                  <p role="alert">{activeTask.chatError}</p>
                ) : null}

                <form onSubmit={handleChatSubmit}>
                  <textarea
                    rows="4"
                    value={activeTask.draft}
                    onChange={(event) =>
                      onUpdateTaskDraft?.(activeTask.id, event.target.value)
                    }
                    placeholder="Schreibe hier deine nächste Nachricht nur für diese Quest..."
                    disabled={activeTask.chatLoading}
                  />

                  <button
                    type="submit"
                    disabled={
                      activeTask.chatLoading || !activeTask.draft.trim()
                    }
                  >
                    {activeTask.chatLoading ? "AI antwortet..." : "Senden"}
                  </button>
                </form>
              </>
            )}
          </>
        ) : (
          <div className="quest-board__empty">
            <h2>Keine aktive Quest</h2>
            <p>Wähle links eine Quest aus, um ihren Chat zu sehen.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default QuestPage;
