import { computeZone } from "./learnerModel.js";

// pure function — takes learner state, returns { skillKey, level }
export function selectNext(learner) {
  const now = Date.now();
  const unlocked = learner.unlocked;

  // score each unlocked skill by how overdue its FSRS card is
  const scored = unlocked.map((key) => {
    const skill = learner.skills[key];
    const due = skill.fsrsCard?.due ? new Date(skill.fsrsCard.due).getTime() : 0;
    const overdueness = Math.max(0, now - due); // ms overdue
    const zone = computeZone(skill);
    return { key, skill, overdueness, zone };
  });

  // sort: struggling skills that are overdue get top priority
  const struggling = scored.filter((s) => s.zone === "struggling");
  const zpd = scored.filter((s) => s.zone === "zpd");
  const mastered = scored.filter((s) => s.zone === "mastered");

  // pick from struggling first if any are overdue
  if (struggling.length > 0) {
    const pick = struggling.sort((a, b) => b.overdueness - a.overdueness)[0];
    return { skillKey: pick.key, level: Math.max(1, pick.skill.level - 1) };
  }

  // 20% confidence check: pull from a mastered skill
  if (mastered.length > 0 && Math.random() < 0.2) {
    const pick = mastered[Math.floor(Math.random() * mastered.length)];
    return { skillKey: pick.key, level: pick.skill.level };
  }

  // otherwise pick from ZPD, preferring most overdue
  if (zpd.length > 0) {
    const pick = zpd.sort((a, b) => b.overdueness - a.overdueness)[0];
    return { skillKey: pick.key, level: pick.skill.level };
  }

  // everything mastered — try to push the most advanced skill up a level
  if (mastered.length > 0) {
    const pick = mastered.sort((a, b) => b.skill.level - a.skill.level)[0];
    return { skillKey: pick.key, level: Math.min(5, pick.skill.level + 1) };
  }

  // fallback
  return { skillKey: unlocked[0], level: 1 };
}
