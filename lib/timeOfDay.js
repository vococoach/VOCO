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

// The evening card. Either tonight's study is already done
// ({ kind: "done" } — something was finished since this evening began), or
// there's a suggested next level to study ({ kind: "suggest" }: the first
// unstudied unlocked level in course order, else the one studied longest ago).
export function getTonight(categories, sets, now, isLocked) {
  const eveningStart = localTime(now, now.getHours() >= EVENING_START_HOUR ? 0 : -1, EVENING_START_HOUR);
  const levels = unlockedLevels(categories, isLocked);

  let done = null;
  levels.forEach(({ category, level }) => {
    const record = sets[level.id];
    if (record && record.studiedTs && record.studiedTs >= eveningStart) {
      if (!done || record.studiedTs > done.key) done = { category, level, key: record.studiedTs };
    }
  });
  if (done) return { kind: "done", category: done.category, level: done.level };

  const unstudied = levels.find(({ level }) => !(sets[level.id] && sets[level.id].studiedAt));
  if (unstudied) return { kind: "suggest", ...unstudied };

  let oldest = null;
  levels.forEach(({ category, level }) => {
    const key = studiedSortKey(sets[level.id]);
    if (!oldest || key < oldest.key) oldest = { category, level, key };
  });
  return oldest ? { kind: "suggest", category: oldest.category, level: oldest.level } : null;
}
