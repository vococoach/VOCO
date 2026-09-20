// Bigger celebrations than a single quiz score: one-time milestones for the
// night-to-morning streak, category mastery, and words learned. Each fires
// once, ever — the first time it's crossed — and is then remembered in
// localStorage (MILESTONES_KEY) so it never repeats.
//
//   streak   night-to-morning streak reaches 3 / 7 / 30 days (NOT the daily
//            streak — that tracks something different)
//   mastery  a category is mastered once EVERY level in it has been
//            completed with a perfect score at least once; milestones at the
//            1st, 3rd and all-6 categories mastered
//   words    distinct words that have ever reached box 3+ of the spaced-
//            repetition system (answered correctly on two occasions in a row —
//            retained, not merely seen once): 25 / 50 / 100 / 200
//
// The descriptors from describeMilestone()/streakCard() carry all the
// copy, and are the single source for both the in-app celebration card
// (components/MilestoneCards.js) and the shareable image (lib/shareCard.js).

import {
  getAllProgress,
  getNightToMorningStreak,
  getWordsLearnedCount,
  MILESTONES_KEY,
} from "./progress";

export const STREAK_MILESTONES = [3, 7, 30];
export const MASTERY_MILESTONES = [1, 3, 6];
export const WORDS_MILESTONES = [25, 50, 100, 200];

// Colors reuse the app's existing palette — the same recipe as the score-tier
// cards (lib/scoreTier.js): `accent` for graphics, `deep` for small text on
// the cream card. Streak = dawn orange, mastery = "correct answer" green,
// words = the app's lavender.
export const CARD_STYLES = {
  streak: { accent: "#FF9B5C", deep: "#A9501A", rgb: "255, 155, 92", icon: "sunrise" },
  daily: { accent: "#FF9B5C", deep: "#A9501A", rgb: "255, 155, 92", icon: "flame" },
  // A different glyph from the score card's check: a mastery milestone only ever
  // fires on a perfect level quiz, so it always sits right under a green
  // "Perfect score" card and would read as a duplicate with the same glyph.
  mastery: { accent: "#7BC9A0", deep: "#2F7A55", rgb: "123, 201, 160", icon: "award" },
  words: { accent: "#8B85FF", deep: "#5B54D6", rgb: "139, 133, 255", icon: "book" },
};

// --- stats ---

// A level counts as perfected if it was EVER completed at 100%. `perfectAt`
// is the sticky field; a record from before it existed falls back to its
// latest score being perfect (the best evidence available).
export function isPerfectOnce(record) {
  if (!record) return false;
  if (record.perfectAt) return true;
  return record.lastQuizTotal > 0 && record.lastScore === record.lastQuizTotal;
}

export function getMasteredCategories(categories, sets) {
  return categories.filter(
    (category) => category.levels.length > 0 && category.levels.every((level) => isPerfectOnce(sets[level.id]))
  );
}

export function getStats(categories, now = new Date()) {
  const mastered = getMasteredCategories(categories, getAllProgress());
  return {
    streak: getNightToMorningStreak(now),
    masteredCategories: mastered,
    masteredCount: mastered.length,
    wordsLearned: getWordsLearnedCount(),
  };
}

// --- once-only bookkeeping ---

function readShown() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MILESTONES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeShown(ids) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MILESTONES_KEY, JSON.stringify(ids));
  } catch (e) {}
}

// Milestones newly crossed since the last check, already marked as shown
// (call this at the moment you display them). Only the HIGHEST newly crossed
// threshold per kind is returned — if someone jumps from nothing to 7 days
// (or 60 words) they get one celebration, not a stack of smaller ones — but
// every crossed threshold is marked shown so the lower ones never surface
// later. Returns raw objects; pass each to describeMilestone().
export function checkNewMilestones(categories, now = new Date()) {
  const stats = getStats(categories, now);
  const shown = new Set(readShown());
  const totalWords = categories.reduce((n, c) => n + c.levels.reduce((m, l) => m + l.words.length, 0), 0);
  const totalCategories = categories.filter((c) => c.levels.length > 0).length;
  const found = [];

  function consider(kind, thresholds, value, extra = {}) {
    const crossed = thresholds.filter((t) => value >= t && !shown.has(`${kind}-${t}`));
    if (crossed.length === 0) return;
    crossed.forEach((t) => shown.add(`${kind}-${t}`));
    const threshold = Math.max(...crossed);
    found.push({ id: `${kind}-${threshold}`, kind, threshold, value, totalWords, totalCategories, ...extra });
  }

  consider("streak", STREAK_MILESTONES, stats.streak);
  consider("mastery", MASTERY_MILESTONES, stats.masteredCount, {
    // Only the very first mastery can be named as "the" category.
    category: stats.masteredCount === 1 ? stats.masteredCategories[0] : null,
  });
  consider("words", WORDS_MILESTONES, stats.wordsLearned);

  if (found.length) writeShown([...shown]);
  return found;
}

// --- copy ---

const DOMAIN = "voco.courses";

const STREAK_COPY = {
  3: { headline: "The rhythm is taking hold.", note: "Three night-to-morning cycles in a row." },
  7: {
    headline: "A full week.",
    note: "Seven night-to-morning cycles in a row — study at night, quiz in the morning.",
  },
  30: {
    headline: "Thirty days running.",
    note: "A month of night-to-morning cycles, back to back. That's a real habit.",
  },
};

const WORDS_COPY = {
  25: "A solid start.",
  50: "Fifty and counting.",
  100: "A hundred words.",
  200: "Nearly the whole word bank.",
};

// The card descriptor: everything both the in-app card and the share image
// need. { style, label, big, unit, [figure], headline, note, shareText, filename }.
export function describeMilestone(m) {
  if (m.kind === "streak") {
    return {
      style: "streak",
      label: "Night-to-morning streak",
      big: String(m.threshold),
      unit: "days in a row",
      ...STREAK_COPY[m.threshold],
      shareText: `${m.threshold} days in a row — my night-to-morning streak on Voco. Study at night, quiz in the morning. ${DOMAIN}`,
      filename: `voco-night-to-morning-streak-${m.threshold}.png`,
    };
  }

  if (m.kind === "mastery") {
    const headline =
      m.threshold === 1
        ? m.category
          ? `${m.category.title} mastered.`
          : "First category mastered."
        : m.threshold === 3
        ? "Three categories mastered."
        : "Every category mastered.";
    const note =
      m.threshold === 1
        ? "Every level completed with a perfect score at least once."
        : m.threshold === 3
        ? "Half the course — every level in each, perfect at least once."
        : `All ${m.totalCategories}, every level perfect at least once. That's the whole course.`;
    return {
      style: "mastery",
      label: "Category mastery",
      big: String(m.value),
      unit: `of ${m.totalCategories} categories mastered`,
      headline,
      note,
      shareText: `${m.value} of ${m.totalCategories} vocab categories mastered on Voco. ${DOMAIN}`,
      filename: `voco-categories-mastered-${m.value}.png`,
    };
  }

  // words
  return {
    style: "words",
    label: "Words learned",
    big: String(m.threshold),
    // The image already says "WORDS LEARNED" as its label, so its unit line
    // gives scale instead; the in-app card (which labels itself "Milestone")
    // uses `figure`.
    unit: `of ${m.totalWords} words`,
    figure: `${m.threshold} words learned`,
    headline: WORDS_COPY[m.threshold],
    note:
      m.threshold >= 200
        ? `${m.threshold} of ${m.totalWords} words, each answered correctly at least twice in a row.`
        : "Each one answered correctly at least twice in a row.",
    shareText: `${m.threshold} SAT vocab words learned on Voco. ${DOMAIN}`,
    filename: `voco-words-learned-${m.threshold}.png`,
  };
}

// On-demand cards for a streak that isn't at a milestone — shareable from
// wherever the streak is displayed. `kind` is "streak" (night-to-morning) or
// "daily" (the general any-quiz streak).
export function streakCard(kind, days) {
  const unit = days === 1 ? "day in a row" : "days in a row";
  if (kind === "streak") {
    return {
      style: "streak",
      label: "Night-to-morning streak",
      big: String(days),
      unit,
      headline: "Night, then morning.",
      note: "Study the night before, quiz after waking.",
      shareText: `${days} ${days === 1 ? "day" : "days"} in a row — my night-to-morning streak on Voco. Study at night, quiz in the morning. ${DOMAIN}`,
      filename: `voco-night-to-morning-streak-${days}.png`,
    };
  }
  return {
    style: "daily",
    label: "Daily streak",
    big: String(days),
    unit,
    headline: "A quiz every day.",
    note: "Consecutive days with a completed quiz.",
    shareText: `${days} ${days === 1 ? "day" : "days"} in a row on Voco. ${DOMAIN}`,
    filename: `voco-daily-streak-${days}.png`,
  };
}
