import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Fire,
  ArrowClockwise,
  SpeakerHigh,
  Check,
  X,
  Timer,
  House,
  FlagBanner,
  Pause,
  Play,
} from "@phosphor-icons/react";
import { useElevenLabs } from "./useElevenLabs";
import { useAdaptiveSession } from "./useAdaptiveSession";
import { useSettings } from "./useSettings";
import NavBar from "./NavBar";

const CIRCUMFERENCE = 2 * Math.PI * 20;

function TimerRing({ seconds, total }) {
  const fraction = seconds / total;
  const offset = CIRCUMFERENCE * (1 - fraction);
  const isWarning = seconds <= 5;

  return (
    <div className="timer-ring" role="timer" aria-label={`${seconds} seconds remaining`}>
      <svg viewBox="0 0 48 48" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
        <circle className="track" cx="24" cy="24" r="20" />
        <circle
          className={`fill${isWarning ? " warning" : ""}`}
          cx="24" cy="24" r="20"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span style={{ color: isWarning ? "var(--error)" : "var(--text-primary)", zIndex: 1, fontSize: "1rem" }}>
        {seconds}
      </span>
    </div>
  );
}

export default function GameScreen() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY || "";
  const claudeKey = import.meta.env.VITE_VENICE_API_KEY || "";

  const validMode = mode === "direct" || mode === "situational";

  const {
    currentQuestion,
    isLoading,
    error: genError,
    advance: adaptiveAdvance,
    sessionCount,
  } = useAdaptiveSession(mode, claudeKey);

  const { settings } = useSettings();
  const timerEnabled = settings.timerEnabled;
  // effective total for a question: user override → adaptive default → fallback 30s
  function effectiveTotal(q) {
    return settings.timerSeconds ?? q?.timerSeconds ?? 30;
  }

  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const maxStreakRef = useRef(0);
  const correctRef = useRef(0);
  const questionCountRef = useRef(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [anim, setAnim] = useState(null);
  const [timer, setTimer] = useState(30);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const questionStartRef = useRef(Date.now());
  const { speak, error: ttsError, speaking } = useElevenLabs(elevenLabsKey);

  useEffect(() => {
    if (!validMode) navigate("/", { replace: true });
  }, [validMode, navigate]);

  useLayoutEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  useEffect(() => {
    correctRef.current = correct;
  }, [correct]);

  // reset timer and speak when question changes
  useEffect(() => {
    if (!currentQuestion) return;
    const t = effectiveTotal(currentQuestion);
    setTimer(t);
    setFeedback(null);
    setInput("");
    questionStartRef.current = Date.now();
    speak(currentQuestion.text);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [currentQuestion]);

  // countdown
  useEffect(() => {
    if (!timerEnabled || feedback || !currentQuestion || paused || isLoading) return;
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQuestion, feedback, paused, isLoading]);

  // timeout
  useEffect(() => {
    if (!timerEnabled || timer !== 0 || feedback || !currentQuestion) return;
    setStreak(0);
    setFeedback({ type: "timeout", answer: currentQuestion.answer });
    triggerAnim("shake");
  }, [timer, feedback, currentQuestion, timerEnabled]);

  // auto-advance after feedback
  useEffect(() => {
    if (!feedback) return;
    const delay = feedback.type === "correct" ? 1200 : 2200;
    const id = setTimeout(() => doAdvance(), delay);
    return () => clearTimeout(id);
  }, [feedback]);

  function togglePause() {
    if (!paused) clearInterval(timerRef.current);
    setPaused((p) => !p);
  }

  function triggerAnim(type) {
    setAnim(type);
    setTimeout(() => setAnim(null), 500);
  }

  function goToResults() {
    clearInterval(timerRef.current);
    navigate("/results", {
      state: {
        streak: maxStreakRef.current,
        correct: correctRef.current,
        total: questionCountRef.current,
        mode,
      },
    });
  }

  function doAdvance() {
    const responseMs = Date.now() - questionStartRef.current;
    const wasCorrect = feedback?.type === "correct";
    questionCountRef.current += 1;
    adaptiveAdvance(wasCorrect, responseMs);
  }

  function submit() {
    if (feedback || !currentQuestion) return;
    const parsed = parseFloat(input);
    if (isNaN(parsed)) return;
    clearInterval(timerRef.current);

    if (parsed === currentQuestion.answer) {
      const newStreak = streak + 1;
      maxStreakRef.current = Math.max(maxStreakRef.current, newStreak);
      setStreak(newStreak);
      setCorrect((c) => c + 1);
      setFeedback({ type: "correct", answer: currentQuestion.answer });
      triggerAnim("bounce");
    } else {
      setStreak(0);
      setFeedback({ type: "wrong", answer: currentQuestion.answer });
      triggerAnim("shake");
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") submit();
  }

  if (!validMode) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <NavBar
        rightContent={
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 10px)" }}>
            {timerEnabled && (
              <TimerRing seconds={timer} total={effectiveTotal(currentQuestion)} />
            )}
            <span className="pill" aria-label={`Streak: ${streak}`}>
              <Fire size={20} weight="fill" color="#E07B6A" />
              {streak}
            </span>
            <button
              className="btn-secondary"
              onClick={goToResults}
              style={{ padding: "7px 14px", fontSize: "1rem", display: "flex", alignItems: "center", gap: "6px" }}
              aria-label="Finish game and see results"
            >
              <FlagBanner size={20} weight="fill" color="var(--icon-default)" />
              finish
            </button>
          </div>
        }
      />

      {showQuitConfirm && (
        <div style={styles.overlay} role="dialog" aria-label="Quit confirmation">
          <div className="card pop-in" style={styles.confirmCard}>
            <h3>head back home?</h3>
            <p className="text-sm text-secondary">your progress won't be saved.</p>
            <div style={styles.confirmActions}>
              <button className="btn-secondary" onClick={() => setShowQuitConfirm(false)} style={{ whiteSpace: "nowrap" }}>
                keep playing
              </button>
              <button
                className="btn-primary"
                onClick={() => { clearInterval(timerRef.current); navigate("/"); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
              >
                <House size={20} weight="fill" />
                home
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div
            className={`card fade-in ${anim ? `anim-${anim}` : ""}`}
            style={styles.card}
            key={currentQuestion?.text}
          >
            {/* progress */}
            <div style={styles.cardTop}>
              <span className="text-xs font-bold text-tertiary">
                question {questionCountRef.current + 1}
              </span>
              <div className="progress-track" style={{ flex: 1 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(100, ((questionCountRef.current % 10) / 10) * 100)}%` }}
                />
              </div>
            </div>

            {/* audio zone */}
            <div style={styles.audioZone}>
              <div style={styles.iconWrap}>
                <SpeakerHigh
                  size={28} weight="fill"
                  color={speaking ? "var(--accent)" : "var(--icon-default)"}
                  style={{ transition: "color 0.2s ease" }}
                />
              </div>

              <div style={styles.waveWrap} aria-hidden="true">
                {[0, 150, 300, 150, 0].map((delay, i) => (
                  <span key={i} style={{
                    ...styles.waveDot,
                    animationDelay: `${delay}ms`,
                    background: speaking ? "var(--accent)" : "var(--border)",
                  }} />
                ))}
              </div>

              <p className="text-sm font-semibold text-secondary">
                {isLoading ? "generating question..." : paused ? "paused" : speaking ? "speaking..." : "listen carefully"}
              </p>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="btn-secondary"
                  onClick={() => currentQuestion && speak(currentQuestion.text)}
                  disabled={isLoading || !currentQuestion}
                  style={{ padding: "7px 16px", fontSize: "1rem", display: "flex", alignItems: "center", gap: "6px" }}
                  aria-label="Replay question audio"
                >
                  <ArrowClockwise size={20} weight="fill" color="var(--icon-default)" />
                  replay
                </button>
                <button
                  className="btn-secondary"
                  onClick={togglePause}
                  disabled={isLoading}
                  style={{
                    padding: "7px 16px", fontSize: "1rem", display: "flex", alignItems: "center", gap: "6px",
                    ...(paused ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}),
                  }}
                  aria-label={paused ? "Resume game" : "Pause game"}
                >
                  {paused
                    ? <Play size={20} weight="fill" color="var(--accent)" />
                    : <Pause size={20} weight="fill" color="var(--icon-default)" />
                  }
                  {paused ? "resume" : "pause"}
                </button>
              </div>

              {(ttsError || genError) && (
                <div style={styles.fallback} role="alert">
                  {genError ? (
                    <>
                      <p className="text-xs font-bold" style={{ color: "var(--error)", marginBottom: "4px" }}>
                        couldn't generate question
                      </p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                        check your Claude API key in .env
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold" style={{ color: "var(--error)", marginBottom: "4px" }}>audio unavailable</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)", lineHeight: 1.5 }}>
                        {currentQuestion?.text}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={styles.cardDivider} />

            {/* input zone */}
            <div style={styles.inputZone}>
              {feedback ? (
                <div
                  className="fade-in"
                  role="status"
                  aria-live="polite"
                  style={{
                    ...styles.feedbackBox,
                    background: feedback.type === "correct" ? "var(--success-subtle)" : "var(--error-subtle)",
                    borderColor: feedback.type === "correct" ? "var(--success)" : "var(--error)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    {feedback.type === "correct"
                      ? <Check size={20} weight="bold" color="var(--success)" />
                      : feedback.type === "timeout"
                        ? <Timer size={20} weight="fill" color="var(--error)" />
                        : <X size={20} weight="bold" color="var(--error)" />
                    }
                  </span>
                  <span className="text-sm font-bold">
                    {feedback.type === "correct"
                      ? "nice one!"
                      : feedback.type === "timeout"
                        ? `time's up! answer was ${feedback.answer}`
                        : `nope, it was ${feedback.answer}`}
                  </span>
                </div>
              ) : (
                <div style={styles.inputRow}>
                  <label htmlFor="answer-input" className="sr-only">your answer</label>
                  <input
                    id="answer-input"
                    ref={inputRef}
                    type="number"
                    placeholder="your answer..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    disabled={!!feedback || isLoading}
                    style={styles.input}
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    className="btn-primary"
                    onClick={submit}
                    disabled={!!feedback || isLoading || input.trim() === ""}
                    style={{ flexShrink: 0 }}
                  >
                    submit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(16px, 3vw, 32px) clamp(16px, 3vw, 32px) clamp(60px, 10vw, 120px)",
    background: "var(--bg)",
  },
  wrapper: {
    width: "100%",
    maxWidth: "clamp(340px, 90vw, 480px)",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
    padding: "0",
    overflow: "hidden",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px) clamp(14px, 2.5vw, 20px)",
  },
  audioZone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "clamp(12px, 2vw, 16px)",
    padding: "clamp(28px, 5vw, 44px) clamp(20px, 4vw, 32px)",
  },
  iconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  waveWrap: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    height: "18px",
  },
  waveDot: {
    display: "inline-block",
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    animation: "pulse 1.2s ease-in-out infinite",
  },
  fallback: {
    padding: "12px 16px",
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    textAlign: "center",
    width: "100%",
  },
  cardDivider: {
    height: "1px",
    background: "var(--border)",
    margin: "0 clamp(20px, 4vw, 32px)",
  },
  inputZone: {
    padding: "clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px) clamp(20px, 4vw, 32px)",
    overflow: "hidden",
  },
  feedbackBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid transparent",
    width: "100%",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    width: "100%",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: "13px 16px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border)",
    background: "var(--bg)",
    fontFamily: "'Nunito', sans-serif",
    fontSize: "1.125rem",
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color var(--ease)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(26, 26, 31, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    padding: "24px",
    backdropFilter: "blur(4px)",
  },
  confirmCard: {
    maxWidth: "clamp(300px, 90vw, 380px)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    padding: "clamp(24px, 4vw, 36px) clamp(20px, 4vw, 32px)",
  },
  confirmActions: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
};
