// All progress is stored on-device via localStorage. No accounts, no server,
// no database. This means progress does NOT sync across devices/browsers —
// that's the tradeoff for zero backend complexity in the MVP.

const KEY = "voco_progress_v1";

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

function todayStr() {
  return new Date().toISOString().slice(0, 10);
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

export function markStudied(setId) {
  const store = readStore();
  const existing = store.sets[setId] || {};
  store.sets[setId] = { ...existing, studiedAt: todayStr() };
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
  };
  if (!store.quizDates.includes(today)) {
    store.quizDates = [...store.quizDates, today].slice(-60);
  }
  writeStore(store);
}

// Streak = consecutive calendar days with at least one completed quiz.
// Today is allowed to still be "pending" without breaking the streak.
export function getStreak() {
  const store = readStore();
  const dates = new Set(store.quizDates);
  if (dates.size === 0) return 0;

  const oneDay = 86400000;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  if (!dates.has(checkDate.toISOString().slice(0, 10))) {
    checkDate = new Date(checkDate.getTime() - oneDay);
  }

  let streak = 0;
  while (dates.has(checkDate.toISOString().slice(0, 10))) {
    streak += 1;
    checkDate = new Date(checkDate.getTime() - oneDay);
  }

  return streak;
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(WORDS_KEY);
  } catch (e) {}
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

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
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

export function getWordRecord(wordId) {
  return readWordRecords()[wordId] || null;
}
