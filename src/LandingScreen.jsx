import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, Brain, Lightning, GlobeStand, ArrowSquareOut, GearSix } from "@phosphor-icons/react";
import NavBar from "./NavBar";
import SettingsModal from "./SettingsModal.jsx";
import { useSettings } from "./useSettings.js";
import { useLearner } from "./adaptive/useLearner.js";

const PLACEMENTS = [
  { key: "beginner",     label: "just starting",  sub: "single digit basics" },
  { key: "intermediate", label: "pretty good",     sub: "multi-digit, multiplication" },
  { key: "advanced",     label: "bring it on",     sub: "all skills, hard levels" },
];

const HOW_IT_WORKS = [
  { icon: Headphones, title: "listen", desc: "questions are read aloud" },
  { icon: Brain, title: "solve", desc: "do the math in your head" },
  { icon: Lightning, title: "answer", desc: "type fast, build streaks" },
];

export default function LandingScreen() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const { hasExistingState, placeLearner } = useLearner();
  const [placement, setPlacement] = useState("intermediate");

  function handlePlay(mode) {
    if (!hasExistingState) placeLearner(placement);
    navigate(`/play/${mode}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <NavBar
        rightContent={
          <button
            className="btn-secondary"
            onClick={() => setShowSettings(true)}
            style={{ padding: "7px 14px", fontSize: "1rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <GearSix size={20} weight="fill" color="var(--icon-default)" />
            settings
          </button>
        }
      />
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdate={update}
          onClose={() => setShowSettings(false)}
          onPlaceLearner={placeLearner}
        />
      )}

      <div style={styles.page}>
        {/* top: image left, content right */}
        <div style={styles.hero} className="landing-hero">
          <img
            src="/homepage.png"
            alt="frog knight"
            style={styles.heroImage}
            className="landing-hero-image"
          />

          <div style={styles.heroContent} className="stagger landing-hero-content">
            <p style={styles.badge} className="landing-badge">audio-first math trainer</p>
            <h1 style={styles.title}>Hear it.<br />Solve it.</h1>
            <p style={styles.tagline}>
              no peeking. no reading. just mental math under pressure.
            </p>

            {/* placement picker — shown only on first visit */}
            {!hasExistingState && (
              <div style={styles.placementSection}>
                <p style={styles.placementLabel}>starting level</p>
                <div style={styles.placementRow}>
                  {PLACEMENTS.map((p) => {
                    const active = placement === p.key;
                    return (
                      <button
                        key={p.key}
                        onClick={() => setPlacement(p.key)}
                        style={{ ...styles.placementBtn, ...(active ? styles.placementBtnActive : {}) }}
                      >
                        <span style={{ ...styles.placementBtnLabel, ...(active ? { color: "var(--accent)" } : {}) }}>{p.label}</span>
                        <span style={styles.placementBtnSub}>{p.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* mode buttons in a row */}
            <div style={styles.modes} className="landing-modes" role="group" aria-label="Game modes">
              <button
                style={{ ...styles.modeBtn, ...styles.situationalBtn }}
                onClick={() => handlePlay("situational")}
              >
                <GlobeStand size={24} weight="fill" style={{ opacity: 0.85, flexShrink: 0 }} />
                <div style={styles.modeMeta}>
                  <span style={styles.modeName}>situational</span>
                  <span style={styles.modeSub}>word problems</span>
                </div>
              </button>

              <button
                style={{ ...styles.modeBtn, ...styles.directBtn }}
                onClick={() => handlePlay("direct")}
              >
                <Lightning size={24} weight="fill" color="var(--icon-default)" style={{ flexShrink: 0 }} />
                <div style={styles.modeMeta}>
                  <span style={{ ...styles.modeName, color: "var(--text-primary)", textTransform: "uppercase" }}>direct</span>
                  <span style={{ ...styles.modeSub, color: "var(--text-tertiary)" }}>arithmetic</span>
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* divider */}
        <div style={styles.divider} />

        {/* bottom row: how it works + research link */}
        <div style={styles.bottomRow} className="landing-bottom">
          <div style={styles.howSection}>
            <p style={styles.howLabel}>how it works</p>
            <div style={styles.howGrid}>
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.title} style={styles.howItem}>
                  <div style={styles.howNum}>{i + 1}</div>
                  <step.icon size={24} weight="fill" color="var(--icon-default)" />
                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <p style={styles.howTitle}>{step.title}</p>
                    <p style={styles.howDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.researchSide} className="landing-research-side">
            <button onClick={() => navigate("/research")} style={styles.researchLink}>
              <ArrowSquareOut size={16} weight="bold" color="var(--accent)" />
              read the research behind adaptive learning
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
    flexDirection: "column",
    padding: "clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px) clamp(32px, 4vw, 56px)",
    maxWidth: "860px",
    width: "100%",
    margin: "0 auto",
    gap: "clamp(28px, 4vw, 48px)",
  },
  hero: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "clamp(24px, 4vw, 56px)",
  },
  heroImage: {
    width: "clamp(140px, 22vw, 260px)",
    flexShrink: 0,
    objectFit: "contain",
  },
  heroContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flex: 1,
    minWidth: 0,
  },
  badge: {
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "var(--accent)",
    background: "var(--accent-subtle)",
    padding: "4px 12px",
    borderRadius: "var(--radius-pill)",
    letterSpacing: "-0.01em",
    display: "inline-block",
    alignSelf: "flex-start",
  },
  title: {
    fontSize: "clamp(1.75rem, 4vw, 3rem)",
    fontWeight: 900,
    color: "var(--text-primary)",
    letterSpacing: "-0.04em",
    lineHeight: 1.1,
  },
  tagline: {
    fontSize: "clamp(0.875rem, 1.6vw, 1rem)",
    fontWeight: 500,
    color: "var(--text-secondary)",
    lineHeight: 1.6,
  },
  modes: {
    display: "flex",
    flexDirection: "row",
    gap: "8px",
  },
  modeBtn: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    borderRadius: "var(--radius-md)",
    border: "none",
    cursor: "pointer",
    flex: 1,
    textAlign: "left",
  },
  modeMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },
  situationalBtn: {
    background: "var(--accent)",
    color: "var(--text-inverse)",
  },
  directBtn: {
    background: "var(--surface)",
    border: "1.5px solid var(--border)",
  },
  modeName: {
    fontSize: "0.875rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "var(--text-inverse)",
    textTransform: "uppercase",
  },
  modeSub: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: "-0.01em",
  },
  placementSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  placementLabel: {
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "var(--text-tertiary)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  placementRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  placementBtn: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "8px 12px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border)",
    background: "var(--surface)",
    cursor: "pointer",
    textAlign: "left",
    flex: 1,
    minWidth: "90px",
    transition: "border-color 0.15s ease, background 0.15s ease",
  },
  placementBtnActive: {
    borderColor: "var(--accent)",
    background: "var(--accent-subtle)",
  },
  placementBtnLabel: {
    fontSize: "0.8125rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  placementBtnSub: {
    fontSize: "0.6875rem",
    fontWeight: 500,
    color: "var(--text-tertiary)",
    letterSpacing: "-0.01em",
  },
  settingsBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.8125rem",
    fontWeight: 700,
    color: "var(--text-tertiary)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    letterSpacing: "-0.01em",
    alignSelf: "flex-start",
  },
  divider: {
    height: "1px",
    background: "var(--border)",
  },
  bottomRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "0",
    flexWrap: "wrap",
  },
  researchSide: {
    borderLeft: "1px solid var(--border)",
    paddingLeft: "clamp(20px, 3vw, 36px)",
    display: "flex",
    alignItems: "flex-start",
    flexShrink: 0,
  },
  researchLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "var(--accent)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  },
  howSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flex: 1,
    paddingRight: "clamp(20px, 3vw, 36px)",
  },
  howLabel: {
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "var(--text-tertiary)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  howGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "clamp(12px, 2vw, 20px)",
  },
  howItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  howNum: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "var(--bg-subtle)",
    border: "1.5px solid var(--border)",
    fontSize: "0.6875rem",
    fontWeight: 800,
    color: "var(--text-tertiary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  howTitle: {
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  howDesc: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--text-tertiary)",
    letterSpacing: "-0.01em",
  },
};
