import { X } from "@phosphor-icons/react";

const TIME_PRESETS = [
  { label: "auto", value: null },
  { label: "15s",  value: 15  },
  { label: "20s",  value: 20  },
  { label: "25s",  value: 25  },
  { label: "30s",  value: 30  },
  { label: "45s",  value: 45  },
  { label: "60s",  value: 60  },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        background: checked ? "var(--accent)" : "var(--border)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s ease",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: "3px",
        left: checked ? "23px" : "3px",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
      }} />
    </button>
  );
}

const DIFFICULTY_LEVELS = [
  { key: "beginner",     label: "easier",      sub: "single digit basics" },
  { key: "intermediate", label: "medium",       sub: "multi-digit, multiplication" },
  { key: "advanced",     label: "harder",       sub: "all skills, hard levels" },
];

export default function SettingsModal({ settings, onUpdate, onClose, onPlaceLearner }) {
  return (
    <div
      style={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card pop-in" style={styles.modal}>
        {/* header */}
        <div style={styles.header}>
          <p style={styles.title}>settings</p>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close settings">
            <X size={18} weight="bold" color="var(--text-tertiary)" />
          </button>
        </div>

        <div style={styles.divider} />

        {/* difficulty section */}
        {onPlaceLearner && (
          <>
            <div style={styles.section}>
              <div>
                <p style={styles.label}>difficulty</p>
                <p style={styles.sub}>resets your progress to a new starting point</p>
              </div>
              <div style={styles.diffRow}>
                {DIFFICULTY_LEVELS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => { onPlaceLearner(d.key); onClose(); }}
                    style={styles.diffBtn}
                  >
                    <span style={styles.diffBtnLabel}>{d.label}</span>
                    <span style={styles.diffBtnSub}>{d.sub}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.divider} />
          </>
        )}

        {/* timer section */}
        <div style={styles.section}>
          <div style={styles.row}>
            <div>
              <p style={styles.label}>time limit</p>
              <p style={styles.sub}>countdown per question</p>
            </div>
            <Toggle
              checked={settings.timerEnabled}
              onChange={(v) => onUpdate({ timerEnabled: v })}
            />
          </div>

          {settings.timerEnabled && (
            <div style={styles.presetSection}>
              <p style={styles.presetLabel}>seconds per question</p>
              <div style={styles.presets}>
                {TIME_PRESETS.map((p) => {
                  const active = settings.timerSeconds === p.value;
                  return (
                    <button
                      key={String(p.value)}
                      onClick={() => onUpdate({ timerSeconds: p.value })}
                      style={{ ...styles.presetBtn, ...(active ? styles.presetBtnActive : {}) }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              {settings.timerSeconds === null && (
                <p style={styles.hint}>adapts to question difficulty — harder questions get more time</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(18, 21, 31, 0.32)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300,
    padding: "24px",
    backdropFilter: "blur(4px)",
  },
  modal: {
    width: "100%",
    maxWidth: "360px",
    padding: "0",
    display: "flex",
    flexDirection: "column",
    gap: "0",
    overflow: "hidden",
    borderRadius: "var(--radius-xl)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 20px 16px",
  },
  title: {
    fontSize: "1rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.03em",
  },
  closeBtn: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    border: "1.5px solid var(--border)",
    background: "var(--surface)",
    padding: 0,
    cursor: "pointer",
  },
  divider: {
    height: "1px",
    background: "var(--border)",
  },
  section: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  label: {
    fontSize: "0.9375rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
    marginBottom: "2px",
  },
  sub: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--text-tertiary)",
    letterSpacing: "-0.01em",
  },
  presetSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  presetLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "var(--text-tertiary)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  presets: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  presetBtn: {
    padding: "6px 14px",
    borderRadius: "var(--radius-pill)",
    border: "1.5px solid var(--border)",
    background: "var(--surface)",
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "var(--text-secondary)",
    cursor: "pointer",
    letterSpacing: "-0.02em",
    transition: "border-color 0.15s ease, background 0.15s ease, color 0.15s ease",
  },
  presetBtnActive: {
    borderColor: "var(--accent)",
    background: "var(--accent-subtle)",
    color: "var(--accent)",
  },
  hint: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "var(--text-tertiary)",
    letterSpacing: "-0.01em",
    lineHeight: 1.5,
  },
  diffRow: {
    display: "flex",
    gap: "6px",
  },
  diffBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "10px 10px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border)",
    background: "var(--surface)",
    cursor: "pointer",
    textAlign: "left",
    transition: "border-color 0.15s ease, background 0.15s ease",
  },
  diffBtnLabel: {
    fontSize: "0.8125rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  diffBtnSub: {
    fontSize: "0.6875rem",
    fontWeight: 500,
    color: "var(--text-tertiary)",
    letterSpacing: "-0.01em",
    lineHeight: 1.4,
  },
};
