// Bigger celebrations than a single quiz score: one-time milestones for the
// night-to-morning streak, category mastery, and words learned. Each fires
// once, ever — the first time it's crossed — and is then remembered in
// localStorage (MILESTONES_KEY) so it never repeats.
//
//   streak   night-to-morning streak reaches 3 / 7 / 30 days (NOT the daily
//            streak — that tracks something different)
//   mastery  a category is mastered once EVERY level in it has been
//            completed with a perfect score at least once. Tracked PER COURSE
//            (each card names its course): milestones at a course's 1st and
//            3rd categories mastered, and at the whole course — see
//            masteryThresholds()
//   words    distinct words, across every course, that have ever reached box
//            3+ of the spaced-repetition system (answered correctly on two
//            occasions in a row — retained, not merely seen once):
//            25 / 50 / 100 / 200
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
export const WORDS_MILESTONES = [25, 50, 100, 200];

// The mastery milestones for a course with `totalCategories` categories: the
// 1st, the 3rd, and the whole course, never past what the course has. So a
// 6-category course gets [1, 3, 6] and a 3-category one gets [1, 3] (its 3rd
// IS the whole course). Computed, so adding categories to a course later
// moves its top milestone without touching this file.
export function masteryThresholds(totalCategories) {
  return [...new Set([1, 3, totalCategories])].filter((t) => t >= 1 && t <= totalCategories).sort((a, b) => a - b);
}

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

// One course's own progress summary, from the same definitions the mastery
// milestone uses: a level is "completed" once it has ever been perfect, and a
// category is "mastered" once every one of its levels is completed.
export function getCourseProgress(course, sets) {
  const withLevels = course.categories.filter((category) => category.levels.length > 0);
  let levelsTotal = 0;
  let levelsCompleted = 0;
  withLevels.forEach((category) =>
    category.levels.forEach((level) => {
      levelsTotal += 1;
      if (isPerfectOnce(sets[level.id])) levelsCompleted += 1;
    })
  );
  return {
    categoriesTotal: withLevels.length,
    categoriesMastered: getMasteredCategories(withLevels, sets).length,
    levelsTotal,
    levelsCompleted,
  };
}

export function getStats(courses, now = new Date()) {
  const sets = getAllProgress();
  return {
    streak: getNightToMorningStreak(now),
    wordsLearned: getWordsLearnedCount(),
    // Mastery is per course: { course, mastered: [categories], total }.
    mastery: courses.map((course) => {
      const withLevels = course.categories.filter((category) => category.levels.length > 0);
      return { course, mastered: getMasteredCategories(withLevels, sets), total: withLevels.length };
    }),
  };
}

// --- once-only bookkeeping ---

// Mastery ids used to be "mastery-N", from when SAT Vocab was the only course.
// They still belong to it — mapped, not dropped, so someone who already saw
// "first category mastered" isn't shown it again after courses arrived.
const LEGACY_MASTERY_ID = /^mastery-(\d+)$/;

function readShown() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(MILESTONES_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((id) => (LEGACY_MASTERY_ID.test(id) ? id.replace(LEGACY_MASTERY_ID, "mastery-sat-vocab-$1") : id));
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
// threshold per kind (per course, for mastery) is returned — if someone jumps
// from nothing to 7 days (or 60 words) they get one celebration, not a stack
// of smaller ones — but every crossed threshold is marked shown so the lower
// ones never surface later. `courses` is the whole library (lib/wordbanks.js).
// Returns raw objects; pass each to describeMilestone().
export function checkNewMilestones(courses, now = new Date()) {
  const stats = getStats(courses, now);
  const shown = new Set(readShown());
  const totalWords = courses.reduce(
    (n, course) => n + course.categories.reduce((c, cat) => c + cat.levels.reduce((m, l) => m + l.words.length, 0), 0),
    0
  );
  const found = [];

  function consider(kind, idPrefix, thresholds, value, extra = {}) {
    const crossed = thresholds.filter((t) => value >= t && !shown.has(`${idPrefix}-${t}`));
    if (crossed.length === 0) return;
    crossed.forEach((t) => shown.add(`${idPrefix}-${t}`));
    const threshold = Math.max(...crossed);
    found.push({ id: `${idPrefix}-${threshold}`, kind, threshold, value, totalWords, ...extra });
  }

  consider("streak", "streak", STREAK_MILESTONES, stats.streak);
  stats.mastery.forEach(({ course, mastered, total }) => {
    consider("mastery", `mastery-${course.id}`, masteryThresholds(total), mastered.length, {
      course,
      totalCategories: total,
      // Only the very first mastery in a course can be named as "the" category.
      category: mastered.length === 1 ? mastered[0] : null,
    });
  });
  consider("words", "words", WORDS_MILESTONES, stats.wordsLearned);

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
  200: "Two hundred words.",
};

const COUNT_WORDS = { 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine" };
const countWord = (n) => COUNT_WORDS[n] || String(n);

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
    const { course } = m;
    const whole = m.threshold === m.totalCategories;
    const headline =
      m.threshold === 1
        ? m.category
          ? `${m.category.title} mastered.`
          : "First category mastered."
        : whole
        ? `Every ${course.title} category mastered.`
        : `${countWord(m.threshold)} categories mastered.`;
    const note =
      m.threshold === 1
        ? "Every level completed with a perfect score at least once."
        : whole
        ? `All ${m.totalCategories}, every level perfect at least once. That's all of ${course.title}.`
        : m.threshold * 2 === m.totalCategories
        ? "Half the course — every level in each, perfect at least once."
        : `${m.threshold} of ${m.totalCategories} — every level in each, perfect at least once.`;
    return {
      style: "mastery",
      // The share image draws `label` as its small heading, so the course is
      // named there; the in-app card (which labels itself "Milestone") names it
      // in `figure` instead. `unit` stays short: the image draws it on one line.
      label: `${course.title} mastery`,
      big: String(m.value),
      unit: `of ${m.totalCategories} categories mastered`,
      figure: `${m.value} of ${m.totalCategories} ${course.title} categories mastered`,
      headline,
      note,
      shareText: `${m.value} of ${m.totalCategories} ${course.title} categories mastered on Voco. ${DOMAIN}`,
      filename: `voco-${course.id}-categories-mastered-${m.value}.png`,
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
    shareText: `${m.threshold} vocabulary words learned on Voco. ${DOMAIN}`,
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
