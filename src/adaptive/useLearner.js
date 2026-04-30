import { useState, useCallback } from "react";
import { fsrs, Rating } from "ts-fsrs";
import { DEFAULT_LEARNER, applyAttemptResult, applyFsrsCard } from "./learnerModel.js";

const STORAGE_KEY = "mq_learner_v1";
const f = fsrs();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LEARNER;
    const saved = JSON.parse(raw);
    // merge against default to handle new fields in future versions
    return {
      ...DEFAULT_LEARNER,
      ...saved,
      skills: Object.fromEntries(
        Object.entries(DEFAULT_LEARNER.skills).map(([k, def]) => [
          k,
          { ...def, ...(saved.skills?.[k] ?? {}) },
        ])
      ),
    };
  } catch {
    return DEFAULT_LEARNER;
  }
}

function save(learner) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(learner));
}

export function useLearner() {
  const [learner, setLearner] = useState(() => load());

  const recordAttempt = useCallback((skillKey, correct, responseMs) => {
    setLearner((prev) => {
      // update learner model
      let next = applyAttemptResult(prev, skillKey, correct, responseMs);

      // update FSRS card
      const card = prev.skills[skillKey].fsrsCard;
      const now = new Date();
      const rating = correct ? Rating.Good : Rating.Again;
      const result = f.next(card, now, rating);
      next = applyFsrsCard(next, skillKey, result.card);

      save(next);
      return next;
    });
  }, []);

  const resetLearner = useCallback(() => {
    const fresh = { ...DEFAULT_LEARNER, createdAt: new Date().toISOString() };
    save(fresh);
    setLearner(fresh);
  }, []);

  return { learner, recordAttempt, resetLearner };
}
