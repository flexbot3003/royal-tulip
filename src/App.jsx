import { useEffect, useMemo, useRef, useState } from "react";
import { ratingMessages, storyConfig as defaultStoryConfig } from "./storyConfig";

const STORAGE_KEY = "royal-tulip-progress-v2";
const CONFIG_KEY = "royal-tulip-admin-config-v1";
const initialProgress = { screen: "identity", chapter: 0, solved: [], endingStep: "offer", rating: 0 };

export const normalizeAnswer = (value) => value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

function loadProgress() {
  try {
    return { ...initialProgress, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return initialProgress;
  }
}

function loadStoryConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY));
    if (!saved) return defaultStoryConfig;
    return {
      ...defaultStoryConfig,
      ...saved,
      chapters: defaultStoryConfig.chapters.map((chapter, index) => ({
        ...chapter,
        ...(saved.chapters?.[index] || {}),
      })),
    };
  } catch {
    return defaultStoryConfig;
  }
}

function Seal({ mark, label, unlocked }) {
  return (
    <div className={`seal-item ${unlocked ? "is-unlocked" : ""}`}>
      <span className="seal-mark" aria-hidden="true">{unlocked ? mark : "?"}</span>
      <span>{unlocked ? label : "Sealed record"}</span>
    </div>
  );
}

function ProgressRail({ solved, config }) {
  return (
    <aside className="progress-rail" aria-label="Collected seals">
      <p className="eyebrow">Imperial evidence</p>
      <div className="seal-list">
        {config.chapters.map((chapter, index) => (
          <Seal key={chapter.kicker} mark={chapter.sealMark} label={chapter.seal} unlocked={solved.includes(index)} />
        ))}
      </div>
    </aside>
  );
}

function IdentityGate({ config, onAdmit }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const reject = [
    "That name appears nowhere in the Imperial Records. Suspicious. Try again.",
    "Rejected. The decree requested Thabi, not an ambitious palace impersonator.",
    "The Chief Eunuch checked twice. You are apparently not the heroine.",
    "A respectable name, perhaps—but it has not been arranged into this marriage.",
    "Identity denied. Please return Thabi to the screen immediately.",
  ];

  const submit = (event) => {
    event.preventDefault();
    if (normalizeAnswer(name) !== normalizeAnswer(config.heroineName)) {
      setError(reject[Math.floor(Math.random() * reject.length)]);
      return;
    }
    setError("");
    onAdmit();
  };

  return (
    <main className="story-shell identity-shell">
      <section className="scroll-panel identity-panel">
        <div className="crest" aria-hidden="true"><span>名</span></div>
        <p className="eyebrow">Restricted imperial record</p>
        <h1>Identify<br /><em>yourself.</em></h1>
        <p className="lead">Only the woman named in the decree may open this record. Impersonation may result in paperwork, exile or mild embarrassment.</p>
        <form className="answer-form identity-form" onSubmit={submit}>
          <label htmlFor="identity-name">Enter your name exactly as the court knows it.</label>
          <div className="answer-row">
            <input id="identity-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoComplete="name" autoFocus />
            <button className="seal-button" type="submit">Confirm identity</button>
          </div>
          {error && <p className="error-message centered rejection" role="alert">{error}</p>}
        </form>
        <p className="fine-print">By submitting a name, the claimant agrees that the palace may become unnecessarily dramatic.</p>
      </section>
    </main>
  );
}

function Prologue({ onBegin, config }) {
  return (
    <main className="story-shell prologue-shell">
      <section className="scroll-panel hero-panel">
        <div className="crest" aria-hidden="true"><span>缘</span></div>
        <p className="eyebrow">Identity confirmed · admission recorded</p>
        <h1>A Most Inconvenient<br /><em>Betrothal</em></h1>
        <div className="ornament" aria-hidden="true"><span>◆</span></div>
        <p className="lead">Lady {config.heroineName} has personally entered her name into a restricted marriage record. The court therefore recognises her as the sole heroine of this investigation.</p>
        <div className="admission-record">
          <span className="record-label">Statement entered into evidence</span>
          <p>By identifying herself, Lady {config.heroineName} admits that she is curious, knowingly opened the decree and cannot later claim that she “clicked something by accident.”</p>
          <strong>Her involvement is now legally inconvenient.</strong>
        </div>
        <p className="fine-print">This admission does not constitute consent to an actual marriage. It does, however, make escaping the plot considerably more difficult.</p>
        <button className="primary-button" onClick={onBegin}>Accept the consequences</button>
      </section>
    </main>
  );
}

function Chapter({ chapterIndex, solved, onSolve, onNext, config }) {
  const chapter = config.chapters[chapterIndex];
  const isSolved = solved.includes(chapterIndex);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [hintIndex, setHintIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    setAnswer("");
    setError("");
    setHintIndex(-1);
  }, [chapterIndex]);

  const submit = (event) => {
    event.preventDefault();
    if (!answer.trim()) {
      setError("Even the Royal Historian requires an actual answer.");
      return;
    }
    const correct = chapter.acceptedAnswers.some((candidate) => normalizeAnswer(candidate) === normalizeAnswer(answer));
    if (!correct) {
      const failures = [
        "An intelligent answer, My Lady. Tragically, it is also incorrect.",
        "The Chief Eunuch has checked twice. The seal remains unimpressed.",
        "A bold accusation. The evidence requests that you try again.",
      ];
      setError(failures[Math.floor(Math.random() * failures.length)]);
      return;
    }
    setError("");
    onSolve(chapterIndex);
  };

  const requestHint = () => {
    setHintIndex((current) => Math.min(current + 1, chapter.hints.length - 1));
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <main className="story-shell chapter-layout">
      <ProgressRail solved={solved} config={config} />
      <section className="scroll-panel chapter-panel">
        <div className="chapter-heading">
          <span className="chapter-number">Chapter {chapter.number}</span>
          <p>{chapter.kicker}</p>
          <h1>{chapter.question}</h1>
        </div>
        {!isSolved ? (
          <>
            <blockquote className="wisdom">{chapter.wisdom.map((line) => <p key={line}>{line}</p>)}</blockquote>
            <div className="clerk-note">
              <span className="portrait-mark" aria-hidden="true">吏</span>
              <div>
                <p className="note-author">A note from the unimportant clerk</p>
                <p>“My Lady, I know nothing about this conspiracy. I simply keep arriving near useful evidence.”</p>
              </div>
            </div>
            <form className="answer-form" onSubmit={submit}>
              <label htmlFor="secret-answer">{chapter.prompt}</label>
              <div className="answer-row">
                <input ref={inputRef} id="secret-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Enter the secret key" autoComplete="off" />
                <button type="submit" className="seal-button">Break seal</button>
              </div>
              <div className="form-meta">
                <button type="button" className="text-button" onClick={requestHint}>Request suspicious counsel</button>
                {error && <p className="error-message" role="alert">{error}</p>}
              </div>
            </form>
            {hintIndex >= 0 && <div className="hint-card" role="status"><span>Counsel {hintIndex + 1}</span><p>{chapter.hints[hintIndex]}</p></div>}
          </>
        ) : (
          <div className="finding reveal-in">
            <div className="large-seal" aria-hidden="true">{chapter.sealMark}</div>
            <p className="eyebrow">Imperial finding</p>
            <h2>{chapter.answerLabel}</h2>
            <p>{chapter.finding}</p>
            <div className="award-line"><span>Seal recovered</span><strong>{chapter.seal}</strong></div>
            <button className="primary-button" onClick={onNext}>{chapterIndex === config.chapters.length - 1 ? "Assemble the complete record" : "Open the next chapter"}</button>
          </div>
        )}
      </section>
    </main>
  );
}

function FinalPuzzle({ onSolved, config }) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if (normalizeAnswer(answer) === normalizeAnswer(config.finalAnswer)) {
      setError("");
      onSolved();
    } else {
      setError(answer.trim() ? "The seals recognise the feeling, but not yet the complete sentence." : "The final record cannot be opened with silence.");
    }
  };
  return (
    <main className="story-shell final-puzzle-shell">
      <section className="scroll-panel final-puzzle">
        <p className="eyebrow">The complete imperial record</p>
        <h1>Four answers.<br /><em>One hidden truth.</em></h1>
        <div className="final-seals" aria-label="Four recovered symbols">
          {config.chapters.map((chapter) => <div key={chapter.seal} className="large-seal small">{chapter.sealMark}</div>)}
        </div>
        <div className="final-riddle">
          <p>Name the man behind the arrangement.</p>
          <p>Name his reason for selecting you.</p>
          <p>Name the distance his title promises.</p>
          <p>Name the path that always brings him home.</p>
        </div>
        <form className="answer-form final-answer-form" onSubmit={submit}>
          <label htmlFor="final-answer">Speak the sentence hidden across every chapter.</label>
          <input id="final-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="I…" autoComplete="off" />
          {error && <p className="error-message centered" role="alert">{error}</p>}
          <button className="primary-button" type="submit">Open the Moon Pavilion</button>
        </form>
      </section>
    </main>
  );
}

function Rating({ value, onRate }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <section className="rating-card">
      <p className="eyebrow">Imperial performance review</p>
      <h2>Rate the boyfriend</h2>
      <div className="stars" onMouseLeave={() => setHovered(0)}>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((star) => (
          <button key={star} type="button" className={star <= display ? "active" : ""} aria-label={`${star} out of 10 stars`} onMouseEnter={() => setHovered(star)} onFocus={() => setHovered(star)} onBlur={() => setHovered(0)} onClick={() => onRate(star)}>★</button>
        ))}
      </div>
      <p className="rating-count">{display ? `${display}/10` : "Awaiting judgment"}</p>
      <p className="rating-message">{display ? ratingMessages[display] : "The accused requests mercy and possibly an extra star."}</p>
    </section>
  );
}

function Ending({ step, onStep, rating, onRate, config }) {
  const content = useMemo(() => {
    const screens = {
      offer: {
        kicker: "True identity revealed",
        title: config.nobleTitle,
        body: <><p>The clerk did not discover the truth beside you. He wrote it, divided it into chapters and waited for you to find your way through it.</p><div className="confession"><p>“You believed I was helping you investigate the arrangement.”</p><p>“In truth, I arranged every clue.”</p><p>“But I could never arrange your answer. That choice has always belonged to you.”</p></div><p className="moon-line">I love you to the moon and back.</p><div className="proposal-box"><span>The actual proposal</span><h3>Will you join me for a movie night at the Moon Pavilion?</h3><p>Includes snacks, blankets, cuddles and the right to demand another episode.</p></div></>,
        actions: [["Accept the arrangement", "acceptedOnce", "primary-button"], ["Expose the mastermind", "exposed", "secondary-button"]],
      },
      acceptedOnce: {
        kicker: "The palace has questions", title: "…Really?",
        body: <><p>Just like that?</p><p>No objection? No attempted escape? No dramatic accusation in the rain?</p><p>We prepared an entire conspiracy, four sealed chapters and a betrayal subplot—and you simply pressed <strong>Accept</strong>?</p></>,
        actions: [["Yes. I accept.", "confirmed", "primary-button"], ["Fine, I’ll be difficult.", "tooLate", "secondary-button"]],
      },
      confirmed: {
        kicker: "The writers are concerned", title: "You are certain?",
        body: <><p>No sword against his throat? No demands for an explanation? Not even one strategically timed slap?</p><p>Her Ladyship has resolved a forty-episode arranged-marriage conflict in under five minutes.</p></>,
        actions: [["I said yes.", "speech", "primary-button"]],
      },
      speech: {
        kicker: "His Lordship objects", title: "I had a longer speech prepared.",
        body: <div className="confession"><p>“That easily? After the hidden identity, forged evidence and dramatic revelation?”</p><p>“I mean… this is entirely your choice.”</p><p>“But I practised the speech.”</p></div>,
        actions: [["You may deliver it during the movie.", "complete", "primary-button"]],
      },
      tooLate: {
        kicker: "Imperial record updated", title: "No, no. You cannot go back now.",
        body: <><p>The records clearly show that you accepted willingly.</p><p>You had your opportunity for resistance, dramatic accusations and a slow-motion escape. You chose peace.</p><p>It is far too late for character development now. You must live with your choices—specifically, snacks, blankets and a movie with me.</p></>,
        actions: [["This feels suspiciously unfair.", "unfair", "secondary-button"]],
      },
      unfair: { kicker: "A valuable discovery", title: "Correct.", body: <p>You have finally understood who the villain is.</p>, actions: [["Demand an appeal", "appeal", "secondary-button"]] },
      appeal: { kicker: "Appeal denied", title: "A minor administrative difficulty", body: <p>The judge, the prosecutor and the mysterious man you were arranged to marry are all unfortunately the same person.</p>, actions: [["Accept my fate", "complete", "primary-button"]] },
      exposed: { kicker: "Interrogation approved", title: "The mastermind will answer for his crimes.", body: <><p>Interrogation venue: The Moon Pavilion.</p><p>Approved supplies: Snacks and blankets.</p><p>Estimated duration: One movie or several episodes.</p></>, actions: [["Begin the interrogation", "complete", "primary-button"]] },
    };
    return screens[step] || screens.offer;
  }, [step, config]);

  if (step === "complete") {
    return <main className="story-shell completion-shell"><section className="scroll-panel completion-panel"><div className="moon-disc" aria-hidden="true">月</div><p className="eyebrow">The Moon Pavilion</p><h1>Your sentence<br /><em>begins tonight.</em></h1><p className="lead">The kingdom is safe. The conspiracy succeeded. The snacks await.</p><Rating value={rating} onRate={onRate} /></section></main>;
  }

  return (
    <main className="story-shell ending-shell">
      <section className="scroll-panel ending-panel reveal-in">
        <p className="eyebrow">{content.kicker}</p><h1>{content.title}</h1><div className="ending-copy">{content.body}</div>
        <div className="button-stack">{content.actions.map(([label, next, className]) => <button key={label} className={className} onClick={() => onStep(next)}>{label}</button>)}</div>
      </section>
    </main>
  );
}

function AdminPanel({ config, onSave, onReset }) {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(config)));

  const unlock = (event) => {
    event.preventDefault();
    if (code !== defaultStoryConfig.adminCode) {
      setError("Access denied. Even the mastermind must remember his own code.");
      return;
    }
    setError("");
    setUnlocked(true);
  };

  const updateChapter = (index, changes) => {
    setDraft((current) => ({
      ...current,
      chapters: current.chapters.map((chapter, chapterIndex) => chapterIndex === index ? { ...chapter, ...changes } : chapter),
    }));
    setSaved(false);
  };

  const save = (event) => {
    event.preventDefault();
    onSave(draft);
    setSaved(true);
  };

  if (!unlocked) {
    return (
      <main className="story-shell admin-shell">
        <section className="scroll-panel admin-login">
          <p className="eyebrow">Restricted mastermind access</p>
          <h1>Imperial<br /><em>control room.</em></h1>
          <p className="lead">This entrance is for the person accused of arranging everything.</p>
          <form className="answer-form" onSubmit={unlock}>
            <label htmlFor="admin-code">Mastermind code</label>
            <div className="answer-row">
              <input id="admin-code" type="password" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter code" autoFocus />
              <button className="seal-button" type="submit">Enter</button>
            </div>
            {error && <p className="error-message centered rejection" role="alert">{error}</p>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div><p className="eyebrow">Mastermind controls</p><h1>Secret-word ledger</h1></div>
        <a className="secondary-button admin-link" href="/">Return to story</a>
      </section>
      <form className="admin-form" onSubmit={save}>
        <section className="admin-card admin-basics">
          <label>Heroine’s accepted name<input value={draft.heroineName} onChange={(event) => setDraft({ ...draft, heroineName: event.target.value })} /></label>
          <label>Final hidden sentence<input value={draft.finalAnswer} onChange={(event) => setDraft({ ...draft, finalAnswer: event.target.value })} /></label>
        </section>
        {draft.chapters.map((chapter, index) => (
          <section className="admin-card" key={chapter.kicker}>
            <div className="admin-card-heading"><span>Chapter {chapter.number}</span><h2>{chapter.question}</h2></div>
            <label>
              Secret words
              <input value={chapter.acceptedAnswers.join(", ")} onChange={(event) => updateChapter(index, { acceptedAnswers: event.target.value.split(",").map((answer) => answer.trim()).filter(Boolean) })} />
              <small>Separate alternatives with commas. Capital letters and punctuation are ignored.</small>
            </label>
            <label>Answer revealed after solving<input value={chapter.answerLabel} onChange={(event) => updateChapter(index, { answerLabel: event.target.value })} /></label>
          </section>
        ))}
        <div className="admin-actions">
          <button className="primary-button" type="submit">Save secret words</button>
          <button className="secondary-button" type="button" onClick={() => { onReset(); setDraft(JSON.parse(JSON.stringify(defaultStoryConfig))); setSaved(false); }}>Restore original settings</button>
          {saved && <p role="status">Saved on this device. The palace records have been altered.</p>}
        </div>
      </form>
    </main>
  );
}

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [config, setConfig] = useState(loadStoryConfig);
  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "1";
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }, [progress]);
  const update = (next) => setProgress((current) => ({ ...current, ...next }));
  const solveChapter = (index) => setProgress((current) => ({ ...current, solved: current.solved.includes(index) ? current.solved : [...current.solved, index] }));
  const nextChapter = () => {
    if (progress.chapter >= config.chapters.length - 1) update({ screen: "final" });
    else { update({ chapter: progress.chapter + 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const reset = () => { if (window.confirm("Erase the investigation and reseal every chapter?")) setProgress(initialProgress); };

  const saveConfig = (nextConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(nextConfig));
    setConfig(nextConfig);
  };

  const resetConfig = () => {
    localStorage.removeItem(CONFIG_KEY);
    setConfig(defaultStoryConfig);
  };

  if (isAdmin) {
    return <div className="app-frame"><div className="paper-noise" aria-hidden="true" /><AdminPanel config={config} onSave={saveConfig} onReset={resetConfig} /></div>;
  }

  return (
    <div className="app-frame">
      <div className="paper-noise" aria-hidden="true" />
      <header className="topbar"><span className="brand-mark">缘</span><span className="brand-name">Royal Tulip</span>{progress.screen !== "identity" && <button className="reset-button" onClick={reset}>Reseal story</button>}</header>
      {progress.screen === "identity" && <IdentityGate config={config} onAdmit={() => update({ screen: "prologue" })} />}
      {progress.screen === "prologue" && <Prologue config={config} onBegin={() => update({ screen: "chapter", chapter: 0 })} />}
      {progress.screen === "chapter" && <Chapter config={config} chapterIndex={progress.chapter} solved={progress.solved} onSolve={solveChapter} onNext={nextChapter} />}
      {progress.screen === "final" && <FinalPuzzle config={config} onSolved={() => update({ screen: "ending", endingStep: "offer" })} />}
      {progress.screen === "ending" && <Ending config={config} step={progress.endingStep} onStep={(endingStep) => update({ endingStep })} rating={progress.rating} onRate={(rating) => update({ rating })} />}
      <footer><span>Private record of the Moon Pavilion</span><span>✦</span></footer>
    </div>
  );
}
