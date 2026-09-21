// Reading-passage results, kept on their own — NOT part of the vocabulary
// progress, spaced repetition, streaks or milestones (see PASSAGES_KEY in
// lib/progress.js for why). One record per passage id:
//   { completedAt: "YYYY-MM-DD" (local day of the latest finish),
//     lastScore, lastTotal, bestScore, attempts }
// A passage counts as "completed" once it has been finished at least once,
// whatever the score. Everything is on-device localStorage, like the rest.

import { PASSAGES_KEY } from "./progress";
import { localDateStr } from "./timeOfDay";

function readAll() {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PASSAGES_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
}

export function getAllPassageRecords() {
  return readAll();
}

export function getPassageRecord(passageId) {
  return readAll()[passageId] || null;
}

export function recordPassageResult(passageId, score, total, now = new Date()) {
  if (typeof window === "undefined") return;
  const all = readAll();
  const prev = all[passageId];
  all[passageId] = {
    completedAt: localDateStr(now),
    lastScore: score,
    lastTotal: total,
    bestScore: Math.max(score, prev ? prev.bestScore || 0 : 0),
    attempts: (prev ? prev.attempts || 0 : 0) + 1,
  };
  try {
    window.localStorage.setItem(PASSAGES_KEY, JSON.stringify(all));
  } catch (e) {}
}

// How many of `passages` (a course's list) have been finished at least once.
export function countPassagesCompleted(passages, records = readAll()) {
  return passages.filter((p) => records[p.id] && records[p.id].completedAt).length;
}
