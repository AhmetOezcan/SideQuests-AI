import { useEffect, useId, useState } from "react";
import introImage from "./assets/bild_intro.png";
import "./IntroPage.css";

const TECHNICAL_SECTIONS = [
  {
    eyebrow: "System Flow",
    title: "Was diese App technisch mit deinen Antworten macht",
    points: [
      "Du gibst vier strukturierte Signale ein: Thema, Lernziel, aktuelles Niveau und bevorzugten Lernstil.",
      "Das Frontend sendet diese Daten als JSON an den FastAPI-Endpunkt /generate.",
      "Im Backend wird daraus ein klar eingeschränkter Prompt gebaut, der 4 bis 8 kleine Lern-Quests im festen JSON-Schema erzeugen soll.",
      "Die UI rendert daraus direkt Titel, Zeitaufwand und kopierbare Prompts, statt freie Modelltexte ungefiltert anzuzeigen.",
    ],
  },
  {
    eyebrow: "Prompt Engineering",
    title: "Warum Prompt Engineering hier entscheidend ist",
    points: [
      "Sprachmodelle antworten nicht magisch, sondern berechnen Token für Token die wahrscheinlichste Fortsetzung.",
      "Wenn Kontext, Rolle, Format und Regeln fehlen, entstehen schnell generische oder unbrauchbare Antworten.",
      "Gute Prompts reduzieren Mehrdeutigkeit: Sie setzen Ziel, Schwierigkeitsgrad, Struktur und Ausgabestil bewusst.",
      "Genau deshalb zerlegt SideQuests Lernen in kleine, klare Prompts statt in einen einzigen vagen Mega-Request.",
    ],
  },
  {
    eyebrow: "Quest Engine",
    title: "Warum der Lernpfad in kleine SideQuests geteilt wird",
    points: [
      "Jede Quest ist ein fokussierter Lernschritt mit eigenem Prompt und begrenztem Ziel.",
      "Beim Start einer Quest wird der Prompt an /chat geschickt und der Chat bleibt nur auf diese eine Aufgabe fokussiert.",
      "Dadurch bleibt der Kontext kompakt, Feedback wird präziser und du verlierst dich nicht in langen AI-Unterhaltungen.",
      "Falls die Modellanfrage ausfällt, liefert das Backend einen Fallback-Plan, damit der Lernfluss nicht stoppt.",
    ],
  },
];

const TECH_STACK = [
  "React + Vite im Frontend",
  "FastAPI als Backend",
  "Responses API für Generierung und Quest-Chat",
  "JSON-Schema für konsistente Ausgaben",
];

export default function IntroPage({ onStart }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();

  useEffect(() => {
    if (!isDetailsOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDetailsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDetailsOpen]);

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

            <button
              className="intro-hero__button intro-hero__button--secondary"
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isDetailsOpen}
            >
              Wie es funktioniert
            </button>
          </div>

          <div className="intro-hero__meta">
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

      {isDetailsOpen && (
        <div
          className="intro-modal"
          role="presentation"
          onClick={() => setIsDetailsOpen(false)}
        >
          <section
            className="intro-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescriptionId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="intro-modal__header">
              <div>
                <p className="intro-modal__eyebrow">Technischer Deep Dive</p>
                <h2 className="intro-modal__title" id={dialogTitleId}>
                  Wie SideQuests AI lernt, strukturiert und bessere Prompts erzeugt
                </h2>
              </div>

              <button
                className="intro-modal__close"
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                aria-label="Fenster schließen"
              >
                ×
              </button>
            </div>

            <p className="intro-modal__lead" id={dialogDescriptionId}>
              Diese Plattform erzeugt keinen zufälligen KI-Text. Sie sammelt
              wenige, aber relevante Nutzersignale und übersetzt sie in einen
              kontrollierten Prompt-Flow mit strukturiertem Output.
            </p>

            <div className="intro-modal__stack" aria-label="Verwendete Technik">
              {TECH_STACK.map((item) => (
                <span key={item} className="intro-modal__chip">
                  {item}
                </span>
              ))}
            </div>

            <div className="intro-modal__grid">
              {TECHNICAL_SECTIONS.map((section) => (
                <article key={section.title} className="intro-modal__card">
                  <p className="intro-modal__card-eyebrow">{section.eyebrow}</p>
                  <h3>{section.title}</h3>

                  <ul className="intro-modal__list">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="intro-modal__footer">
              <p>
                Kurz gesagt: Nicht nur die KI ist wichtig, sondern die Struktur
                der Anfrage. Gute Prompt-Architektur macht Ergebnisse klarer,
                reproduzierbarer und für Lernen deutlich nützlicher.
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
