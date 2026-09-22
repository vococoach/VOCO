// Grammar quiz results, kept on their own — NOT part of the vocabulary
// progress, spaced repetition, streaks or milestones (see GRAMMAR_KEY in
// lib/progress.js for why). One record per grammar level id (e.g.
// "boundaries-1"), the same shape passages use:
//   { completedAt: "YYYY-MM-DD" (local day of the latest finish),
//     lastScore, lastTotal, bestScore, attempts }
// A level counts as "completed" once it has been finished at least once,
// whatever the score. Everything is on-device localStorage, like the rest.

import { GRAMMAR_KEY } from "./progress";
import { localDateStr } from "./timeOfDay";

function readAll() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GRAMMAR_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
}

export function getAllGrammarRecords() {
  return readAll();
}

export function getGrammarRecord(levelId) {
  return readAll()[levelId] || null;
}

export function recordGrammarResult(levelId, score, total, now = new Date()) {
  if (typeof window === "undefined") return;
  const all = readAll();
  const prev = all[levelId];
  all[levelId] = {
    completedAt: localDateStr(now),
    lastScore: score,
    lastTotal: total,
    bestScore: Math.max(score, prev ? prev.bestScore || 0 : 0),
    attempts: (prev ? prev.attempts || 0 : 0) + 1,
  };
  try {
    window.localStorage.setItem(GRAMMAR_KEY, JSON.stringify(all));
  } catch (e) {}
}

// How many levels across `categories` (a course's grammar categories) have
// been finished at least once.
export function countGrammarLevelsCompleted(categories, records = readAll()) {
  return categories
    .flatMap((c) => c.levels)
    .filter((l) => records[l.id] && records[l.id].completedAt).length;
}
