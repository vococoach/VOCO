// `npm run test:practice` — the practice-test selection and scoring logic:
// exactly 54 questions, an exact 27/27 module split, a passage's questions never
// split across modules, no duplicate question in one test, and repeats only
// once the fresh pool is used up. Rewritten as a committed script because the
// scratchpad version CLAUDE.md used to cite was never saved.
import { courses } from "../lib/wordbanks.js";
import { buildPracticeTest, scorePracticeTest, TOTAL_QUESTIONS, MODULE_QUESTION_COUNT } from "../lib/practiceTest.js";

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  if (!cond) console.log(`FAIL ${name}${extra ? "  — " + extra : ""}`);
};

const sat = courses.find((c) => c.id === "sat-vocab");
const SEEDS = Array.from({ length: 150 }, (_, i) => i + 1);

let allGood = { total: true, split: true, dup: true, whole: true, shape: true };
for (const seed of SEEDS) {
  const t = buildPracticeTest(sat, new Set(), seed);
  if (t.questions.length !== TOTAL_QUESTIONS) allGood.total = false;
  if (t.modules[0].length !== MODULE_QUESTION_COUNT || t.modules[1].length !== MODULE_QUESTION_COUNT) allGood.split = false;
  const ids = t.questions.map((q) => q.id);
  if (new Set(ids).size !== ids.length) allGood.dup = false;
  // a passage's questions share a passage text: they must land in one module
  const moduleOf = new Map();
  t.modules.forEach((m, mi) =>
    m.forEach((q) => {
      const key = q.passageId || q.pairId;
      if (key) {
        if (moduleOf.has(key) && moduleOf.get(key) !== mi) allGood.whole = false;
        moduleOf.set(key, mi);
      }
    })
  );
  if (t.questions.some((q) => !Array.isArray(q.options) || q.options.length !== 4 || !(q.correctIndex >= 0 && q.correctIndex <= 3))) allGood.shape = false;
}
ok(`every one of ${SEEDS.length} seeds gives exactly ${TOTAL_QUESTIONS} questions`, allGood.total);
ok("every seed splits exactly 27/27", allGood.split);
ok("no question appears twice in one test", allGood.dup);
ok("a passage's questions are never split across modules", allGood.whole);
ok("every question has 4 options and a valid correctIndex", allGood.shape);

// fresh-first: with nothing used there is no reuse; excluding a whole first test's ids prefers new questions
const first = buildPracticeTest(sat, new Set(), 7);
ok("a first test reuses nothing", Object.values(first.reusedCounts).every((n) => n === 0));
const second = buildPracticeTest(sat, new Set(first.questions.map((q) => q.id)), 8);
const overlap = second.questions.filter((q) => first.questions.some((f) => f.id === q.id)).length;
ok("a second test avoids the first test's questions while the pool allows", overlap === 0, `overlap ${overlap}`);
// exhaustion: mark everything used; it still builds a full test and says it reused
const every = new Set(buildPracticeTest(sat, new Set(), 1).questions.map((q) => q.id));
for (let s = 2; s < 60; s++) buildPracticeTest(sat, new Set(), s).questions.forEach((q) => every.add(q.id));
const exhausted = buildPracticeTest(sat, every, 3);
ok("with the pool exhausted it still builds a full 54", exhausted.questions.length === TOTAL_QUESTIONS);
ok("and reports the reuse", Object.values(exhausted.reusedCounts).reduce((a, b) => a + b, 0) > 0);

// scoring
const t = buildPracticeTest(sat, new Set(), 11);
const allRight = Object.fromEntries(t.questions.map((q) => [q.id, q.correctIndex]));
const r1 = scorePracticeTest(t.questions, allRight);
ok("all correct scores 54/54", r1.correct === TOTAL_QUESTIONS && r1.total === TOTAL_QUESTIONS, JSON.stringify({ c: r1.correct, t: r1.total }));
const r0 = scorePracticeTest(t.questions, {});
ok("all blank scores 0 without crashing", r0.correct === 0 && r0.total === TOTAL_QUESTIONS);
const wrong = Object.fromEntries(t.questions.map((q) => [q.id, (q.correctIndex + 1) % 4]));
ok("all wrong scores 0", scorePracticeTest(t.questions, wrong).correct === 0);

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
