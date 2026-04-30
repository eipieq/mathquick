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

function defaultSkill(level = 1) {
  return {
    level,
    recentWindow: [],   // last N outcomes: 1=correct, 0=wrong/timeout
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

// placement: "beginner" | "intermediate" | "advanced"
export function createPlacedLearner(placement) {
  const base = {
    ...DEFAULT_LEARNER,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  if (placement === "intermediate") {
    return {
      ...base,
      unlocked: ["add", "sub", "mul"],
      skills: {
        ...base.skills,
        add: defaultSkill(3),
        sub: defaultSkill(3),
        mul: defaultSkill(2),
      },
    };
  }

  if (placement === "advanced") {
    return {
      ...base,
      unlocked: ["add", "sub", "mul", "div", "pct", "chain"],
      skills: {
        ...base.skills,
        add: defaultSkill(4),
        sub: defaultSkill(4),
        mul: defaultSkill(3),
        div: defaultSkill(3),
        pct: defaultSkill(2),
        chain: defaultSkill(2),
      },
    };
  }

  return base; // beginner
}

// returns "struggling" | "zpd" | "mastered"
export function computeZone(skill) {
  const w = skill.recentWindow;
  if (w.length < 3) return "zpd"; // not enough data, assume zpd
  const acc = w.reduce((a, b) => a + b, 0) / w.length;
  if (acc < 0.6) return "struggling";
  if (acc > 0.85) return "mastered";
  return "zpd";
}

// how many questions needed and how many correct to promote, per level
const PROMOTE_THRESHOLDS = {
  1: { window: 3, correct: 3 }, // 3/3 — fly through level 1
  2: { window: 4, correct: 3 }, // 3/4
  3: { window: 5, correct: 4 }, // 4/5
  4: { window: 5, correct: 4 }, // 4/5
  5: { window: 5, correct: 5 }, // max level, never promotes
};

// returns updated learner (pure, no mutation)
export function applyAttemptResult(learner, skillKey, correct, responseMs) {
  const skill = learner.skills[skillKey];
  const window = [...skill.recentWindow, correct ? 1 : 0].slice(-5);
  const newCorrect = skill.correct + (correct ? 1 : 0);
  const newAttempts = skill.attempts + 1;

  let newLevel = skill.level;
  const thresh = PROMOTE_THRESHOLDS[skill.level] ?? PROMOTE_THRESHOLDS[4];
  const sum = window.reduce((a, b) => a + b, 0);

  // promote: hit the threshold for this level, answered correctly, within time
  if (
    correct &&
    window.length >= thresh.window &&
    sum >= thresh.correct &&
    responseMs < 15000
  ) {
    newLevel = Math.min(5, skill.level + 1);
  }

  // demote: 3 consecutive wrong
  if (window.length >= 3 && window.slice(-3).every((x) => x === 0)) {
    newLevel = Math.max(1, skill.level - 1);
  }

  // reset window on level change so new level gets a clean read
  const newWindow = newLevel !== skill.level ? [] : window;

  const updatedSkill = {
    ...skill,
    level: newLevel,
    recentWindow: newWindow,
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
