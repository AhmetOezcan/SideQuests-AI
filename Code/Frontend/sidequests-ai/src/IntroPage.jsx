import introImage from "./assets/bild_intro.png";
import "./IntroPage.css";

export default function IntroPage({ onStart }) {
  return (
    <main className="intro-page">
      <div className="intro-page__grain" aria-hidden="true" />

      <header className="intro-nav">
        <div className="intro-nav__group" />

        <div className="intro-nav__brand">
          <span>SideQuests AI</span>
        </div>

        <div className="intro-nav__group intro-nav__group--right" />
      </header>

      <section className="intro-hero">
        <div className="intro-hero__copy">
          <p className="intro-hero__eyebrow">Structured AI Learning</p>

          <h1 className="intro-hero__title">
            The Art
            <br />
            of Prompting
          </h1>

          <p className="intro-hero__text">
          Die Qualität von KI-Ergebnissen hängt von der Struktur des Inputs ab.
          Sprachmodelle arbeiten probabilistisch auf Token-Ebene – jede Eingabe beeinflusst die Ausgabe.

          Unstrukturierte Prompts führen zu generischen Antworten.

          Diese Plattform nutzt systematisches Prompt Engineering, um Lernen zu strukturieren:
          Wissen wird schrittweise aufgebaut, Kontext gezielt vermittelt und Ergebnisse iterativ verbessert.

          Das führt zu präziseren, reproduzierbaren und hochwertigeren Resultaten.
          </p>

          <div className="intro-hero__actions">
            <button className="intro-hero__button intro-hero__button--primary" type="button" onClick={onStart}>
              Start Quest
            </button>

            <a className="intro-hero__button intro-hero__button--secondary" href="#intro-details">
              Wie es funktioniert
            </a>
          </div>

          <div className="intro-hero__meta" id="intro-details">
            <p>4 Fragen bis zu deinem Pfad</p>
            <p>Prompt direkt nutzbar</p>
            <p>Mini-Test am Ende</p>
          </div>

        </div>

        <div className="intro-hero__visual" aria-hidden="true">
          <div className="intro-art">
            <span className="intro-art__shape intro-art__shape--peach" />
            <span className="intro-art__shape intro-art__shape--berry" />
            <span className="intro-art__shape intro-art__shape--leaf" />
            <span className="intro-art__plant intro-art__plant--left" />
            <span className="intro-art__plant intro-art__plant--right" />

            <div className="intro-art__figure" />
            <img className="intro-art__image" src={introImage} alt="" />
          </div>
        </div>
      </section>
    </main>
  );
}
