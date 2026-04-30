// Question cache — localStorage, keyed by mode:skillKey:level
// Stores up to MAX_PER_BUCKET generated questions per bucket and reuses them.

const STORAGE_KEY = "mq_question_cache_v1";
const MAX_PER_BUCKET = 30;

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(cache) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // storage full — clear cache and start fresh
    localStorage.removeItem(STORAGE_KEY);
  }
}

function bucketKey(mode, skillKey, level) {
  return `${mode}:${skillKey}:${level}`;
}

// returns a random unseen cached question, or null if none available
export function getCachedQuestion(mode, skillKey, level, seenTexts = new Set()) {
  const cache = load();
  const bucket = cache[bucketKey(mode, skillKey, level)] ?? [];
  if (bucket.length === 0) return null;

  const unseen = bucket.filter((q) => !seenTexts.has(q.text));
  if (unseen.length === 0) return null; // all seen — let caller generate fresh

  return unseen[Math.floor(Math.random() * unseen.length)];
}

// adds a question to the cache, deduplicates by answer text
export function cacheQuestion(mode, skillKey, level, question) {
  const cache = load();
  const key = bucketKey(mode, skillKey, level);
  const bucket = cache[key] ?? [];

  // deduplicate — don't store if same text already exists
  const exists = bucket.some((q) => q.text.toLowerCase() === question.text.toLowerCase());
  if (exists) return;

  bucket.push({ text: question.text, answer: question.answer, timerSeconds: question.timerSeconds });

  // cap bucket size
  cache[key] = bucket.slice(-MAX_PER_BUCKET);
  save(cache);
}

// how many questions we have cached for a bucket
export function bucketSize(mode, skillKey, level) {
  const cache = load();
  return (cache[bucketKey(mode, skillKey, level)] ?? []).length;
}

export function clearQuestionCache() {
  localStorage.removeItem(STORAGE_KEY);
}

// returns the text of the most recently cached questions for a bucket (for prompt dedup)
export function getRecentCachedTexts(mode, skillKey, level, n = 8) {
  const cache = load();
  const bucket = cache[bucketKey(mode, skillKey, level)] ?? [];
  return bucket.slice(-n).map((q) => q.text);
}
