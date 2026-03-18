function IntroPage({ onStart }) {
    return (
      <main>
        <section>
          <h1>SideQuests</h1>
          <p>
            Turn big goals into small achievable quests.
          </p>
          <p>
            Tell us what you want to achieve, answer a few questions,
            and get a clear step-by-step path you can follow.
          </p>
          <button onClick={onStart}>Start your quest</button>
        </section>
      </main>
    );
  }
  
  export default IntroPage;