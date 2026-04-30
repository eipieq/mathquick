import { useState, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, Fire, ThumbsUp, SmileyNervous, ShareNetwork, ArrowCounterClockwise, Check } from "@phosphor-icons/react";
import NavBar from "./NavBar";

function getIcon(streak) {
  if (streak >= 10) return Trophy;
  if (streak >= 6) return Fire;
  if (streak >= 3) return ThumbsUp;
  return SmileyNervous;
}

function getMessage(streak) {
  if (streak >= 10) return "absolutely unhinged. respect.";
  if (streak >= 6) return "seriously impressive run.";
  if (streak >= 3) return "solid work, keep it up.";
  if (streak >= 1) return "a start is a start.";
  return "zero streak. it can only go up.";
}

export default function EndScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useLayoutEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  const { streak = 0, correct = 0, total = 0, mode = "direct" } = location.state || {};
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  if (!location.state) {
    navigate("/", { replace: true });
    return null;
  }

  const Icon = getIcon(streak);

  function handleShare() {
    const text = `i got ${streak} in a row on MathQuick (${mode} mode)! ${correct}/${total} correct. can you beat it?`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <NavBar />

      <div style={styles.page}>
        <div className="card stagger" style={styles.inner}>
          <div className="pop-in" style={styles.iconCircle}>
            <Icon size={40} weight="fill" color={Icon === Fire ? "#E07B6A" : "var(--accent)"} />
          </div>

          <div style={styles.streakBlock}>
            <p className="text-xs font-bold text-tertiary" style={{ letterSpacing: "0.02em", textTransform: "uppercase" }}>
              best streak
            </p>
            <p style={styles.streakNum} aria-label={`Best streak: ${streak}`}>
              {streak}
            </p>
          </div>

          <p className="text-sm font-medium text-secondary">{getMessage(streak)}</p>

          <div style={styles.statsRow} role="list" aria-label="Game statistics">
            <div style={styles.stat} role="listitem">
              <span className="font-extrabold" style={{ fontSize: "1.25rem" }}>{correct}</span>
              <span className="text-xs font-bold text-tertiary">correct</span>
            </div>
            <div style={styles.statDivider} aria-hidden="true" />
            <div style={styles.stat} role="listitem">
              <span className="font-extrabold" style={{ fontSize: "1.25rem" }}>{total}</span>
              <span className="text-xs font-bold text-tertiary">questions</span>
            </div>
            <div style={styles.statDivider} aria-hidden="true" />
            <div style={styles.stat} role="listitem">
              <span className="font-extrabold" style={{ fontSize: "1.25rem" }}>{accuracy}%</span>
              <span className="text-xs font-bold text-tertiary">accuracy</span>
            </div>
          </div>

          <div style={styles.actions}>
            <button className="btn-secondary" onClick={handleShare} style={styles.actionBtn}>
              {copied
                ? <><Check size={20} weight="bold" color="var(--success)" /> copied!</>
                : <><ShareNetwork size={20} weight="fill" color="var(--icon-default)" /> share result</>
              }
            </button>
            <button className="btn-primary" onClick={() => navigate("/")} style={styles.actionBtn}>
              <ArrowCounterClockwise size={20} weight="fill" />
              play again
            </button>
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
    padding: "clamp(24px, 4vw, 48px) clamp(16px, 3vw, 32px)",
    background: "var(--bg)",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "clamp(10px, 1.5vw, 14px)",
    maxWidth: "420px",
  },
  iconCircle: {
    width: "clamp(64px, 12vw, 88px)",
    height: "clamp(64px, 12vw, 88px)",
    borderRadius: "50%",
    background: "var(--accent-subtle)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  streakBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  streakNum: {
    fontSize: "clamp(2.5rem, 8vw, 4rem)",
    fontWeight: 900,
    color: "var(--accent)",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(12px, 3vw, 20px)",
    padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)",
    background: "var(--bg)",
    borderRadius: "var(--radius-md)",
    width: "100%",
    justifyContent: "center",
    marginTop: "4px",
    marginBottom: "4px",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  statDivider: {
    width: "1px",
    height: "28px",
    background: "var(--border)",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
  },
  actionBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
};
