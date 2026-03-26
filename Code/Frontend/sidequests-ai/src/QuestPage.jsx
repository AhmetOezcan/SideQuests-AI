import { Fragment, useEffect, useRef, useState } from "react";
import "./QuestPage.css";

const COMPLETION_SPARKLES = [
  { left: "8%", delay: "0ms", duration: "2600ms", size: "12px", rotate: "-14deg" },
  { left: "16%", delay: "180ms", duration: "3000ms", size: "16px", rotate: "10deg" },
  { left: "24%", delay: "90ms", duration: "2800ms", size: "10px", rotate: "-6deg" },
  { left: "33%", delay: "260ms", duration: "3100ms", size: "18px", rotate: "16deg" },
  { left: "42%", delay: "40ms", duration: "2400ms", size: "12px", rotate: "-12deg" },
  { left: "50%", delay: "220ms", duration: "2900ms", size: "20px", rotate: "8deg" },
  { left: "58%", delay: "140ms", duration: "2700ms", size: "14px", rotate: "-10deg" },
  { left: "66%", delay: "300ms", duration: "3200ms", size: "11px", rotate: "14deg" },
  { left: "74%", delay: "120ms", duration: "2500ms", size: "15px", rotate: "-8deg" },
  { left: "82%", delay: "340ms", duration: "3000ms", size: "19px", rotate: "12deg" },
  { left: "90%", delay: "70ms", duration: "2750ms", size: "12px", rotate: "-16deg" },
];

function normalizeQuestTask(task, index) {
  return {
    ...task,
    id: task.id ?? index + 1,
    title: task.title || `Task ${index + 1}`,
    prompt: task.prompt || "",
    estimatedMinutes: Number(task.estimatedMinutes) || 15,
    done: Boolean(task.done),
    started: Boolean(task.started),
    messages: Array.isArray(task.messages) ? task.messages : [],
    draft: typeof task.draft === "string" ? task.draft : "",
    chatLoading: Boolean(task.chatLoading),
    chatError: task.chatError || "",
  };
}

function getVisibleMessages(task) {
  if (!task) {
    return [];
  }

  const taskPrompt = task.prompt.trim();

  return task.messages.filter((message, index) => {
    if (index !== 0) {
      return true;
    }

    return !(
      message.role === "user" && message.content?.trim() === taskPrompt
    );
  });
}

function renderInlineFormatting(text, keyPrefix) {
  return text
    .split(/(\*\*.+?\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      const boldMatch = part.match(/^\*\*(.+)\*\*$/);

      if (boldMatch) {
        return <strong key={`${keyPrefix}-bold-${index}`}>{boldMatch[1]}</strong>;
      }

      return <Fragment key={`${keyPrefix}-text-${index}`}>{part}</Fragment>;
    });
}

function renderFormattedLine(line, keyPrefix) {
  const labelMatch = line.match(/^([^.:]{2,28}:)\s+(.*)$/);

  if (labelMatch && !line.includes("**")) {
    return (
      <>
        <strong>{labelMatch[1]}</strong>{" "}
        {renderInlineFormatting(labelMatch[2], `${keyPrefix}-rest`)}
      </>
    );
  }

  return renderInlineFormatting(line, keyPrefix);
}

function renderMessageContent(content) {
  const normalizedContent = content.replace(/\r\n/g, "\n").trim();

  if (!normalizedContent) {
    return null;
  }

  const blocks = normalizedContent
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return null;
    }

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return (
        <ul className="quest-message__list" key={`block-${blockIndex}`}>
          {lines.map((line, lineIndex) => (
            <li key={`item-${blockIndex}-${lineIndex}`}>
              {renderFormattedLine(
                line.replace(/^[-*]\s+/, ""),
                `block-${blockIndex}-item-${lineIndex}`
              )}
            </li>
          ))}
        </ul>
      );
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      return (
        <ol
          className="quest-message__list quest-message__list--ordered"
          key={`block-${blockIndex}`}
        >
          {lines.map((line, lineIndex) => (
            <li key={`item-${blockIndex}-${lineIndex}`}>
              {renderFormattedLine(
                line.replace(/^\d+\.\s+/, ""),
                `block-${blockIndex}-item-${lineIndex}`
              )}
            </li>
          ))}
        </ol>
      );
    }

    if (lines.length === 1 && /^#{1,3}\s+/.test(lines[0])) {
      return (
        <p className="quest-message__heading" key={`block-${blockIndex}`}>
          {renderFormattedLine(
            lines[0].replace(/^#{1,3}\s+/, ""),
            `block-${blockIndex}-heading`
          )}
        </p>
      );
    }

    return (
      <p className="quest-message__paragraph" key={`block-${blockIndex}`}>
        {lines.map((line, lineIndex) => (
          <Fragment key={`line-${blockIndex}-${lineIndex}`}>
            {lineIndex > 0 ? <br /> : null}
            {renderFormattedLine(line, `block-${blockIndex}-line-${lineIndex}`)}
          </Fragment>
        ))}
      </p>
    );
  });
}

function QuestPage({
  userAnswers,
  tasks = [],
  onToggleTask,
  onStartTask,
  onUpdateTaskDraft,
  onSubmitTaskMessage,
}) {
  const [chatTaskId, setChatTaskId] = useState(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const chatEndRef = useRef(null);
  const previousAllTasksDoneRef = useRef(false);

  const questTasks = tasks.map(normalizeQuestTask);
  const chatTask =
    questTasks.find((task) => task.id === chatTaskId) ?? null;
  const visibleMessages = getVisibleMessages(chatTask);
  const topic = userAnswers?.topic?.trim() || "Deine Roadmap";
  const allTasksDone =
    questTasks.length > 0 && questTasks.every((task) => task.done);

  useEffect(() => {
    if (!chatTaskId) {
      return;
    }

    const taskStillExists = questTasks.some((task) => task.id === chatTaskId);

    if (!taskStillExists) {
      setChatTaskId(null);
    }
  }, [chatTaskId, questTasks]);

  useEffect(() => {
    if (!chatTask) {
      return;
    }

    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatTask, visibleMessages.length]);

  useEffect(() => {
    if (!chatTaskId) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [chatTaskId]);

  useEffect(() => {
    const wasAllTasksDone = previousAllTasksDoneRef.current;

    if (allTasksDone && !wasAllTasksDone) {
      setShowCompletionAnimation(true);

      const timeoutId = window.setTimeout(() => {
        setShowCompletionAnimation(false);
      }, 3600);

      previousAllTasksDoneRef.current = true;

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (!allTasksDone) {
      previousAllTasksDoneRef.current = false;
      setShowCompletionAnimation(false);
    }

    return undefined;
  }, [allTasksDone]);

  if (!userAnswers) {
    return null;
  }

  function openTaskChat(task) {
    setChatTaskId(task.id);

    if (!task.started && task.messages.length === 0) {
      onStartTask?.(task.id);
    }
  }

  function handleSubmitChat(event) {
    event.preventDefault();

    if (!chatTask || !chatTask.draft.trim() || chatTask.chatLoading) {
      return;
    }

    onSubmitTaskMessage?.(chatTask.id);
  }

  return (
    <main className="quest-page">
      <div className="quest-page__texture" aria-hidden="true" />

      {showCompletionAnimation ? (
        <div className="quest-completion" aria-hidden="true">
          <div className="quest-completion__sparkles">
            {COMPLETION_SPARKLES.map((sparkle, index) => (
              <span
                key={`sparkle-${index}`}
                className="quest-completion__sparkle"
                style={{
                  "--sparkle-left": sparkle.left,
                  "--sparkle-delay": sparkle.delay,
                  "--sparkle-duration": sparkle.duration,
                  "--sparkle-size": sparkle.size,
                  "--sparkle-rotate": sparkle.rotate,
                }}
              />
            ))}
          </div>

          <div className="quest-completion__badge">
            <p>Roadmap abgeschlossen</p>
            <strong>Alle Tasks erledigt</strong>
          </div>
        </div>
      ) : null}

      <section className="quest-roadmap-view">
        <p className="quest-roadmap-view__eyebrow">Deine Roadmap</p>
        <h1>{topic}</h1>

        {questTasks.length > 0 ? (
          <ol className="quest-task-list">
            {questTasks.map((task, index) => (
              <li
                key={task.id}
                className={`quest-task-card ${task.done ? "is-done" : ""}`}
              >
                <span className="quest-task-card__line" aria-hidden="true" />

                <div className="quest-task-card__number" aria-hidden="true">
                  <span className="quest-task-card__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="quest-task-card__content">
                  <div className="quest-task-card__topline">
                    <span className="quest-task-card__label">
                      Task {String(index + 1).padStart(2, "0")}
                    </span>

                    {task.done ? (
                      <span className="quest-task-card__status">Erledigt</span>
                    ) : null}
                  </div>

                  <h2>{task.title}</h2>

                  <button
                    className="quest-button quest-button--primary"
                    type="button"
                    onClick={() => openTaskChat(task)}
                  >
                    {task.started || task.messages.length > 0
                      ? "Zum Chat"
                      : "Task starten"}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="quest-empty">
            <h2>Noch keine Tasks</h2>
            <p>Nach der Generierung erscheint hier deine Roadmap.</p>
          </div>
        )}
      </section>

      {chatTask ? (
        <div
          className="quest-chat-overlay"
          role="presentation"
          onClick={() => setChatTaskId(null)}
        >
          <section
            className="quest-chat-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quest-chat-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="quest-chat-panel__header">
              <button
                className="quest-button quest-button--ghost"
                type="button"
                onClick={() => setChatTaskId(null)}
              >
                Zurück zur Roadmap
              </button>

              <div className="quest-chat-panel__title">
                <p>Task Chat</p>
                <h2 id="quest-chat-title">{chatTask.title}</h2>
              </div>

              <button
                className="quest-button quest-button--secondary"
                type="button"
                onClick={() => onToggleTask?.(chatTask.id)}
              >
                {chatTask.done ? "Wieder öffnen" : "Als erledigt markieren"}
              </button>
            </header>

            <div className="quest-chat-thread">
              {visibleMessages.length === 0 && !chatTask.chatLoading ? (
                <div className="quest-chat-empty">
                  <p>Dieser Task hat einen eigenen Chat.</p>
                  <p>Schreib deine Fragen direkt hier weiter.</p>
                </div>
              ) : null}

              {visibleMessages.map((message) => (
                <article
                  key={message.id}
                  className={`quest-message quest-message--${message.role}`}
                >
                  <div className="quest-message__body">
                    {renderMessageContent(message.content)}
                  </div>
                </article>
              ))}

              {chatTask.chatLoading ? (
                <div className="quest-message quest-message--assistant is-loading">
                  <span />
                  <span />
                  <span />
                </div>
              ) : null}

              {chatTask.chatError ? (
                <p className="quest-chat-error">{chatTask.chatError}</p>
              ) : null}

              <div ref={chatEndRef} />
            </div>

            <form className="quest-chat-composer" onSubmit={handleSubmitChat}>
              <textarea
                value={chatTask.draft}
                onChange={(event) =>
                  onUpdateTaskDraft?.(chatTask.id, event.target.value)
                }
                placeholder="Schreib deine Nachricht..."
                rows={4}
              />

              <div className="quest-chat-composer__actions">
                <button
                  className="quest-button quest-button--ghost"
                  type="button"
                  onClick={() => setChatTaskId(null)}
                >
                  Zurück
                </button>

                <button
                  className="quest-button quest-button--primary"
                  type="submit"
                  disabled={!chatTask.draft.trim() || chatTask.chatLoading}
                >
                  Senden
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default QuestPage;
