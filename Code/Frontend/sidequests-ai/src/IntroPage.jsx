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
            Don't work hard,
            <br />
            work smart.
          </h1>
        </div>

        <div className="intro-step-pill">
          <span className="intro-step-dot" />
          Step 1 of 3
        </div>
      </header>

      <section className="intro-hero">
        <div className="intro-copy">
          <p className="intro-eyebrow">Dein persönlicher Lernbegleiter</p>

          <h2 className="intro-headline">
            Mach aus vagen Zielen
            <span> klare Lern-Quests.</span>
          </h2>

          <p className="intro-sub">
            Sag uns, was du lernen willst, und SideQuests AI baut dir daraus
            einen motivierenden Weg mit sinnvollen Schritten, passendem Tempo
            und einem klaren nächsten Ziel statt planlosem Durcharbeiten.
          </p>

          <div className="intro-cta-row">
            <button className="intro-cta" onClick={onStart}>
              Los geht's!
            </button>
            <p className="intro-hint">
              Kein langes Setup. Thema wählen, Fragen beantworten, loslegen.
            </p>
          </div>

          <div className="intro-highlights">
            <article className="intro-highlight-card">
              <span className="intro-highlight-value">4</span>
              <p className="intro-highlight-label">
                kurze Fragen bis zu deinem Lernpfad
              </p>
            </article>
            <article className="intro-highlight-card">
              <span className="intro-highlight-value">AI</span>
              <p className="intro-highlight-label">
                passt den Plan an dein Niveau an
              </p>
            </article>
            <article className="intro-highlight-card">
              <span className="intro-highlight-value">03</span>
              <p className="intro-highlight-label">
                einfache Schritte vom Thema bis zur Roadmap
              </p>
            </article>
          </div>
        </div>

        <div className="intro-visual">
          <div className="intro-orbit intro-orbit-one" />
          <div className="intro-orbit intro-orbit-two" />

          <div className="intro-professor-card">
            <div className="intro-professor-copy">
              <p className="intro-professor-label">Dein Guide</p>
              <h3>Der Professor</h3>
              <p>
                Er verwandelt unklare Lernziele in einen strukturierten Weg mit
                Fokus, Etappen und echter Orientierung.
              </p>
            </div>

            <div className="intro-professor-stage">
              <div className="intro-professor-glow" />
              <img src={professorImg} alt="Professor character" />
            </div>

            <div className="intro-professor-note intro-professor-note-top">
              <strong>Startklar</strong>
              <span>Thema, Niveau, Motivation</span>
            </div>

            <div className="intro-professor-note intro-professor-note-bottom">
              <strong>Ergebnis</strong>
              <span>klarer Lernpfad in wenigen Minuten</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
