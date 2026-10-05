// Checks for the first-visit screen and the removal of the old onboarding.
// Run with `npm run test:first-visit`. Plain Node, no browser: it tests the
// data and the logic. The visual side (fits 375×667, palette at each hour,
// no flash) was verified in a real browser — see CLAUDE.md.

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

const { getFirstVisitQuestion, FIRST_VISIT_LEVEL_ID, FIRST_VISIT_OPTION_ORDER } = await import("../lib/firstVisit.js");
const { isReturningVisitor, clearLegacyFlags, RETURNING_KEYS } = await import("../lib/visitor.js");
const { PRE_HYDRATION_SCRIPT } = await import("../lib/preHydration.js");
const { SLEEP_SCIENCE, SCIENCE_FACTS } = await import("../lib/sleepScience.js");
const { THEME_CSS, NIGHT, DAWN } = await import("../lib/timeTheme.js");
const { TRIAL_TERMS, FREE_CATEGORY_IDS } = await import("../lib/purchase.js");
const { findLevel } = await import("../lib/wordbanks.js");

// ---------- the question ----------
{
  const q = getFirstVisitQuestion();
  ok("first-visit question exists", Boolean(q && q.word && q.quiz));
  ok("it is from a free category", FREE_CATEGORY_IDS.includes(q.category.id));
  const found = findLevel(FIRST_VISIT_LEVEL_ID);
  ok("it is from a free category's level", FREE_CATEGORY_IDS.includes(found.category.id));
  ok("it is a word of that level", found.level.words.some((w) => w.word === q.word.word));
  ok("exactly one blank in the sentence", (q.quiz.sentence.match(/______/g) || []).length === 1);
  ok("four distinct options", new Set(q.quiz.options).size === 4 && q.quiz.options.length === 4);
  ok("display order is a permutation of the four options", [...FIRST_VISIT_OPTION_ORDER].sort().join() === "0,1,2,3");
  ok("correct answer is not in the first on-screen slot", FIRST_VISIT_OPTION_ORDER[0] !== q.quiz.correctIndex);
  ok("short enough for a 375px screen (sentence ≤ 110 chars)", q.quiz.sentence.length <= 110, `${q.quiz.sentence.length}`);
  ok("explanation fits (≤ 170 chars)", q.quiz.explanation.length <= 170, `${q.quiz.explanation.length}`);
  ok("single-word options (fit the 2×2 grid)", q.quiz.options.every((o) => !/\s/.test(o) && o.length <= 12));
  const art = /\b(a|an)\s+______/i.test(q.quiz.sentence);
  ok("no a/an giveaway before the blank", !art);
}

// ---------- visitor detection (fake localStorage) ----------
function withStorage(store, fn, { blocked = false } = {}) {
  const local = {
    getItem: (k) => {
      if (blocked) throw new Error("blocked");
      return k in store ? store[k] : null;
    },
    removeItem: (k) => delete store[k],
  };
  const session = { removeItem: () => {} };
  globalThis.window = { localStorage: local, sessionStorage: session };
  try {
    return fn();
  } finally {
    delete globalThis.window;
  }
}
ok("empty device is a first-time visitor", withStorage({}, isReturningVisitor) === false);
for (const key of RETURNING_KEYS) {
  ok(`saved ${key} => returning`, withStorage({ [key]: '{"a":1}' }, isReturningVisitor) === true);
}
ok("empty-object progress counts as nothing", withStorage({ voco_progress_v1: "{}" }, isReturningVisitor) === false);
ok("blocked storage => first-time (never throws)", withStorage({}, isReturningVisitor, { blocked: true }) === false);
ok("the old onboarding flag alone does not make a returning visitor", withStorage({ voco_onboarded_v1: "1" }, isReturningVisitor) === false);
ok("returning keys cover everything resetProgress() clears", ["voco_progress_v1", "voco_word_srs_v1", "voco_passages_v1", "voco_grammar_v1", "voco_practice_tests_v1", "voco_customer_id_v1"].every((k) => RETURNING_KEYS.includes(k)));
{
  const store = { voco_onboarded_v1: "1", voco_progress_v1: '{"x":1}' };
  withStorage(store, clearLegacyFlags);
  ok("clearLegacyFlags removes the old flag and nothing else", !("voco_onboarded_v1" in store) && "voco_progress_v1" in store);
  ok("clearLegacyFlags is safe to repeat and with blocked storage", (() => { try { withStorage({}, clearLegacyFlags, { blocked: true }); withStorage(store, clearLegacyFlags); return true; } catch (e) { return false; } })());
}

// ---------- the pre-paint script agrees with the rule above ----------
function runPre(hour, store, { blocked = false } = {}) {
  const attrs = {};
  const document = { documentElement: { setAttribute: (k, v) => (attrs[k] = v) } };
  const window = { localStorage: { getItem: (k) => { if (blocked) throw new Error("x"); return k in store ? store[k] : null; } } };
  const FakeDate = function () { this.getHours = () => hour; };
  new Function("document", "window", "Date", PRE_HYDRATION_SCRIPT)(document, window, FakeDate);
  return attrs;
}
for (let h = 0; h < 24; h++) {
  const morning = h >= 5 && h < 12;
  ok(`pre-paint script, ${String(h).padStart(2, "0")}:00 => ${morning ? "dawn" : "night"}`, (runPre(h, {})["data-phase"] === "morning") === morning);
}
ok("pre-paint script marks a returning device", runPre(9, { voco_word_srs_v1: '{"a":1}' })["data-returning"] === "1");
ok("pre-paint script leaves a fresh device unmarked", runPre(9, {})["data-returning"] === undefined);
ok("pre-paint script ignores {} like the React rule", runPre(9, { voco_progress_v1: "{}" })["data-returning"] === undefined);
ok("pre-paint script survives blocked storage", (() => { try { return runPre(9, {}, { blocked: true })["data-returning"] === undefined; } catch (e) { return false; } })());
ok("pre-paint script and React rule use the same keys", RETURNING_KEYS.every((k) => PRE_HYDRATION_SCRIPT.includes(k)));
ok("theme CSS carries both palettes", THEME_CSS.includes(NIGHT.pageCss) && THEME_CSS.includes('html[data-phase="morning"]') && THEME_CSS.includes(DAWN.pageCss));

// ---------- the copy ----------
const HEADLINE = "Study tonight. Quiz tomorrow.";
const SUBLINE = "SAT vocab, built around how sleep helps memory settle.";
// Same rules as lib/sleepScience.js's header, as a lint over any sleep line.
const BANNED = [
  [/\d/, "no digits, years or counts"],
  [/lock(ed|s)?\s+(it\s+)?in\b/i, 'no "lock it in" (oversells)'],
  [/while\s+you\s+sleep|in\s+your\s+sleep|as\s+you\s+sleep|during\s+your\s+sleep|overnight\s+learning|learn(s|ing)?\s+(in|while)\s+(your\s+)?(sleep|asleep)/i, "never imply learning happens while asleep"],
  [/absorb/i, "never suggest information is absorbed in sleep"],
  [/\b(is|are)\s+(when|where)\b/i, 'prefer "helps" over "is when/where"'],
  [/\b(researchers?|scientists?|studies|a study|professor|university|institute)\b/i, "no named or implied source"],
  [/(?<!not a )\b(guarantee|proven|always|never)\b/i, "no absolutes"],
];
function lint(label, text) {
  const hits = BANNED.filter(([re]) => re.test(text)).map(([, why]) => why);
  ok(`copy lint: ${label}`, hits.length === 0, hits.join("; "));
}
lint("headline", HEADLINE);
lint("subline", SUBLINE);
ok('subline says sleep "helps" (the house verb), not a stronger one', /\bhelps\b/.test(SUBLINE));
ok("the page uses exactly this headline and subline", (() => {
  const src = readFileSync(path.join(root, "components/FirstVisit.js"), "utf8");
  return src.includes("Study tonight.") && src.includes("Quiz tomorrow.") && src.includes(SUBLINE);
})());
Object.entries(SLEEP_SCIENCE).forEach(([k, v]) => lint(`SLEEP_SCIENCE.${k}`, v));
Object.entries(SCIENCE_FACTS).forEach(([cat, facts]) => facts.forEach((f, i) => lint(`SCIENCE_FACTS.${cat}[${i}]`, f)));
ok("trial terms line is exact", TRIAL_TERMS === "7 days free, then $1.99/month. Cancel anytime.", TRIAL_TERMS);

// ---------- the old onboarding is really gone ----------
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git"].includes(name)) continue;
    const full = path.join(dir, name);
    statSync(full).isDirectory() ? walk(full, out) : /\.(js|mjs)$/.test(name) && out.push(full);
  }
  return out;
}
const sources = ["app", "components", "lib"].flatMap((d) => walk(path.join(root, d)));
ok("onboarding component and flag modules are deleted", !["components/Onboarding.js", "lib/onboarding.js", "lib/nightThemeExplainer.js"].some((f) => existsSync(path.join(root, f))));
const leftovers = sources.filter(
  (f) => path.relative(root, f) !== path.join("lib", "visitor.js") && /onboard|useOnboarding|hasSeenThisSession|markSeenThisSession/i.test(readFileSync(f, "utf8"))
);
ok("no code still refers to onboarding", leftovers.length === 0, leftovers.map((f) => path.relative(root, f)).join(", "));
const legacyRefs = sources.filter((f) => /voco_onboarded_v1|voco_night_theme_seen_session_v1/.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
ok("the old flag names appear only in the one cleanup helper", legacyRefs.length === 1 && legacyRefs[0] === path.join("lib", "visitor.js"), legacyRefs.join(", "));
const explainer = readFileSync(path.join(root, "components/NightThemeExplainer.js"), "utf8");
ok("explainer never opens by itself (showModal only from the tap handler)", (explainer.match(/showModal\(\)/g) || []).length === 1 && !/useEffect/.test(explainer));
ok("explainer is still reachable from the first-visit and home headers", readFileSync(path.join(root, "components/FirstVisit.js"), "utf8").includes("<NightThemeExplainer") && readFileSync(path.join(root, "app/page.js"), "utf8").includes("<NightThemeExplainer"));
const globals = readFileSync(path.join(root, "app/globals.css"), "utf8");
ok("no render-blocking font @import in globals.css", !/@import/.test(globals));
ok("fonts load through next/font", /next\/font\/google/.test(readFileSync(path.join(root, "app/layout.js"), "utf8")));


// ---------- button contrast (dark text on the dawn orange) ----------
function ratio(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
for (const [name, theme] of [["NIGHT", NIGHT], ["DAWN", DAWN]]) {
  const r = ratio(theme.accent, theme.onAccent);
  ok(`${name}: button text on the accent is at least 4.5:1`, r >= 4.5, r.toFixed(2));
}
ok("DAWN button text is never white", DAWN.onAccent.toUpperCase() !== "#FFFFFF");
const hardcoded = sources.filter((f) => /backgroundColor:\s*theme\.accent,\s*color:\s+(?!theme\.onAccent)\S/.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
ok("no screen hardcodes a text color on theme.accent (must be theme.onAccent)", hardcoded.length === 0, hardcoded.join(", "));

// ---------- analytics ----------
const analytics = readFileSync(path.join(root, "lib/analytics.js"), "utf8");
ok("exactly the three funnel events", ["first_question_answered", "keep_going_clicked", "trial_cta_clicked"].every((e) => analytics.includes(e)));
const trackers = sources.filter((f) => /\btrack\(/.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
ok("track() is called from one place only", trackers.length === 1 && trackers[0] === path.join("lib", "analytics.js"), trackers.join(", "));
const rawLinks = sources.filter((f) => /href=\{PAYMENT_LINK_URL\}/.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
ok("every start-trial link goes through TrialLink (so each is counted)", rawLinks.length === 1 && rawLinks[0] === path.join("components", "TrialLink.js"), rawLinks.join(", "));
const trialUsers = sources.filter((f) => /<TrialLink/.test(readFileSync(f, "utf8")) && !/TRIAL_TERMS/.test(readFileSync(f, "utf8")));
ok("every page with a start-trial link also shows the trial terms", trialUsers.length === 0, trialUsers.map((f) => path.relative(root, f)).join(", "));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
