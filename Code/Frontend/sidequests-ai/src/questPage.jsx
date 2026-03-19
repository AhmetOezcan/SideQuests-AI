function QuestPage({ userAnswers, tasks = [], onToggleTask }) {
    if (!userAnswers) {
      return null;
    }

    const completedTasks = tasks.filter((task) => task.done).length;
    const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
    return (
      <main>
        <section>
          <h1>Your Goal Map</h1>
  
          <p>
            <strong>Goal:</strong> {userAnswers.goal}
          </p>
          <p>
            <strong>Outcome:</strong> {userAnswers.outcome}
          </p>
          <p>
            <strong>Experience:</strong> {userAnswers.experience}
          </p>
          <p>
            <strong>Learning Style:</strong> {userAnswers.learningStyle}
          </p>
  
          <h2>Progress: {progress}%</h2>
          <p>
            {completedTasks} of {tasks.length} tasks completed
          </p>
  
          <article>
            <h2>Your Steps</h2>
  
            {tasks.map((task) => (
              <section key={task.id}>
                <p>{task.title}</p>
                <button onClick={() => onToggleTask(task.id)}>
                  {task.done ? "Completed" : "Mark as done"}
                </button>
              </section>
            ))}
          </article>
        </section>
      </main>
    );
  }
  
  export default QuestPage;