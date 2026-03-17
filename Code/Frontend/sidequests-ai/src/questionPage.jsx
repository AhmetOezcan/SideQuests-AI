import { useState } from "react";

function QuestionsPage({ onGenerate }) {
  const [goal, setGoal] = useState("");
  const [outcome, setOutcome] = useState("");
  const [experience, setExperience] = useState("");
  const [learningStyle, setLearningStyle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    onGenerate({
      goal,
      outcome,
      experience,
      learningStyle
    });
  }

  return (
    <main>
      <section>
        <h1>Tell us about your goal</h1>

        <form onSubmit={handleSubmit}>

          <label>What is your goal?</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />

          <label>What do you want to achieve?</label>
          <input
            type="text"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="e.g. a finished app"
            required
          />

          <label>How much experience do you have?</label>
          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            required
          >
            <option value="">Choose</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <label>How do you prefer to learn?</label>
          <select
            value={learningStyle}
            onChange={(e) => setLearningStyle(e.target.value)}
            required
          >
            <option value="">Choose</option>
            <option value="practical">Mostly practical</option>
            <option value="theory">Mostly theory</option>
            <option value="balanced">Balanced</option>
          </select>

          <button type="submit">Generate my quests</button>
        </form>
      </section>
    </main>
  );
}

export default QuestionsPage;