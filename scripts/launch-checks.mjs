// What must be true for ONE choice of live courses. Not run on its own by `npm test`:
// scripts/test-launch.mjs starts it once per scenario (hidden courses switched on one at a
// time, and all together), each time with VOCO_TEST_LIVE_COURSES naming the courses to treat
// as live (the loader swaps the one switch in lib/liveCourses.js for that list, in this
// process only; see scripts/loader-hooks.mjs). It checks the data and the wording helpers
// the screens are built from: the lists, the lookups, the word pools, the first screen's
// course line, the "every course" wording. The pages themselves are checked on a real build
// in scripts/test-launch.mjs.
//
// Prints PASS/FAIL lines and a "N passed, M failed" summary; exits 1 on any failure.

const live = (process.env.VOCO_TEST_LIVE_COURSES || "").split(",").map((id) => id.trim()).filter(Boolean);
if (live.length === 0) {
  console.log("FAIL launch-checks needs VOCO_TEST_LIVE_COURSES (a comma list of course ids)");
  process.exit(1);
}
const label = live.join(" + ");

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"} [${label}] ${name}${extra ? "  — " + extra : ""}`);
};

// A fake browser storage the app's own modules can read.
const store = {};
globalThis.window = {
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => (store[k] = String(v)),
    removeItem: (k) => delete store[k],
  },
};

const wb = await import("../lib/wordbanks.js");
const purchase = await import("../lib/purchase.js");
const access = await import("../lib/access.js");
const { getTonight } = await import("../lib/timeOfDay.js");
const { getPreviewSample } = await import("../lib/preview.js");
const { getCourseStrip } = await import("../lib/firstVisit.js");
const { courseScope } = await import("../lib/courseScope.js");
const { LIVE_COURSES } = await import("../lib/liveCourses.js");

const { allCourses, courses, categories } = wb;
const isLive = (course) => live.includes(course.id);
const liveCourses = allCourses.filter(isLive);
const hiddenCourses = allCourses.filter((course) => !isLive(course));
const levelsOf = (course) => course.categories.flatMap((c) => c.levels);

ok("the switch the loader gave this process is the one in use", JSON.stringify(LIVE_COURSES) === JSON.stringify(live), JSON.stringify(LIVE_COURSES));
ok("the live courses are exactly the ones named, in the repo's order", JSON.stringify(courses.map((c) => c.id)) === JSON.stringify(liveCourses.map((c) => c.id)), courses.map((c) => c.id).join(","));
ok("nothing was removed from the library (every course is still there)", allCourses.length === 4 && wb.allCategories.length === 15);

// ---------- a live course is everywhere ----------
for (const course of liveCourses) {
  const t = course.title;
  ok(`${t}: getCourse finds it`, wb.getCourse(course.id) === course);
  ok(`${t}: its categories are in the app's list`, course.categories.every((c) => categories.includes(c)));
  ok(`${t}: every level is found, and belongs to it`, levelsOf(course).every((l) => { const f = wb.findLevel(l.id); return f && f.course.id === course.id; }));
  ok(`${t}: every category knows its course`, course.categories.every((c) => wb.getCategoryCourse(c.id) === course));
  const words = wb.getAllWordsFlat().filter((w) => w.courseId === course.id).length;
  ok(`${t}: all its words are in the review pool`, words === levelsOf(course).reduce((n, l) => n + l.words.length, 0) && words > 0, `${words}`);
  ok(`${t}: none of its ids is treated as hidden`, !wb.belongsToHiddenCourse(course.id) && course.categories.every((c) => !wb.belongsToHiddenCourse(c.id) && !wb.belongsToHiddenCourse(wb.missedWordsId(c.id)) && c.levels.every((l) => !wb.belongsToHiddenCourse(l.id))));
  ok(`${t}: its "still learning" sets are recognised`, course.categories.every((c) => wb.missedWordsCategoryId(wb.missedWordsId(c.id)) === c.id));
  const free = course.categories.find((c) => c.id === purchase.FREE_CATEGORY_BY_COURSE[course.id]);
  const tier3 = free.levels.find((l) => l.level === 3);
  ok(`${t}: a locked tier of its free category has a sample question`, Boolean(getPreviewSample(tier3.id)) && getPreviewSample(tier3.id).course === course);
  const locked = course.categories.find((c) => purchase.isCategoryLocked(c.id, false));
  ok(`${t}: a locked category has a sample question`, Boolean(getPreviewSample(locked.id)));
}

// ---------- a hidden course is nowhere ----------
for (const course of hiddenCourses) {
  const t = course.title;
  ok(`${t}: getCourse does not find it`, wb.getCourse(course.id) === null);
  ok(`${t}: none of its categories is in the app's list`, course.categories.every((c) => !categories.includes(c)));
  ok(`${t}: no level is found, no category has a course`, levelsOf(course).every((l) => wb.findLevel(l.id) === null) && course.categories.every((c) => wb.getCategoryCourse(c.id) === null && wb.getSetCategoryId(c.id) === null));
  ok(`${t}: none of its words is in the review pool`, wb.getAllWordsFlat().every((w) => w.courseId !== course.id));
  ok(`${t}: its course, categories, levels and still-learning sets are all recognised as hidden`, wb.belongsToHiddenCourse(course.id) && course.categories.every((c) => wb.belongsToHiddenCourse(c.id) && wb.belongsToHiddenCourse(wb.missedWordsId(c.id)) && c.levels.every((l) => wb.belongsToHiddenCourse(l.id))));
  ok(`${t}: its "still learning" sets are not recognised as real sets`, course.categories.every((c) => wb.missedWordsCategoryId(wb.missedWordsId(c.id)) === null && wb.getSetCategoryId(wb.missedWordsId(c.id)) === null));
  ok(`${t}: it has no sample questions`, course.categories.every((c) => getPreviewSample(c.id) === null && c.levels.every((l) => getPreviewSample(l.id) === null)));
}

// ---------- the wording follows the live count ----------
{
  const scope = courseScope();
  const many = live.length > 1;
  ok("the scope wording knows whether there is more than one course", scope.many === many);
  ok(
    many ? "several courses live: it says \"every course\"" : `one course live: it names ${liveCourses[0].title}`,
    many
      ? scope.access === "every course" && scope.all === "every course" && scope.subject === "Every course"
      : scope.access === liveCourses[0].title && scope.all === `all of ${liveCourses[0].title}` && scope.subject === liveCourses[0].title
  );
  const strip = getCourseStrip();
  if (many) {
    const counts = ["Zero", "One", "Two", "Three", "Four", "Five"];
    ok("the first screen names the live courses, counted", strip && strip.text === `${counts[live.length]} courses: ${liveCourses.map((c) => c.title.split(" ")[0]).join(" · ")}`, strip && strip.text);
  } else {
    ok("the first screen has no course line while one course is live", strip === null);
  }
}

// ---------- word pools: hidden words are never served, live ones come back; saved records are never touched ----------
{
  const wordIdOf = (level, i = 0) => wb.wordId(level.id, level.words[i].word);
  const due = () => ({ box: 1, maxBox: 1, timesSeen: 2, lastResult: "incorrect", nextReviewDate: "2020-01-01" });
  const records = {};
  const expect = { freeOpen: [], lockedTier: [], hidden: [] };
  for (const course of allCourses) {
    const free = course.categories.find((c) => c.id === purchase.FREE_CATEGORY_BY_COURSE[course.id]);
    const open = wordIdOf(free.levels.find((l) => l.level === 1));
    const tier = wordIdOf(free.levels.find((l) => l.level === 3));
    records[open] = due();
    records[tier] = due();
    (isLive(course) ? expect.freeOpen : expect.hidden).push(open);
    (isLive(course) ? expect.lockedTier : expect.hidden).push(tier);
  }
  store.voco_word_srs_v1 = JSON.stringify(records);
  const before = store.voco_word_srs_v1;
  const free = access.getAccessibleDueWordIds(false);
  const sub = access.getAccessibleDueWordIds(true);
  ok("a free learner is served the free-tier words of every live course, and nothing from a hidden one", free.length === expect.freeOpen.length && expect.freeOpen.every((id) => free.includes(id)) && expect.hidden.every((id) => !free.includes(id)), `${free.length}`);
  ok("a subscriber is served every word of every live course, and still nothing from a hidden one", sub.length === expect.freeOpen.length + expect.lockedTier.length && expect.hidden.every((id) => !sub.includes(id)), `${sub.length}`);
  const counts = access.countByCategory(sub);
  ok("the 'still learning' counts only cover live categories", Object.keys(counts).every((id) => categories.some((c) => c.id === id)) && hiddenCourses.every((course) => course.categories.every((c) => !counts[c.id])));
  ok("a hidden course's saved records are left exactly as they were (they come back with the course)", store.voco_word_srs_v1 === before);
  const dueStudy = wb.getDueForReviewLevel(access.accessibleWordIds(Object.keys(records), true));
  ok("the due-for-review study set holds live words only", dueStudy.level.words.length === expect.freeOpen.length + expect.lockedTier.length);
}

// ---------- tonight's study chooses among the live courses only ----------
{
  const evening = new Date(2026, 9, 5, 21, 0, 0);
  const t = getTonight(courses, {}, evening, (categoryId, level) => purchase.isLevelLocked(categoryId, level.level, false));
  ok("a new learner's 'tonight' offers exactly the live courses", t && t.kind === "choose" && JSON.stringify(t.courses.map((c) => c.id)) === JSON.stringify(live.filter((id) => allCourses.some((c) => c.id === id))), t && t.courses && t.courses.map((c) => c.id).join(","));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
