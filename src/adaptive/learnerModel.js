import { createEmptyCard } from "ts-fsrs";

export const SKILL_KEYS = ["add", "sub", "mul", "div", "pct", "chain"];

// which skills are available at start vs unlocked by progress
export const UNLOCK_CONDITIONS = {
  mul:   (s) => s.add.level >= 2,
  div:   (s) => s.mul.level >= 2,
  pct:   (s) => s.div.level >= 2,
  chain: (s) => s.mul.level >= 3 && s.add.level >= 3,
};

const INITIALLY_UNLOCKED = ["add", "sub"];

function defaultSkill() {
  return {
    level: 1,
    recentWindow: [],   // last 5 outcomes: 1=correct, 0=wrong/timeout
    attempts: 0,
    correct: 0,
    lastSeenAt: null,
    fsrsCard: createEmptyCard(),
  };
}

export const DEFAULT_LEARNER = {
  version: 1,
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
  unlocked: [...INITIALLY_UNLOCKED],
  skills: Object.fromEntries(SKILL_KEYS.map((k) => [k, defaultSkill()])),
};

// returns "struggling" | "zpd" | "mastered"
export function computeZone(skill) {
  const w = skill.recentWindow;
  if (w.length < 3) return "zpd"; // not enough data, assume zpd
  const acc = w.reduce((a, b) => a + b, 0) / w.length;
  if (acc < 0.6) return "struggling";
  if (acc > 0.85) return "mastered";
  return "zpd";
}

// returns updated learner (pure, no mutation)
export function applyAttemptResult(learner, skillKey, correct, responseMs) {
  const skill = learner.skills[skillKey];
  const window = [...skill.recentWindow, correct ? 1 : 0].slice(-5);
  const newCorrect = skill.correct + (correct ? 1 : 0);
  const newAttempts = skill.attempts + 1;

  // check for promotion
  let newLevel = skill.level;
  if (
    window.length >= 5 &&
    window.reduce((a, b) => a + b, 0) >= 4 &&
    correct &&
    responseMs < 15000
  ) {
    newLevel = Math.min(5, skill.level + 1);
  }

  // check for demotion: last 3 all wrong
  if (
    window.length >= 3 &&
    window.slice(-3).every((x) => x === 0)
  ) {
    newLevel = Math.max(1, skill.level - 1);
  }

  const updatedSkill = {
    ...skill,
    level: newLevel,
    recentWindow: window,
    attempts: newAttempts,
    correct: newCorrect,
    lastSeenAt: new Date().toISOString(),
  };

  const updatedSkills = { ...learner.skills, [skillKey]: updatedSkill };

  // check unlocks
  const unlocked = new Set(learner.unlocked);
  for (const [key, condition] of Object.entries(UNLOCK_CONDITIONS)) {
    if (!unlocked.has(key) && condition(updatedSkills)) {
      unlocked.add(key);
    }
  }

  return {
    ...learner,
    lastActiveAt: new Date().toISOString(),
    unlocked: [...unlocked],
    skills: updatedSkills,
  };
}

// apply FSRS card state update (called after ts-fsrs schedules next review)
export function applyFsrsCard(learner, skillKey, card) {
  return {
    ...learner,
    skills: {
      ...learner.skills,
      [skillKey]: { ...learner.skills[skillKey], fsrsCard: card },
    },
  };
}
