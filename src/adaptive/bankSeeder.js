// Seeds localStorage question cache from the static question bank on app startup.
// Only fills buckets that are below MIN_SEED_SIZE to avoid overwriting a user's
// grown cache with the smaller bundled set.

import bank from "./questionBank.json";
import { cacheQuestion, bucketSize } from "./questionCache.js";

const MIN_SEED_SIZE = 10;

export function seedBankIfNeeded() {
  for (const [key, questions] of Object.entries(bank)) {
    if (!questions || questions.length === 0) continue;
    const [mode, skillKey, levelStr] = key.split(":");
    const level = parseInt(levelStr, 10);
    if (bucketSize(mode, skillKey, level) < MIN_SEED_SIZE) {
      for (const q of questions) {
        cacheQuestion(mode, skillKey, level, q);
      }
    }
  }
}
