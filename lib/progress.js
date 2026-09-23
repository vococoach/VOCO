// All progress is stored on-device via localStorage. No accounts, no server,
// no database. This means progress does NOT sync across devices/browsers —
// that's the tradeoff for zero backend complexity in the MVP.

import { localDateStr } from "./timeOfDay";

const KEY = "voco_progress_v1";
// Which one-time milestone celebrations have already been shown (lib/milestones.js).
// Lives here only so resetProgress() can clear it without a circular import.
export const MILESTONES_KEY = "voco_milestones_shown_v1";
// Reading-passage results (lib/passageProgress.js) — a separate record on purpose:
// passages test reading, not word retention, so they never feed the spaced-
// repetition boxes, streaks or milestones. Lives here only so resetProgress()
// can clear it without a circular import.
export const PASSAGES_KEY = "voco_passages_v1";
// Grammar quiz results (lib/grammarProgress.js) — separate for the same reason
// as passages: a grammar rule doesn't degrade the way a forgotten word does,
// so it doesn't feed spaced repetition, streaks or milestones either. Lives
// here only so resetProgress() can clear it without a circular import.
export const GRAMMAR_KEY = "voco_grammar_v1";
// Practice-test attempt history (lib/practiceTestProgress.js) — separate for
// the same reason as passages and grammar: a full timed test is a snapshot
// assessment, not word retention, so it never feeds spaced repetition,
// streaks or milestones. Also the source of "which questions has this device
// already seen in a practice test," used to avoid repeats across attempts.
// Lives here only so resetProgress() can clear it without a circular import.
export const PRACTICE_TESTS_KEY = "voco_practice_tests_v1";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return fallback;
  }
}

function readStore() {
  if (typeof window === "undefined") return { sets: {}, quizDates: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { sets: {}, quizDates: [] };
    const parsed = safeParse(raw, { sets: {}, quizDates: [] });
    return { sets: parsed.sets || {}, quizDates: parsed.quizDates || [] };
  } catch (e) {
    // localStorage can throw in private browsing modes on some browsers
    return { sets: {}, quizDates: [] };
  }
}

function writeStore(store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch (e) {
    // fail silently — worst case, progress just doesn't persist this session
  }
}

// EVERY date in this file is the learner's LOCAL calendar day (YYYY-MM-DD).
// It used to be UTC (`toISOString()`), which put a 9pm quiz in California on
// "tomorrow" — skewing the daily streak and, worse, the spaced-repetition
// schedule — and made addDays() drift a day east of UTC. Keep it local.
function todayStr() {
  return localDateStr(new Date());
}

export function getAllProgress() {
  return readStore().sets;
}

export function getSetProgress(setId) {
  const store = readStore();
  return (
    store.sets[setId] || {
      studiedAt: null,
      lastScore: null,
      lastQuizTotal: null,
      lastQuizAt: null,
    }
  );
}

// `studiedAt` / `lastQuizAt` are local calendar days (see todayStr()). The
// time-aware home screen (lib/timeOfDay.js) needs the exact moment, not just
// the day — "last night" vs "this morning" — so `studiedTs` / `lastQuizTs`
// (epoch ms) are written alongside them.
export function markStudied(setId) {
  const store = readStore();
  const existing = store.sets[setId] || {};
  store.sets[setId] = { ...existing, studiedAt: todayStr(), studiedTs: Date.now() };
  writeStore(store);
}

export function recordQuizResult(setId, score, total) {
  const store = readStore();
  const existing = store.sets[setId] || {};
  const today = todayStr();
  store.sets[setId] = {
    ...existing,
    lastScore: score,
    lastQuizTotal: total,
    lastQuizAt: today,
    lastQuizTs: Date.now(),
    // Sticky: `lastScore` only remembers the latest attempt, so "this level
    // was completed perfectly at least once" (category mastery, see
    // lib/milestones.js) needs its own field that a later worse retake can't
    // erase. Set once, on the first 100%.
    ...(total > 0 && score === total && !existing.perfectAt ? { perfectAt: today } : {}),
  };
  if (!store.quizDates.includes(today)) {
    store.quizDates = [...store.quizDates, today].slice(-60);
  }
  writeStore(store);
}

// Consecutive local calendar days present in `dates` (a Set of YYYY-MM-DD),
// ending today — or yesterday, if today is still pending (it doesn't break the
// streak yet). A missed day resets to 0. Steps day by day with setDate() rather
// than subtracting 24h, which lands on the wrong day when a daylight-saving
// change makes a day 23 or 25 hours long. Shared by both streaks below.
function consecutiveDayStreak(dates, now) {
  if (dates.size === 0) return 0;
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!dates.has(localDateStr(day))) day.setDate(day.getDate() - 1);

  let streak = 0;
  while (dates.has(localDateStr(day))) {
    streak += 1;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

// The daily streak: consecutive days with at least one completed quiz.
export function getStreak(now = new Date()) {
  return consecutiveDayStreak(new Set(readStore().quizDates), now);
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(WORDS_KEY);
    window.localStorage.removeItem(NIGHT_TO_MORNING_KEY);
    window.localStorage.removeItem(MILESTONES_KEY);
    window.localStorage.removeItem(PASSAGES_KEY);
    window.localStorage.removeItem(GRAMMAR_KEY);
    window.localStorage.removeItem(PRACTICE_TESTS_KEY);
  } catch (e) {}
}

// --- Night-to-morning streak ---
//
// A separate counter from getStreak() above, which tracks something
// different: any quiz on any day. A *cycle* is one full night-to-morning
// loop — a level studied last night, then quizzed the next morning through
// the home screen's "Last night's words" prompt (the quiz page decides that
// with the same findLastNightsLevel() the card uses; see
// app/sets/[setId]/quiz/page.js). Counted exactly like getStreak() — the
// same consecutiveDayStreak() helper.
const NIGHT_TO_MORNING_KEY = "voco_night_to_morning_v1";

function readCycleDates() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NIGHT_TO_MORNING_KEY);
    const parsed = raw ? safeParse(raw, []) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Record that a cycle was completed on `now`'s local day. Several cycles on
// one morning (two levels studied last night) still count as one day.
export function recordNightToMorning(now = new Date()) {
  const today = localDateStr(now);
  const dates = readCycleDates();
  if (dates.includes(today)) return;
  try {
    window.localStorage.setItem(NIGHT_TO_MORNING_KEY, JSON.stringify([...dates, today].slice(-60)));
  } catch (e) {}
}

export function getNightToMorningStreak(now = new Date()) {
  return consecutiveDayStreak(new Set(readCycleDates()), now);
}

// --- Spaced repetition (Leitner system) ---
//
// Every word a user has ever answered gets its own record: which "box"
// it's in, and when it's next due. Box 1 = just missed, review again right
// away. Higher boxes = answered correctly more times in a row, and get
// reviewed less often. Missing a word at any box sends it straight back to
// box 1 — that's the core mechanic that makes weak words keep resurfacing
// until they actually stick.

const WORDS_KEY = "voco_word_srs_v1";
const MAX_BOX = 5;
// Days until a word in this box is due again. Index 0 = box 1.
const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16];

// dateStr is a local YYYY-MM-DD; the result is too (Date normalizes overflow
// and setDate-style stepping is daylight-saving safe).
function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return localDateStr(new Date(year, month - 1, day + days));
}

function readWordRecords() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(WORDS_KEY);
    return raw ? safeParse(raw, {}) : {};
  } catch (e) {
    return {};
  }
}

function writeWordRecords(records) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WORDS_KEY, JSON.stringify(records));
  } catch (e) {}
}

// Call this once per question, right after the user answers it — in a
// level quiz or a review session, doesn't matter which.
export function recordWordResult(wordId, correct) {
  const records = readWordRecords();
  const existing = records[wordId] || { box: 1, timesSeen: 0 };
  const today = todayStr();
  const box = correct ? Math.min(MAX_BOX, existing.box + 1) : 1;
  records[wordId] = {
    box,
    // Sticky highest box ever reached — `box` drops back to 1 on a miss, but
    // "words learned" (below) counts words that have *ever* reached box 3.
    maxBox: Math.max(existing.maxBox || existing.box, box),
    timesSeen: existing.timesSeen + 1,
    lastResult: correct ? "correct" : "incorrect",
    nextReviewDate: addDays(today, BOX_INTERVAL_DAYS[box - 1]),
  };
  writeWordRecords(records);
}

// Don't force every due word into one sitting — cap a session (whether
// quizzing at /review or studying the same words first) and let the rest
// roll over to next time.
export const REVIEW_SESSION_CAP = 20;

// IDs of every word that's currently due for review (already seen at least
// once, and its scheduled date has arrived), ordered by review priority:
// lowest box first (these are the words most likely to be forgotten), then
// by how overdue they are within that box (oldest nextReviewDate first).
// The /review page (and the "due for review" study course) rely on this
// order to build a prioritized session.
export function getDueWordIds() {
  const records = readWordRecords();
  const today = todayStr();
  return Object.keys(records)
    .filter((id) => records[id].nextReviewDate <= today)
    .sort((a, b) => {
      const boxDiff = records[a].box - records[b].box;
      if (boxDiff !== 0) return boxDiff;
      return records[a].nextReviewDate < records[b].nextReviewDate ? -1 : records[a].nextReviewDate > records[b].nextReviewDate ? 1 : 0;
    });
}

// IDs of every word currently sitting in box 1 — missed most recently and
// hasn't recovered yet. Powers the "Missed Words" course, which drills
// specifically on words the learner is actively struggling with right now.
// Distinct from getDueWordIds(): box 1 words are usually also due (box 1's
// interval is 0 days), but this list is about *how badly* a word is going,
// not whether today happens to be its scheduled review date.
export function getStruggleWordIds() {
  const records = readWordRecords();
  return Object.keys(records).filter((id) => records[id].box === 1);
}

// A word counts as "learned" once it has reached this box — i.e. it was
// answered correctly on at least two occasions in a row (box 1 -> 2 -> 3),
// not merely seen once. Records from before `maxBox` existed fall back to
// their current box.
export const LEARNED_BOX = 3;

// Distinct words that have ever reached LEARNED_BOX or higher. Monotonic: a
// later miss doesn't un-learn a word, so milestone counts never go backwards.
export function getWordsLearnedCount() {
  const records = readWordRecords();
  return Object.values(records).filter((r) => (r.maxBox || r.box) >= LEARNED_BOX).length;
}

export function getWordRecord(wordId) {
  return readWordRecords()[wordId] || null;
}
