// Time-of-day framing for the home screen, driven by the device's LOCAL
// clock. This only ever changes what the home screen suggests — it never
// locks or hides anything (the quiz stays available at any hour, on purpose;
// see CLAUDE.md). The rhythm it nudges toward is the app's premise: study
// before sleep, quiz after waking.
//
//   morning  05:00–11:59  bring back last night's words, if there are any
//   midday   12:00–17:59  the ordinary neutral view
//   evening  18:00–04:59  frame the screen around tonight's study
//                         (after midnight is still "tonight" to a learner)

import { isPerfectOnce, requiredLevels } from "./milestones";

export const MORNING_START_HOUR = 5;
export const MIDDAY_START_HOUR = 12;
export const EVENING_START_HOUR = 18;

const DAY_MS = 86400000;

export function getPhase(now) {
  const hour = now.getHours();
  if (hour >= MORNING_START_HOUR && hour < MIDDAY_START_HOUR) return "morning";
  if (hour >= MIDDAY_START_HOUR && hour < EVENING_START_HOUR) return "midday";
  return "evening";
}

export function localDateStr(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// Epoch ms of `hour`:00 local time, `dayOffset` days from `now`'s local day.
function localTime(now, dayOffset, hour) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour).getTime();
}

// "Studied last night or today" — a local-calendar match on today/yesterday
// (studying at 1am counts as today; studying at 9pm counts as yesterday).
function studiedTodayOrYesterday(record, now) {
  const today = localDateStr(now);
  const yesterday = localDateStr(new Date(localTime(now, -1, 0)));
  if (record.studiedTs) {
    const studiedDay = localDateStr(new Date(record.studiedTs));
    return studiedDay === today || studiedDay === yesterday;
  }
  // Record from before timestamps existed: only a UTC date string. Accept a
  // match on either the local or the UTC reading of today/yesterday.
  const utcToday = now.toISOString().slice(0, 10);
  const utcYesterday = new Date(now.getTime() - DAY_MS).toISOString().slice(0, 10);
  return [today, yesterday, utcToday, utcYesterday].includes(record.studiedAt);
}

function studiedSortKey(record) {
  return record.studiedTs || Date.parse(record.studiedAt) || 0;
}

function unlockedLevels(categories, isLocked) {
  const out = [];
  categories.forEach((category) => {
    if (isLocked(category.id)) return;
    category.levels.forEach((level) => out.push({ category, level }));
  });
  return out;
}

// The level to feature at the top of the home screen in the morning: one
// studied last night (or earlier today, i.e. after midnight) that hasn't
// already been quizzed since the morning began — the point is to prompt the
// post-sleep quiz, so once it's done the prompt goes away. Most recently
// studied wins. Locked categories are never featured (a lapsed subscription
// would just bounce them to /unlock). Returns { category, level } or null.
export function findLastNightsLevel(categories, sets, now, isLocked) {
  const morningStart = localTime(now, 0, MORNING_START_HOUR);
  let best = null;
  unlockedLevels(categories, isLocked).forEach(({ category, level }) => {
    const record = sets[level.id];
    if (!record || !record.studiedAt || !studiedTodayOrYesterday(record, now)) return;
    if (record.lastQuizTs && record.lastQuizTs >= morningStart) return;
    const key = studiedSortKey(record);
    if (!best || key > best.key) best = { category, level, key };
  });
  return best && { category: best.category, level: best.level };
}

// The last time any level in `course` was studied (epoch ms), or null if the
// course hasn't been started — "started" means a level has been studied, since
// tonight's study is about studying, not quizzing.
function courseLastStudied(course, sets) {
  let best = null;
  course.categories.forEach((category) =>
    category.levels.forEach((level) => {
      const record = sets[level.id];
      if (!record || !record.studiedAt) return;
      const key = studiedSortKey(record);
      if (best === null || key > best) best = key;
    })
  );
  return best;
}

// The evening card. `courses` is the whole library (lib/wordbanks.js), spanning
// all courses equally — this never favors SAT Vocab or any other course by
// position. One of:
//   { kind: "done" }     something was finished since this evening began —
//                        studying an optional extra (the SAT Expert tier)
//                        still counts, even though it's never itself a
//                        suggestion (see below)
//   { kind: "suggest" }  a specific level to study next (never one that's
//                        already been perfectly quizzed once — see "mastered"
//                        below), chosen by the two-priority rule under it
//   { kind: "choose" }   nothing has EVER been studied anywhere yet — there is
//                        deliberately NO default course; `courses` lists every
//                        course for the learner to pick from. This is the one
//                        moment the app refuses to guess. It does not recur
//                        once anything anywhere has been studied, even if
//                        every started course later gets fully mastered — see
//                        priority 2 below, which takes over from then on.
//   null                  every required level in every unlocked category has
//                        already been perfectly quizzed at least once — there
//                        is nothing left to suggest that isn't already
//                        mastered (see "Never re-suggest..." below).
//
// Two priorities, in order (CLAUDE.md "Smarter study suggestions" has the
// full reasoning):
//   1. FINISH WHAT'S IN PROGRESS. A category with some (not all) required
//      levels already perfected is "in progress." If any exist, across ANY
//      course, the most RECENTLY touched one wins — so momentum on what the
//      learner just started isn't interrupted by jumping to something new —
//      and the suggestion is its first not-yet-perfected level, in level
//      order (Foundational before Intermediate before Advanced).
//   2. ONLY IF NOTHING IS IN PROGRESS, start something fresh — a category with
//      NO required level ever studied. The LEAST recently touched COURSE
//      wins (a course never touched at all outranks one touched at any point),
//      so a learner isn't kept grinding a single course category after
//      category while the other three sit untouched; within that course, its
//      first fresh category in category order.
// Never re-suggest a level that's already been perfected once (`isPerfectOnce`,
// lib/milestones.js — the same "completed" the course-progress summary and
// mastery milestones use): there's nothing left to gain from it, so once
// everything reachable is mastered, there is genuinely nothing to suggest —
// see the `null` case above, not a "revisit the oldest" fallback like before.
export function getTonight(courses, sets, now, isLocked) {
  const eveningStart = localTime(now, now.getHours() >= EVENING_START_HOUR ? 0 : -1, EVENING_START_HOUR);

  // Per course: every unlocked level (optional extras included — studying one
  // still marks tonight's study "done"), and per-category required-level
  // stats (optional extras excluded — they never affect what's suggested,
  // same as before). `touchedAt` is the last time a course was engaged at
  // all, extras included, so an SAT Expert-tier session still keeps that
  // course from looking neglected for priority 2's rotation.
  const perCourse = courses.map((course) => {
    const allLevels = unlockedLevels(course.categories, isLocked);
    const categories = course.categories
      .filter((category) => !isLocked(category.id))
      .map((category) => {
        const levels = requiredLevels(category);
        const masteredCount = levels.filter((level) => isPerfectOnce(sets[level.id])).length;
        const anyStudied = levels.some((level) => sets[level.id] && sets[level.id].studiedAt);
        const touchedAt = levels.reduce((best, level) => Math.max(best, sets[level.id] ? studiedSortKey(sets[level.id]) : 0), 0);
        return { category, levels, masteredCount, total: levels.length, anyStudied, touchedAt };
      })
      .filter((c) => c.total > 0);
    return { course, allLevels, categories, touchedAt: courseLastStudied(course, sets) || 0 };
  });

  // 1. Done tonight already? (unchanged: activity-based, mastery-independent)
  let done = null;
  perCourse.forEach((p) =>
    p.allLevels.forEach(({ category, level }) => {
      const record = sets[level.id];
      if (record && record.studiedTs && record.studiedTs >= eveningStart) {
        if (!done || record.studiedTs > done.key) done = { category, level, key: record.studiedTs };
      }
    })
  );
  if (done) return { kind: "done", category: done.category, level: done.level };

  const firstUnmastered = (levels) => levels.find((level) => !isPerfectOnce(sets[level.id])) || null;
  const allCategories = perCourse.flatMap((p) => p.categories.map((c) => ({ ...c, courseTouchedAt: p.touchedAt })));

  // 2. Priority 1 — an in-progress category exists: continue the most
  // recently touched one (momentum).
  const inProgress = allCategories
    .filter((c) => c.anyStudied && c.masteredCount < c.total)
    .sort((a, b) => b.touchedAt - a.touchedAt);
  if (inProgress.length > 0) {
    const level = firstUnmastered(inProgress[0].levels);
    if (level) return { kind: "suggest", category: inProgress[0].category, level };
  }

  // 3. Nothing in progress. If NOTHING has ever been studied anywhere, let
  // the learner choose — the one moment the app doesn't guess.
  const everStudiedAnywhere = perCourse.some((p) => p.categories.some((c) => c.anyStudied));
  if (!everStudiedAnywhere) {
    const withContent = perCourse.filter((p) => p.categories.length > 0).map((p) => p.course);
    if (withContent.length > 0) return { kind: "choose", courses: withContent };
  }

  // 4. Priority 2 — start a fresh category: the least recently touched
  // course wins (rotation), then its first fresh category in course order.
  const fresh = allCategories
    .filter((c) => !c.anyStudied && c.masteredCount === 0)
    .sort((a, b) => a.courseTouchedAt - b.courseTouchedAt);
  if (fresh.length > 0) {
    const level = firstUnmastered(fresh[0].levels);
    if (level) return { kind: "suggest", category: fresh[0].category, level };
  }

  // 5. Every required level everywhere has already been perfected once —
  // nothing left to suggest that wouldn't be a re-suggestion of mastered
  // content.
  return null;
}
