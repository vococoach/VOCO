// Practice-test attempt history, kept on its own — NOT part of vocabulary
// progress, spaced repetition, streaks or milestones (see PRACTICE_TESTS_KEY
// in lib/progress.js for why). Stores every completed attempt:
//   { completedAt: "YYYY-MM-DD", score, total, byType: { vocab, passages,
//     grammar } (each { correct, total }), questionIds: [ids answered in
//     this attempt, for future repeat-avoidance], reused: boolean (whether
//     this attempt had to reuse any earlier questions) }
// An attempt is appended, never overwritten — unlike a passage or grammar
// level, "retaking" a practice test is a brand-new test (a fresh random
// selection), not a retry of the same one. Everything is on-device
// localStorage, like the rest.

import { PRACTICE_TESTS_KEY } from "./progress";
import { localDateStr } from "./timeOfDay";

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PRACTICE_TESTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function getAllPracticeTestAttempts() {
  return readAll();
}

// Every question id this device has ever seen in a practice test, across all
// past attempts — what buildPracticeTest() (lib/practiceTest.js) prefers to
// avoid when building a new one.
export function getUsedQuestionIds() {
  const ids = new Set();
  for (const attempt of readAll()) {
    for (const id of attempt.questionIds || []) ids.add(id);
  }
  return ids;
}

export function recordPracticeTestAttempt({ score, total, byType, questionIds, reused }, now = new Date()) {
  if (typeof window === "undefined") return;
  const all = readAll();
  all.push({
    completedAt: localDateStr(now),
    score,
    total,
    byType,
    questionIds,
    reused,
  });
  try {
    window.localStorage.setItem(PRACTICE_TESTS_KEY, JSON.stringify(all));
  } catch (e) {}
}
