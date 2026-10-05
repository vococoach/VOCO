// Checks for the free set and the subscription gate. Run with
// `npm run test:access` (after `npm run build` to also check the rendered Terms
// page). Plain Node, no browser, no Stripe: it tests the rules and the
// seeded-progress behavior. Route-level redirects and the live pages were
// verified in a real browser — see CLAUDE.md.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`);
};

// ---------- a fake browser storage the app's own modules can read ----------
const store = {};
globalThis.window = {
  localStorage: {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => (store[k] = String(v)),
    removeItem: (k) => delete store[k],
  },
};
const resetStore = () => Object.keys(store).forEach((k) => delete store[k]);

const wb = await import("../lib/wordbanks.js");
const purchase = await import("../lib/purchase.js");
const access = await import("../lib/access.js");
const progress = await import("../lib/progress.js");
const { getTonight, findLastNightsLevel } = await import("../lib/timeOfDay.js");
const { getPreviewSample } = await import("../lib/preview.js");
const { courses, categories } = wb;
const { isLevelLocked, isCategoryLocked, isFreeLevel, isPassageLocked, isGrammarCategoryLocked, FREE_CATEGORY_BY_COURSE } = purchase;

// ---------- the free set, exactly as decided ----------
const FREE_CATS = ["agreement-support", "precise-description", "meetings-negotiation", "positive-charge"];
ok("exactly the four free categories, one per course", JSON.stringify(Object.values(FREE_CATEGORY_BY_COURSE).sort()) === JSON.stringify([...FREE_CATS].sort()) && Object.keys(FREE_CATEGORY_BY_COURSE).length === courses.length);
let freeLevels = 0;
let lockedLevels = 0;
let wrong = [];
for (const course of courses) {
  for (const category of course.categories) {
    for (const level of category.levels) {
      const shouldBeFree = FREE_CATS.includes(category.id) && (level.level === 1 || level.level === 2);
      const locked = isLevelLocked(category.id, level.level, false);
      if (locked === shouldBeFree) wrong.push(level.id);
      if (locked) lockedLevels++;
      else freeLevels++;
      if (isLevelLocked(category.id, level.level, true)) wrong.push(`${level.id} (locked for a subscriber)`);
    }
  }
}
ok("every level: free iff a free category's Foundational/Intermediate; nothing locked for a subscriber", wrong.length === 0, wrong.join(", "));
ok("8 free levels (4 categories × 2 tiers)", freeLevels === 8, `${freeLevels}`);
ok("Advanced of a free category is locked", isLevelLocked("agreement-support", 3, false) && isLevelLocked("positive-charge", 3, false));
ok("SAT Expert (level 4) of the free category is locked", isLevelLocked("agreement-support", 4, false));
ok("Foundational and Intermediate of a free category are open", !isLevelLocked("meetings-negotiation", 1, false) && !isLevelLocked("meetings-negotiation", 2, false));
ok("a paid category's Foundational is locked", isLevelLocked("disagreement-refutation", 1, false) && isLevelLocked("emotional-nuance", 1, false));
ok("isCategoryLocked is only about whole categories", !isCategoryLocked("agreement-support", false) && isCategoryLocked("tone-attitude", false) && !isCategoryLocked("tone-attitude", true));
ok("isFreeLevel agrees with isLevelLocked", categories.every((c) => c.levels.every((l) => isFreeLevel(c.id, l.level) === !isLevelLocked(c.id, l.level, false))));
for (const course of courses) {
  for (const p of course.passages || []) ok(`passage ${p.id} locked for non-subscribers, open for subscribers`, isPassageLocked(p.id, false) && !isPassageLocked(p.id, true));
  for (const p of course.crossTextPairs || []) ok(`cross-text ${p.id} locked / open`, isPassageLocked(p.id, false) && !isPassageLocked(p.id, true));
  for (const g of course.grammar || []) ok(`grammar ${g.id} locked / open (Boundaries included)`, isGrammarCategoryLocked(g.id, false) && !isGrammarCategoryLocked(g.id, true));
}
ok("Boundaries and the Tide Pool passage are locked", isGrammarCategoryLocked("boundaries", false) && isPassageLocked("tide-pool-census", false));

// ---------- seeded progress: nothing locked is ever served ----------
const allWords = wb.getAllWordsFlat();
const idOf = (levelId, i = 0) => allWords.filter((w) => w.levelId === levelId)[i].id;
const today = progress.getAllProgress && new Date().toISOString().slice(0, 10);
function seed(records) {
  store.voco_word_srs_v1 = JSON.stringify(records);
}
const due = (id, box = 1) => ({ box, maxBox: box, timesSeen: 2, lastResult: "incorrect", nextReviewDate: "2020-01-01" });
resetStore();
const freeL1 = idOf("agreement-support-1");
const freeL2 = idOf("precise-description-2");
const freeAdv = idOf("agreement-support-3"); // free category, locked tier
const freeExpert = idOf("agreement-support-4"); // SAT Expert
const paidL1 = idOf("disagreement-refutation-1");
const paidAdv = idOf("emotional-nuance-3");
const greAdv = idOf("positive-charge-3");
const seeded = { [freeL1]: due(), [freeL2]: due(), [freeAdv]: due(), [freeExpert]: due(), [paidL1]: due(), [paidAdv]: due(), [greAdv]: due() };
seed(seeded);
const before = store.voco_word_srs_v1;
{
  const a = access.getAccessibleDueWordIds(false);
  ok("non-subscriber due list = only the free tiers' words", a.length === 2 && a.includes(freeL1) && a.includes(freeL2), a.join(","));
  ok("due words from a free category's locked tiers are excluded", !a.includes(freeAdv) && !a.includes(freeExpert) && !a.includes(greAdv));
  ok("due words from locked categories are excluded", !a.includes(paidL1) && !a.includes(paidAdv));
  const s = access.getAccessibleDueWordIds(true);
  ok("subscriber sees every due word (nothing was deleted)", s.length === 7);
  ok("filtering never touches the saved records", store.voco_word_srs_v1 === before);
  const sa = access.getAccessibleStruggleWordIds(false);
  ok("'still learning' ids exclude locked tiers for a non-subscriber", sa.length === 2 && !sa.includes(freeAdv));
  const counts = access.countByCategory(sa);
  ok("still-learning counts only cover free tiers", counts["agreement-support"] === 1 && counts["precise-description"] === 1 && !counts["emotional-nuance"] && !counts["disagreement-refutation"] && !counts["positive-charge"], JSON.stringify(counts));
  ok("an id that no longer exists in the word bank is never served", access.isWordIdLocked("nope-1::ghost", true) === true);
}
{
  // The cap is applied after the filter: locked words can't use up slots.
  const many = {};
  const lockedIds = allWords.filter((w) => w.categoryId === "tone-attitude").slice(0, 25).map((w) => w.id);
  lockedIds.forEach((id) => (many[id] = due()));
  const freeIds = allWords.filter((w) => w.levelId === "agreement-support-1").slice(0, 5).map((w) => w.id);
  freeIds.forEach((id) => (many[id] = due()));
  seed(many);
  const capped = access.getAccessibleDueWordIds(false).slice(0, progress.REVIEW_SESSION_CAP);
  ok("25 locked + 5 free due words => the session holds the 5 free ones, not 20 locked-then-dropped", capped.length === 5 && capped.every((id) => freeIds.includes(id)), `${capped.length}`);
  const missed = wb.getMissedWordsLevel("agreement-support", access.accessibleWordIds(progress.getStruggleWordIds(), false));
  ok("the Missed Words set for a free category holds only its free-tier words", missed.level.words.length === 5 && missed.level.words.every((w) => !w.srsId.includes("agreement-support-3") && !w.srsId.includes("agreement-support-4")));
  const missedAll = wb.getMissedWordsLevel("agreement-support", access.accessibleWordIds(progress.getStruggleWordIds(), true));
  ok("a subscriber's Missed Words set is unchanged", missedAll.level.words.length === 5);
  const dueStudy = wb.getDueForReviewLevel(access.accessibleWordIds(progress.getDueWordIds(), false));
  ok("the due-for-review study set holds only free words", dueStudy.level.words.length === 5);
}

// ---------- suggestions: tonight's study and last night's words ----------
const free = (categoryId, level) => isLevelLocked(categoryId, level.level, false);
const open = () => false;
const evening = new Date(2026, 9, 5, 21, 0, 0);
const longAgo = new Date(2026, 9, 1, 12, 0, 0).getTime();
const perfect = (ts = longAgo) => ({ studiedAt: "2026-10-01", studiedTs: ts, lastQuizAt: "2026-10-01", lastQuizTs: ts, lastScore: 5, lastQuizTotal: 5, perfectAt: "2026-10-01" });
const lockedIds = new Set(categories.flatMap((c) => c.levels.filter((l) => isLevelLocked(c.id, l.level, false)).map((l) => l.id)));
{
  const t = getTonight(courses, {}, evening, free);
  ok("a free learner with no history is asked to choose among all four courses", t && t.kind === "choose" && t.courses.length === 4);
  // Only the free tiers of the free categories get studied and perfected, one course at a time.
  const sets = {};
  const seen = [];
  let guard = 0;
  let t2;
  while ((t2 = getTonight(courses, sets, evening, free)) && guard++ < 30) {
    if (t2.kind === "choose") {
      // The learner picks a course and studies its first open level (the one moment the app doesn't guess).
      const pick = t2.courses[0].categories.flatMap((c) => c.levels.map((l) => ({ c, l }))).find(({ c, l }) => !isLevelLocked(c.id, l.level, false));
      seen.push(pick.l.id);
      sets[pick.l.id] = perfect(longAgo + guard);
      continue;
    }
    if (t2.kind !== "suggest") break;
    seen.push(t2.level.id);
    ok(`suggested ${t2.level.id} is not locked`, !lockedIds.has(t2.level.id));
    sets[t2.level.id] = perfect(longAgo + guard);
  }
  ok("a free learner is walked through exactly the 8 free levels, once each", seen.length === 8 && new Set(seen).size === 8 && seen.every((id) => !lockedIds.has(id)), seen.join(","));
  ok("…and then gets no suggestion at all (never a locked or already-mastered level)", getTonight(courses, sets, evening, free) === null);
  // Same sequence for a subscriber: every required level, never a duplicate, never an optional Expert level.
  const subSets = {};
  const subSeen = [];
  guard = 0;
  while ((t2 = getTonight(courses, subSets, evening, open)) && guard++ < 80) {
    if (t2.kind === "choose") {
      const pick = t2.courses[0].categories[0].levels[0];
      subSeen.push(pick.id);
      subSets[pick.id] = perfect(longAgo + guard);
      continue;
    }
    if (t2.kind !== "suggest") break;
    subSeen.push(t2.level.id);
    subSets[t2.level.id] = perfect(longAgo + guard);
  }
  const required = categories.flatMap((c) => c.levels.filter((l) => !l.optional).map((l) => l.id));
  ok("a subscriber is still walked through every required level exactly once", subSeen.length === required.length && new Set(subSeen).size === required.length, `${subSeen.length}/${required.length}`);
  ok("a subscriber is never nudged into an optional Expert level", subSeen.every((id) => !id.endsWith("-4")));
  // In-progress category whose remaining level is locked must not hide other suggestions.
  const half = { "agreement-support-1": perfect(), "agreement-support-2": perfect() };
  const t3 = getTonight(courses, half, evening, free);
  ok("a free category with only its locked Advanced tier left is skipped, not suggested, and does not block the rest", t3 && t3.kind === "suggest" && !lockedIds.has(t3.level.id) && t3.category.id !== "agreement-support", t3 && t3.level && t3.level.id);
}
{
  // Last night's words: a locked tier studied earlier is never featured.
  const now = new Date(2026, 9, 5, 8, 0, 0);
  const yesterday = new Date(2026, 9, 4, 21, 0, 0).getTime();
  const sets = { "agreement-support-3": { studiedAt: "2026-10-04", studiedTs: yesterday }, "agreement-support-2": { studiedAt: "2026-10-04", studiedTs: yesterday - 3600000 } };
  const f = findLastNightsLevel(categories, sets, now, free);
  ok("last night's words never features a locked tier (falls back to the open one studied)", f && f.level.id === "agreement-support-2", f && f.level.id);
  const f2 = findLastNightsLevel(categories, { "agreement-support-3": sets["agreement-support-3"] }, now, free);
  ok("…and features nothing when only a locked tier was studied", f2 === null);
  const f3 = findLastNightsLevel(categories, { "agreement-support-3": sets["agreement-support-3"] }, now, open);
  ok("a subscriber still gets it", f3 && f3.level.id === "agreement-support-3");
}

// ---------- every locked thing has a sample; free things don't; ids don't collide ----------
const ids = new Map();
const claim = (id, kind) => ids.set(id, [...(ids.get(id) || []), kind]);
categories.forEach((c) => {
  claim(c.id, "category");
  c.levels.forEach((l) => claim(l.id, "level"));
});
courses.forEach((course) => {
  (course.grammar || []).forEach((g) => claim(g.id, "grammar"));
  (course.passages || []).forEach((p) => claim(p.id, "passage"));
  (course.crossTextPairs || []).forEach((p) => claim(p.id, "pair"));
});
ok("preview ids (categories, levels, grammar, passages, pairs) are unique, so one route can serve them", [...ids.values()].every((v) => v.length === 1), [...ids].filter(([, v]) => v.length > 1).map(([k]) => k).join(","));
let missing = [];
let extra = [];
for (const c of categories) {
  if (isCategoryLocked(c.id, false)) {
    if (!getPreviewSample(c.id)) missing.push(c.id);
  } else {
    if (getPreviewSample(c.id)) extra.push(c.id);
    for (const l of c.levels) {
      const locked = isLevelLocked(c.id, l.level, false);
      const s = getPreviewSample(l.id);
      if (locked && !s) missing.push(l.id);
      if (!locked && s) extra.push(l.id);
    }
  }
}
for (const course of courses) {
  (course.grammar || []).forEach((g) => !getPreviewSample(g.id) && missing.push(g.id));
  (course.passages || []).forEach((p) => !getPreviewSample(p.id) && missing.push(p.id));
  (course.crossTextPairs || []).forEach((p) => !getPreviewSample(p.id) && missing.push(p.id));
}
ok("every locked category, tier, grammar category, passage and pair has a sample", missing.length === 0, missing.join(", "));
ok("nothing free has a sample (a free item is just free)", extra.length === 0, extra.join(", "));
ok("an unknown id has no sample", getPreviewSample("not-a-thing") === null);
{
  const s = getPreviewSample("agreement-support-3");
  ok("a locked tier's sample is that tier's own first question", s && s.title.includes("Advanced") && s.options.length === 4);
  const g = getPreviewSample("rhetorical-synthesis");
  ok("Rhetorical Synthesis sample carries its notes and goal", g && g.notes && g.notes.length > 0 && g.goal);
}

// ---------- the pages: gating is wired at the route level ----------
const read = (f) => readFileSync(path.join(root, f), "utf8");
const study = read("app/sets/[setId]/study/page.js");
const quiz = read("app/sets/[setId]/quiz/page.js");
for (const [name, src] of [["study", study], ["quiz", quiz]]) {
  ok(`${name} route gates by tier (isLevelLocked)`, /isLevelLocked\(realLevel\.category\.id, realLevel\.level\.level, subscribed\)/.test(src));
  ok(`${name} route redirects a locked level to /unlock`, /router\.replace\("\/unlock"\)/.test(src));
  ok(`${name} route renders nothing until the subscription is known and the level is unlocked`, /if \(subscribed === null \|\| locked\) \{\s*return null;/.test(src));
  ok(`${name} route filters missed-words through lib/access`, /accessibleWordIds\(struggleIds, subscribed\)/.test(src));
}
ok("due-for-review study filters before capping", /accessibleWordIds\(allDueIds, subscribed\)\.slice\(0, REVIEW_SESSION_CAP\)/.test(study));
const review = read("app/review/page.js");
ok("review draws only from getAccessibleDueWordIds and waits for the subscription state", /getAccessibleDueWordIds\(subscribed\)/.test(review) && /if \(!known\) return;/.test(review) && !/getDueWordIds\(\)/.test(review));
const rawReaders = [];
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git"].includes(name)) continue;
    const full = path.join(dir, name);
    statSync(full).isDirectory() ? walk(full, out) : /\.(js|mjs)$/.test(name) && out.push(full);
  }
  return out;
}
for (const f of ["app", "components"].flatMap((d) => walk(path.join(root, d)))) {
  const src = readFileSync(f, "utf8");
  if (/\bgetDueWordIds\(|\bgetStruggleWordIds\(/.test(src)) rawReaders.push(path.relative(root, f));
}
ok("only the pages that keep the raw saved list filter it in render (home, course, study, quiz)", rawReaders.every((f) => ["app/page.js", "app/courses/[courseId]/page.js", "app/sets/[setId]/study/page.js", "app/sets/[setId]/quiz/page.js"].includes(f)), rawReaders.join(", "));
for (const f of ["app/page.js", "app/courses/[courseId]/page.js"]) ok(`${f} filters raw lists with accessibleWordIds`, /accessibleWordIds\(/.test(read(f)));
ok("strategy guides stay ungated", !/purchase/.test(read("app/strategy/[guideId]/page.js")));
ok("practice test is gated", /isSubscribedCached|useSubscription/.test(read("app/practice-test/page.js")) && /\/unlock/.test(read("app/practice-test/page.js")));
for (const f of ["app/passages/[passageId]/page.js", "app/cross-text/[pairId]/page.js", "app/grammar/[levelId]/page.js"]) ok(`${f} redirects the locked to /unlock`, /router\.replace\("\/unlock"\)/.test(read(f)));

// ---------- the copy: computed, not hardcoded ----------
const unlock = read("app/unlock/page.js");
ok("/unlock computes its counts and names (no hardcoded numbers in the pitch)", /lockedWordCount/.test(unlock) && /freeTierLabels/.test(unlock) && !/\b\d+ (words|categories|questions|passages)\b/.test(unlock));
ok("the sample-question prompt uses the existing 'full access to every course' wording", /for full access to every course/.test(read("app/preview/[categoryId]/page.js")));

// ---------- Terms and Privacy ----------
const termsHtmlPath = path.join(root, ".next/server/app/terms.html");
const privacyHtmlPath = path.join(root, ".next/server/app/privacy.html");
if (existsSync(termsHtmlPath) && existsSync(privacyHtmlPath)) {
  const strip = (h) => h.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");
  const terms = strip(readFileSync(termsHtmlPath, "utf8"));
  const privacy = strip(readFileSync(privacyHtmlPath, "utf8"));
  for (const id of FREE_CATS) {
    const cat = categories.find((c) => c.id === id);
    ok(`Terms names the free category ${cat.title}`, terms.includes(cat.title));
  }
  ok("Terms says only Foundational and Intermediate are free", /only the Foundational and Intermediate levels are free/.test(terms));
  ok("Terms names the locked tiers of the free categories", /the Advanced and Expert levels of those free categories/.test(terms));
  for (const g of courses.flatMap((c) => c.grammar || [])) ok(`Terms lists the paid grammar category ${g.title}`, terms.includes(g.title));
  ok("Terms no longer calls Boundaries or the Tide Pool passage free", !/Boundaries[^.]*free/.test(terms) && !/first reading passage[^.]*free/.test(terms));
  ok("Terms states price, trial, auto-conversion and monthly renewal until cancelled", terms.includes("$1.99/month") && terms.includes("7-day free trial") && /automatically becomes a paid subscription/.test(terms) && /renews every month/.test(terms) && /until you cancel/.test(terms));
  ok("Terms says canceling before the trial ends means no charge", /cancel before it ends you won't be charged/.test(terms));
  ok("Terms explains the in-app Manage subscription route", /Manage subscription/.test(terms));
  ok("Terms has age / parental-permission language", /18 or older, or have the permission of a parent or guardian/.test(terms));
  ok("Terms and Privacy are dated October 5, 2026", terms.includes("Last updated October 5, 2026") && privacy.includes("Last updated October 5, 2026"));
  ok("Privacy discloses Vercel Web Analytics and no cookies", /Vercel Web Analytics/.test(privacy) && /doesn't use cookies/.test(privacy));
  ok("Privacy no longer says there are no analytics", !/doesn't run analytics|doesn't use tracking cookies, analytics scripts/.test(privacy));
} else {
  console.log("SKIP Terms/Privacy rendered-text checks — run `npm run build` first to produce .next/server/app/terms.html");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
