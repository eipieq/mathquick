#!/usr/bin/env node
/**
 * Generates a static question bank for all skill/level/mode combinations.
 * Run once: VITE_VENICE_API_KEY=your_key node scripts/generateQuestionBank.mjs
 * Output: src/adaptive/questionBank.json
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const API_KEY = process.env.VITE_VENICE_API_KEY;
if (!API_KEY) {
  console.error("error: VITE_VENICE_API_KEY environment variable is not set");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../src/adaptive/questionBank.json");

const SKILL_KEYS = ["add", "sub", "mul", "div", "pct", "chain"];
const MODES = ["direct", "situational"];
const LEVELS = [1, 2, 3, 4, 5];
const QUESTIONS_PER_BUCKET = 15;
const TIMER_BY_LEVEL = [30, 30, 25, 20, 15];

const SKILL_LABELS = {
  add:   "addition",
  sub:   "subtraction",
  mul:   "multiplication",
  div:   "division",
  pct:   "percentages",
  chain: "multi-step arithmetic",
};

const LEVEL_DESCRIPTIONS = {
  add: [
    "both numbers between 3 and 9 (no 0 or 1), single digits only, e.g. 7 plus 4, 6 plus 8",
    "2-digit number between 21 and 49 plus a 1-digit number between 3 and 9, no carrying, e.g. 32 plus 5, 44 plus 7",
    "both numbers 2-digit, between 14 and 79, may involve carrying, e.g. 47 plus 38, 56 plus 29",
    "3-digit number between 112 and 499 plus a 2-digit number between 23 and 89, e.g. 124 plus 67, 347 plus 58",
    "both numbers 3-digit, between 123 and 699, carrying across hundreds required, e.g. 456 plus 378, 287 plus 465",
  ],
  sub: [
    "both numbers between 3 and 9, result at least 2, e.g. 9 minus 3, 8 minus 5",
    "2-digit number between 23 and 79 minus a 1-digit number between 2 and 8, no borrowing, e.g. 45 minus 3, 67 minus 4",
    "both numbers 2-digit, minuend between 31 and 89, subtrahend between 13 and 49, borrowing required, e.g. 63 minus 27, 71 minus 38",
    "3-digit number between 150 and 499 minus a 2-digit number between 23 and 89, e.g. 182 minus 47, 364 minus 78",
    "both numbers 3-digit, minuend between 400 and 899, borrowing across multiple places, e.g. 503 minus 278, 741 minus 385",
  ],
  mul: [
    "one operand is 2, 5, or 10; the other operand is between 3 and 9; e.g. 7 times 5, 4 times 10, 8 times 2",
    "one operand is 3, 4, or 6; the other operand is between 3 and 9; e.g. 8 times 4, 6 times 3, 7 times 6",
    "one operand is 7, 8, or 9; the other operand is between 4 and 9; e.g. 6 times 9, 7 times 8, 9 times 5",
    "one operand is 11 or 12; the other is between 4 and 12; e.g. 12 times 7, 11 times 9, 12 times 8",
    "two-digit number between 13 and 29 times a one-digit number between 3 and 9; e.g. 24 times 7, 17 times 6, 23 times 8",
  ],
  div: [
    "dividend between 10 and 50, divisor is 2, 5, or 10, whole number result, e.g. 30 divided by 5, 40 divided by 10, 18 divided by 2",
    "dividend between 12 and 72, divisor is 3, 4, or 6, whole number result, e.g. 24 divided by 4, 54 divided by 6, 36 divided by 3",
    "dividend between 28 and 81, divisor is 7, 8, or 9, whole number result, e.g. 63 divided by 7, 56 divided by 8, 72 divided by 9",
    "dividend between 60 and 200, divisor between 11 and 15, whole number result, e.g. 144 divided by 12, 165 divided by 11",
    "dividend between 100 and 500, divisor between 7 and 25, whole number result, e.g. 336 divided by 14, 460 divided by 20",
  ],
  pct: [
    "50 percent of an even number between 20 and 160, e.g. 50 percent of 80, 50 percent of 140",
    "25 or 75 percent of a round number (multiple of 4) between 40 and 400, e.g. 25 percent of 200, 75 percent of 120",
    "10 or 20 percent of a number between 30 and 250, e.g. 10 percent of 65, 20 percent of 130",
    "percentage between 15 and 80 (multiples of 5) of a 2-digit number between 20 and 95, e.g. 40 percent of 75, 60 percent of 45",
    "compound: find a percentage (10–50%) of an amount between 30 and 150, then split or add a fixed amount, e.g. 20 percent tip on 45 dollars split 2 ways",
  ],
  chain: [
    "add then subtract with single digits all between 3 and 9, first result under 20, e.g. 5 plus 8 minus 4, 7 plus 6 minus 3",
    "multiply then add: multiplier and multiplicand both between 2 and 6, addend between 4 and 15, e.g. 4 times 3 plus 7, 5 times 4 plus 9",
    "two operations, intermediate result between 30 and 70, e.g. 8 times 7 minus 14, 6 times 9 plus 12",
    "three distinct numbers, two operations, final result between 20 and 100, e.g. 6 times 8 plus 24, 9 times 7 minus 33",
    "percentage then arithmetic: find 10–30% of a number between 30 and 150, then add or subtract a whole number, e.g. 20 percent of 60 plus 8",
  ],
};

async function fetchBatch({ skillKey, level, mode, timerSeconds, count }) {
  const levelDesc = LEVEL_DESCRIPTIONS[skillKey]?.[level - 1] ?? "";
  const skillLabel = SKILL_LABELS[skillKey] ?? skillKey;

  const systemPrompt = mode === "situational"
    ? `you generate situational mental math word problems for an audio-first quiz app. questions are read aloud via text-to-speech — natural spoken sentences, no symbols, spell everything out.

rules:
- real-life scenarios only: shopping, bills, tips, travel, savings, sports, cooking, etc.
- answer must be a whole number. no decimals.
- one or two sentences max. exactly one correct numerical answer.
- no em dashes, no parentheses.
- every question in the batch must use a completely different scenario and different numbers.

respond with ONLY a JSON array: [{"text":"...","answer":42}, ...]`
    : `you generate direct mental arithmetic questions for an audio-first quiz app. questions are read aloud via text-to-speech — natural spoken sentences, no symbols, spell everything out.

rules:
- pure arithmetic only. no stories, no real-life context.
- spell out operations: plus, minus, times, divided by, percent of.
- answer must be a whole number. no decimals.
- one sentence only.
- never use 0 or 1 as an operand — every number must require genuine mental effort.
- every question in the batch must use completely different numbers — no two questions should be similar.

respond with ONLY a JSON array: [{"text":"...","answer":42}, ...]`;

  const userPrompt = mode === "situational"
    ? `generate ${count} different situational word problems, all exercising ${skillLabel} at difficulty level ${level} of 5.
level ${level} means: ${levelDesc}
each must use a completely different real-life scenario and different numbers. answers must be whole numbers.`
    : `generate ${count} different direct arithmetic questions for ${skillLabel} at difficulty level ${level} of 5.
level ${level} means: ${levelDesc}
use a wide variety of numbers — spread across the full valid range for this level. no two questions should look similar. answers must be whole numbers.`;

  const res = await fetch("https://api.venice.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b",
      max_tokens: 800,
      temperature: 1.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Venice API error: ${res.status}`);

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("no JSON array in response");

  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed)) throw new Error("expected array");

  const BAD_PHRASES = ["not valid", "invalid", "cannot", "note:", "avoid", "instead", "excluded", "example"];

  return parsed
    .filter((q) => {
      if (typeof q.text !== "string" || typeof q.answer !== "number") return false;
      if (q.answer <= 0) return false;
      if (q.text.length < 6 || q.text.length > 250) return false;
      const lower = q.text.toLowerCase();
      if (BAD_PHRASES.some((p) => lower.includes(p))) return false;
      return true;
    })
    .map((q) => ({ text: q.text, answer: q.answer, timerSeconds }));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const bank = {};
  const total = MODES.length * SKILL_KEYS.length * LEVELS.length;
  let done = 0;

  for (const mode of MODES) {
    for (const skillKey of SKILL_KEYS) {
      for (const level of LEVELS) {
        const key = `${mode}:${skillKey}:${level}`;
        const timerSeconds = TIMER_BY_LEVEL[level - 1] ?? 25;
        process.stdout.write(`[${++done}/${total}] generating ${key} ... `);

        try {
          // generate in two batches of ~8 to stay under max_tokens safely
          const batchA = await fetchBatch({ skillKey, level, mode, timerSeconds, count: 8 });
          await sleep(800);
          const batchB = await fetchBatch({ skillKey, level, mode, timerSeconds, count: 8 });

          // deduplicate by text
          const seen = new Set();
          const combined = [];
          for (const q of [...batchA, ...batchB]) {
            const key = q.text.toLowerCase().trim();
            if (!seen.has(key)) {
              seen.add(key);
              combined.push(q);
            }
          }

          bank[key] = combined.slice(0, QUESTIONS_PER_BUCKET);
          console.log(`ok (${bank[key].length} questions)`);
        } catch (err) {
          console.log(`FAILED: ${err.message}`);
          bank[key] = [];
        }

        // rate limit: wait between requests
        await sleep(1200);
      }
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(bank, null, 2));
  const total_q = Object.values(bank).reduce((sum, b) => sum + b.length, 0);
  console.log(`\ndone. ${total_q} questions across ${Object.keys(bank).length} buckets.`);
  console.log(`saved to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
