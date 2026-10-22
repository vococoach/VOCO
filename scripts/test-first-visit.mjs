// Checks for the first-visit screen and the removal of the old onboarding.
// Run with `npm run test:first-visit`. Plain Node, no browser: it tests the
// data and the logic. The visual side (fits 375×667, palette at each hour,
// no flash) was verified in a real browser — see CLAUDE.md.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`);
};

const { getFirstVisitQuestion, getCourseStrip, FIRST_VISIT_LEVEL_ID, FIRST_VISIT_OPTION_ORDER } = await import("../lib/firstVisit.js");
const { HEADLINE, HEADLINE_LINES, PROMISE } = await import("../lib/site.js");
const { isReturningVisitor, clearLegacyFlags, setReturningAttribute, RETURNING_KEYS } = await import("../lib/visitor.js");
const { PRE_HYDRATION_SCRIPT } = await import("../lib/preHydration.js");
const { SLEEP_SCIENCE, SCIENCE_FACTS } = await import("../lib/sleepScience.js");
const { THEME_CSS, NIGHT, DAWN } = await import("../lib/timeTheme.js");
const { TRIAL_TERMS, isLevelLocked, FREE_CATEGORY_IDS } = await import("../lib/purchase.js");
const { findLevel, courses } = await import("../lib/wordbanks.js");

// ---------- the question ----------
{
  const q = getFirstVisitQuestion();
  ok("first-visit question exists", Boolean(q && q.word && q.quiz));
  ok("it is from a free category", FREE_CATEGORY_IDS.includes(q.category.id));
  const found = findLevel(FIRST_VISIT_LEVEL_ID);
  ok("it is from a level a non-subscriber can open", !isLevelLocked(found.category.id, found.level.level, false));
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

// ---------- keeping <html data-returning> in step ----------
{
  const attrs = {};
  globalThis.document = { documentElement: { setAttribute: (k, v) => (attrs[k] = v), removeAttribute: (k) => delete attrs[k] } };
  setReturningAttribute(true);
  ok("setReturningAttribute(true) sets data-returning", attrs["data-returning"] === "1");
  setReturningAttribute(false);
  ok("setReturningAttribute(false) clears it (so Reset progress can't leave the first-visit view hidden)", !("data-returning" in attrs));
  delete globalThis.document;
  ok("setReturningAttribute is a no-op without a document (server render)", (() => { try { setReturningAttribute(true); return true; } catch (e) { return false; } })());
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
// The headline and the one-line promise live in lib/site.js; the page, the page title,
// the description and the share preview all read them from there.
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
lint("promise", PROMISE);
ok("headline is two lines that read 'Study tonight. Quiz tomorrow.'", HEADLINE_LINES.length === 2 && HEADLINE === "Study tonight. Quiz tomorrow.", HEADLINE);
ok("the promise is the agreed one-line sentence", PROMISE === "SAT vocabulary you study before bed and get quizzed on the next day.", PROMISE);
{
  const src = readFileSync(path.join(root, "components/FirstVisit.js"), "utf8");
  ok("the screen reads the headline and promise from lib/site.js (no second copy of the words)", /from "@\/lib\/site"/.test(src) && /HEADLINE_LINES\.map/.test(src) && /\{PROMISE\}/.test(src) && !src.includes("Study tonight.") && !src.includes("Quiz tomorrow.") && !src.includes("quizzed on the next day"));
  const layout = readFileSync(path.join(root, "app/layout.js"), "utf8");
  ok("the page title and description are built from the same constants", /const TITLE = `Voco: \$\{HEADLINE\}`/.test(layout) && /const DESCRIPTION = PROMISE;/.test(layout) && /\$\{PROMISE\}/.test(layout) && !layout.includes("Study tonight."));
  // The new copy keeps to the house style: plain, no em or en dashes, no "X, not just Y".
  const strip = getCourseStrip();
  const copy = { headline: HEADLINE, promise: PROMISE, chip: "Free sample · no sign-up", note: "One question. No account needed.", strip: strip.text };
  ok("the chip and the note are exactly the agreed words, and each appears once in the screen", src.includes(">Free sample · no sign-up<") && src.includes("One question. No account needed.") && (src.match(/Free sample · no sign-up/g) || []).length === 1 && (src.match(/One question\. No account needed\./g) || []).length === 1);
  const style = Object.entries(copy).filter(([, t]) => /[\u2013\u2014]|\bnot (just|only|merely)\b/i.test(t)).map(([k]) => k);
  ok("new first-screen copy has no em dashes, en dashes or 'not just' constructions", style.length === 0, style.join(", "));
  ok("the course strip names the courses from the course list, in order, as a plain line", strip.text === "Four courses: SAT · Everyday · Professional · GRE" && strip.names.length === courses.length, strip.text);
  const stripBlock = src.slice(src.lastIndexOf("<Fold", src.indexOf("{strip.text}")), src.indexOf("</Fold>", src.indexOf("{strip.text}")));
  ok("the course strip is text only: no link, button, handler or role", stripBlock.includes("{strip.text}") && !/<(Link|a|button)\b|onClick|role=|href=|tabIndex/.test(stripBlock));
}
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


// ---------- the returning-device loading state ----------
{
  const loading = readFileSync(path.join(root, "components/HomeLoading.js"), "utf8");
  const globalsCss = readFileSync(path.join(root, "app/globals.css"), "utf8");
  const code = loading.replace(/\/\/.*$/gm, "");
  const jsxText = [...code.matchAll(/>([^<>{}]+)</g)].map((m) => m[1].trim()).filter((t) => /[A-Za-z0-9]/.test(t));
  ok("loading state's only visible text is the Voco wordmark (nothing that could turn out wrong)", jsxText.length === 1 && jsxText[0] === "Voco", JSON.stringify(jsxText));
  ok("loading state has no hooks, state or data imports (pure markup + CSS)", !/\buse[A-Z]\w*\(/.test(code) && !/from "@\/lib/.test(code));
  ok("loading state is hidden by default and shown only for a returning device", /\.vc-loading\s*\{\s*display:\s*none;?\s*\}/.test(globalsCss) && /html\[data-returning\]\s+\.vc-loading\s*\{\s*display:\s*block;?\s*\}/.test(globalsCss));
  ok("the first-visit view is hidden for a returning device", /html\[data-returning\]\s+\.vc-first\s*\{\s*display:\s*none;?\s*\}/.test(globalsCss));
  ok("the pulse is opacity-only and stops under prefers-reduced-motion", /@keyframes vc-pulse[^}]*opacity[\s\S]*?prefers-reduced-motion[\s\S]*?\.vc-skeleton\s*\{\s*animation:\s*none/.test(globalsCss) && !/vc-pulse[^}]*background-color:\s*#/.test(globalsCss.slice(globalsCss.indexOf("@keyframes vc-pulse"), globalsCss.indexOf(".vc-skeleton {"))));
  const home = readFileSync(path.join(root, "app/page.js"), "utf8");
  ok("home renders both views for a not-yet-known device and lets CSS pick (no JS-gated flash)", /<FirstVisit \/>\s*<HomeLoading \/>/.test(home));
  ok("home keeps the attribute in step wherever it re-decides returning", (home.match(/setReturningAttribute\(/g) || []).length === 1 && (home.match(/syncReturning\(\)/g) || []).length >= 3 && !/setReturning\(isReturningVisitor\(\)\)/.test(home));
}

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

// ---------- first-screen contrast, both phases ----------
// The thresholds: 4.5:1 for small text, 7:1 for the instruction and the option text
// (it is the thing to read and tap), 3:1 for anything that identifies a control or an
// outcome (WCAG 1.4.11: an option's edge, a focus ring, the correct/not-correct border
// and icon). rgba fills are blended over the card they sit on first.
{
  const over = (rgba, hex) => {
    const [r, g, b, a] = rgba.match(/[\d.]+/g).map(Number);
    const bg = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return "#" + [r, g, b].map((v, i) => Math.round(v * a + bg[i] * (1 - a)).toString(16).padStart(2, "0")).join("");
  };
  const pageStops = (t) => t.pageCss.match(/#[0-9A-Fa-f]{6}/g);
  for (const [name, t] of [["NIGHT", NIGHT], ["DAWN", DAWN]]) {
    const need = (label, a, b, min) => { const r = ratio(a, b); ok(`${name}: ${label} is at least ${min}:1`, r >= min, r.toFixed(2)); };
    need("answer option edge vs the card", t.optionEdge, t.card, 3);
    need("answer option edge vs the option's own fill", t.optionEdge, t.optionFill, 3);
    need("answer option text vs the option fill", t.text, t.optionFill, 7);
    need("answer option text vs the hover fill", t.text, t.optionHover, 7);
    need("answer option text vs the pressed fill", t.text, t.optionPress, 7);
    need("the instruction line (text) vs the card", t.text, t.card, 7);
    need("focus ring and pressed edge vs the card", t.focus, t.card, 3);
    need("correct border and check vs the card", t.ok, t.card, 3);
    need("not-correct border and cross vs the card", t.no, t.card, 3);
    need("correct border vs its own tinted fill", t.ok, over(t.okFill, t.card), 3);
    need("not-correct border vs its own tinted fill", t.no, over(t.noFill, t.card), 3);
    need("option text on the correct fill", t.text, over(t.okFill, t.card), 7);
    for (const stop of pageStops(t)) need(`subline, course strip, "How it works" and footer links (${stop}) on the page`, t.subtextAA, stop, 4.5);
    need("the chip text vs the chip (it uses the card color)", t.text, t.card, 7);
    need("the line under the options and the explanation vs the card", t.subtextAA, t.card, 4.5);
    ok(`${name}: THEME_CSS carries every first-screen variable`, ["--vc-option-fill", "--vc-option-edge", "--vc-option-hover", "--vc-option-press", "--vc-focus", "--vc-ok", "--vc-ok-fill", "--vc-no", "--vc-no-fill", "--vc-card-shadow"].every((v) => THEME_CSS.includes(v)));
    ok(`${name}: the raised card has a shadow of its own`, typeof t.cardShadow === "string" && /rgba\(/.test(t.cardShadow) && THEME_CSS.includes(t.cardShadow));
  }
}

// ---------- the answer options: filled, tappable, with a visible pressed state ----------
{
  const first = readFileSync(path.join(root, "components/FirstVisit.js"), "utf8");
  const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
  ok("options are .vc-option buttons driven by data-state, 56px tall", /className="vc-option min-h-\[56px\]/.test(first) && /data-state=\{state\}/.test(first));
  ok("the question sentence is 19px", /font-display text-\[19px\][^>]*>\{quiz\.sentence\}/.test(first));
  ok("options have a hover, a pressed state and a keyboard focus ring", /\.vc-option\[data-state="idle"\][^{]*:hover\s*\{/.test(css) && /\.vc-option\[data-state="idle"\][^{]*:active\s*\{[^}]*transform:\s*scale\(/.test(css) && /\.vc-option:focus-visible\s*\{[^}]*outline/.test(css));
  ok("options transition into the correct / not-correct state", /\.vc-option\s*\{[^}]*transition:[^;]*background-color[^;]*border-color/.test(css) && /\.vc-option\[data-state="correct"\]/.test(css) && /\.vc-option\[data-state="wrong"\]/.test(css));
  ok("reduced motion: no scale, no pop animation (colors still change)", /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.vc-option\[data-state="idle"\][^{]*:active\s*\{\s*transform:\s*none/.test(css) && /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.vc-option-icon\s*\{\s*animation:\s*none/.test(css));
  ok("the old tiny all-caps eyebrow is gone; the instruction is sentence case at 14px", !/Try one/i.test(first) && /text-\[14px\][^>]*>\s*Which word fits the blank\?/.test(first));
  ok("the header control is a labelled 'How it works' button with a 44px target", /<NightThemeExplainer label="How it works" compact/.test(first) && /min-h-\[44px\]/.test(explainer));
  ok("footer links are 44px tall", (first.match(/min-h-\[44px\]/g) || []).length >= 2);
}

// ---------- the first screen's layout: order, what leaves when answered, the raised card ----------
{
  const first = readFileSync(path.join(root, "components/FirstVisit.js"), "utf8");
  const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
  const at = (needle) => first.indexOf(needle);
  const order = ["<header", "Free sample · no sign-up", "<h1", "{PROMISE}", "Which word fits the blank?", "{quiz.sentence}", "order.map", "One question. No account needed.", "{strip.text}", "<footer", ">Courses<"].map(at);
  ok("order on the page: header, chip, headline, promise, then the question card (instruction, sentence, options, note), strip, footer, courses", order.every((i, n) => i >= 0 && (n === 0 || i > order[n - 1])), order.join(" < "));
  ok("the question is the first thing in the page after the headline: nothing between them but the promise", !/<(dialog|Onboarding)|showModal|useEffect/.test(first));
  ok("exactly three blocks leave once the question is answered: the chip, the note and the strip", (first.match(/<Fold folded=\{answered\}/g) || []).length === 3);
  ok("a leaving block is hidden from assistive tech once folded", /data-folded=\{folded\} aria-hidden=\{folded \|\| undefined\}/.test(first));
  ok("the explanation and the Keep going block arrive with the same unfold", (first.match(/className="vc-unfold"/g) || []).length === 2);
  // The `{answered && ( ... )}` block that holds a piece of text, found by balancing its parentheses.
  const gated = (needle) => {
    const open = first.lastIndexOf("{answered && (", first.indexOf(needle));
    if (open < 0) return "";
    let depth = 0;
    for (let i = open + "{answered && ".length; i < first.length; i++) {
      if (first[i] === "(") depth++;
      else if (first[i] === ")" && --depth === 0) return first.slice(open, i + 1);
    }
    return "";
  };
  const afterAnswer = gated("EVENTS.keepGoingClicked");
  ok("Keep going, the trial link and the trial terms exist only after an answer", afterAnswer.includes("Keep going") && afterAnswer.includes("<TrialLink") && afterAnswer.includes("{TRIAL_TERMS}") && (first.match(/<TrialLink/g) || []).length === 1);
  ok("the explanation exists only after an answer", gated("{quiz.explanation}").includes("{quiz.explanation}"));
  ok("the explanation is announced politely when it arrives", /<div aria-live="polite">\s*\{answered && \(\s*<div className="vc-unfold">/.test(first));
  ok("a fold animates its row to nothing, fades, and drops out of view only when done", /\.vc-fold\s*\{[^}]*grid-template-rows:\s*1fr[^}]*transition:[^;]*grid-template-rows/.test(css) && /\.vc-fold\[data-folded="true"\]\s*\{[^}]*grid-template-rows:\s*0fr[^}]*opacity:\s*0[^}]*visibility:\s*hidden[^}]*visibility 0s 240ms/.test(css));
  ok("the unfold is a keyframe animation from a zero-height row, and a link inside it keeps room for its focus ring", /@keyframes vc-unfold\s*\{\s*from\s*\{[^}]*grid-template-rows:\s*0fr[^}]*\}\s*to\s*\{[^}]*grid-template-rows:\s*1fr/.test(css) && /\.vc-unfold > \*\s*\{[^}]*overflow:\s*hidden[^}]*padding:\s*4px[^}]*margin:\s*-4px/.test(css));
  ok("reduced motion: folds and unfolds are instant", /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.vc-fold[^{]*\{\s*transition:\s*none[^@]*\.vc-unfold\s*\{\s*animation:\s*none/.test(css));
  ok("the card is raised: its shadow comes from the theme", /\.vc-card\s*\{[^}]*box-shadow:\s*var\(--vc-card-shadow\)/.test(css));
  ok("the spacing scales with the small viewport height only (svh never moves with browser toolbars), behind @supports, with a fixed fallback", /@supports \(height: 1svh\)\s*\{[^@]*--vc-gap:\s*clamp\([^;]*100svh/.test(css) && !/--vc-[\w-]+:[^;]*\d(dvh|lvh|vh)\b/.test(css) && /\.vc-first\s*\{[^}]*--vc-gap:\s*\d+px/.test(css));
  ok("a returning device never sees any of it (the whole view is still hidden by CSS)", /html\[data-returning\]\s+\.vc-first\s*\{\s*display:\s*none/.test(css));
  const how = readFileSync(path.join(root, "app/how-it-works/page.js"), "utf8");
  ok("/how-it-works has no em or en dashes, in its own text or in any sentence it draws from lib/sleepScience.js", !/[\u2013\u2014]/.test(how) && !/[\u2013\u2014]/.test(Object.values(SLEEP_SCIENCE).join(" ")));
}

// ---------- the explainer: two sentences and a link for a new visitor ----------
{
  const compactStart = explainer.indexOf("{compact ? (");
  const compactBranch = explainer.slice(compactStart, explainer.indexOf(") : (", compactStart));
  ok("short dialog = the rhythm sentence, the one-line claim with its hedge, and a link to /how-it-works", /SLEEP_SCIENCE\.rhythm/.test(compactBranch) && /SLEEP_SCIENCE\.short/.test(compactBranch) && /href="\/how-it-works"/.test(compactBranch));
  ok("the short dialog never mentions streaks", !/streak/i.test(compactBranch));
  ok("the short dialog is exactly two paragraphs of text plus the link", (compactBranch.match(/<p>/g) || []).length === 3);
  ok("the /how-it-works page exists and every sleep sentence on it comes from lib/sleepScience.js", existsSync(path.join(root, "app/how-it-works/page.js")) && /SLEEP_SCIENCE\.consolidation/.test(readFileSync(path.join(root, "app/how-it-works/page.js"), "utf8")));
}

// ---------- brand mark, icons, share image, manifest ----------
{
  const pub = (f) => path.join(root, "public", f);
  const png = (f) => { const b = readFileSync(pub(f)); return b.readUInt32BE(0) === 0x89504e47 ? { b, w: b.readUInt32BE(16), h: b.readUInt32BE(20) } : null; };
  const jpegSize = (f) => {
    const b = readFileSync(pub(f));
    if (b[0] !== 0xff || b[1] !== 0xd8) return null;
    for (let p = 2; p < b.length; ) {
      if (b[p] !== 0xff) { p++; continue; }
      const m = b[p + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: b.readUInt16BE(p + 5), w: b.readUInt16BE(p + 7) };
      p += 2 + b.readUInt16BE(p + 2);
    }
    return null;
  };
  // Pixel access for an 8-bit RGB/RGBA PNG (what sips writes). Enough to check opacity and the safe zone.
  const pixels = (f) => {
    const b = readFileSync(pub(f)); let p = 8, w, h, ctype; const idat = [];
    while (p < b.length) { const len = b.readUInt32BE(p), type = b.toString("ascii", p + 4, p + 8); if (type === "IHDR") { w = b.readUInt32BE(p + 8); h = b.readUInt32BE(p + 12); ctype = b[p + 17]; } if (type === "IDAT") idat.push(b.subarray(p + 8, p + 8 + len)); p += 12 + len; }
    const bpp = ctype === 6 ? 4 : 3, stride = w * bpp, raw = zlib.inflateSync(Buffer.concat(idat)), out = Buffer.alloc(h * stride);
    for (let y = 0; y < h; y++) {
      const f0 = raw[y * (stride + 1)];
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? out[y * stride + x - bpp] : 0, up = y ? out[(y - 1) * stride + x] : 0, c = x >= bpp && y ? out[(y - 1) * stride + x - bpp] : 0;
        let v = raw[y * (stride + 1) + 1 + x];
        if (f0 === 1) v += a; else if (f0 === 2) v += up; else if (f0 === 3) v += (a + up) >> 1;
        else if (f0 === 4) { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
        out[y * stride + x] = v & 255;
      }
    }
    return { w, h, px: (x, y) => { const i = (y * w + x) * bpp; return [out[i], out[i + 1], out[i + 2], bpp === 4 ? out[i + 3] : 255]; } };
  };
  const size = (f, w, h) => { const i = png(f); return Boolean(i) && i.w === w && i.h === h; };
  ok("apple touch icon is a 180x180 PNG", size("apple-touch-icon.png", 180, 180));
  ok("manifest icons are 192x192, 512x512 and a 512x512 maskable PNG", size("icons/icon-192.png", 192, 192) && size("icons/icon-512.png", 512, 512) && size("icons/icon-maskable-512.png", 512, 512));
  const og = jpegSize("og.jpg");
  ok("share image is 1200x630", Boolean(og) && og.w === 1200 && og.h === 630, og ? `${og.w}x${og.h}` : "unreadable");
  ok("share image is small enough for every messaging app (under 300 KB)", statSync(pub("og.jpg")).size < 300 * 1024, `${Math.round(statSync(pub("og.jpg")).size / 1024)} KB`);
  const ico = readFileSync(pub("favicon.ico"));
  const icoSizes = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => ico[6 + 16 * i] || 256);
  ok("favicon.ico holds 16, 32 and 48 px images", ico.readUInt16LE(2) === 1 && icoSizes.join() === "16,32,48", icoSizes.join("/"));
  {
    const a = pixels("apple-touch-icon.png"); let opaque = true;
    for (let y = 0; y < a.h && opaque; y++) for (let x = 0; x < a.w; x++) if (a.px(x, y)[3] !== 255) { opaque = false; break; }
    ok("apple touch icon is fully opaque (iOS paints transparency black)", opaque);
    const m = pixels("icons/icon-maskable-512.png"); const near = (c, t) => Math.abs(c[0] - t[0]) < 40 && Math.abs(c[1] - t[1]) < 40 && Math.abs(c[2] - t[2]) < 40;
    let far = 0; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const c = m.px(x, y); if (near(c, [139, 133, 255]) || near(c, [255, 155, 92])) far = Math.max(far, Math.hypot(x - m.w / 2, y - m.h / 2)); }
    ok("maskable icon keeps the whole mark inside the safe zone (a circle of radius 40% of the width)", far <= 0.4 * m.w, `mark reaches ${(far / m.w * 100).toFixed(1)}% of the width from the centre`);
  }
  // The mark: the inline component and the served icon must describe the same two shapes as the clean SVG.
  const svg = readFileSync(pub("icon.svg"), "utf8"), mark = readFileSync(path.join(root, "components/VocoMark.js"), "utf8");
  const d = (s) => (s.match(/\sd="([^"]+)"/) || [])[1];
  ok("public/icon.svg and the inline mark share the viewBox and the crescent path", /viewBox="56 56 398 400"/.test(svg) && /viewBox="56 56 398 400"/.test(mark) && d(svg) && d(svg) === d(mark));
  ok("…and the same colors, stroke and sun", ["#8B85FF", "#FF9B5C"].every((c) => svg.includes(c) && mark.includes(c)) && /stroke-width="8"/.test(svg) && /strokeWidth="8"/.test(mark) && /cx="320" cy="224" r="108"/.test(svg) && /cx="320" cy="224" r="108"/.test(mark));
  const lockups = ["components/FirstVisit.js", "components/HomeLoading.js", "app/page.js", "app/terms/page.js", "app/privacy/page.js", "app/unlock/page.js", "app/how-it-works/page.js"];
  const stale = lockups.filter((f) => { const s = readFileSync(path.join(root, f), "utf8"); return !/<VocoMark/.test(s) || /<Moon size=\{2[0-4]\} color="#8B85FF" \/>\s*<span className="font-display/.test(s); });
  ok("every Voco header uses the mark, not the stock moon", stale.length === 0, stale.join(", "));
  // The manifest and the page metadata.
  const man = JSON.parse(readFileSync(pub("manifest.webmanifest"), "utf8"));
  ok("manifest names the app, starts at / and uses the night background", man.name === "Voco" && man.start_url === "/" && man.background_color === NIGHT.pageCss && man.theme_color === NIGHT.pageCss);
  ok("manifest icons all exist at their declared size, with a maskable one", man.icons.length === 3 && man.icons.every((i) => size(i.src.slice(1), ...i.sizes.split("x").map(Number))) && man.icons.some((i) => i.purpose === "maskable"));
  const layout = readFileSync(path.join(root, "app/layout.js"), "utf8");
  ok("the manifest describes the app with the same one-line promise the page uses", man.description === PROMISE, man.description);
  ok("metadata declares icons, manifest, Open Graph and Twitter card with the share image", ["/favicon.ico", "/icon.svg", "/apple-touch-icon.png", 'manifest: "/manifest.webmanifest"', "openGraph", 'card: "summary_large_image"', "/og.jpg", "metadataBase"].every((s) => layout.includes(s)));
  // brand-assets is source material: no code may import, fetch or link it, and none of it may sit under public/.
  // (Comments naming it as the origin of the generated files are fine.)
  const refs = sources.filter((f) => /(import|require|fetch|src=|href=|url\()[^\n]*brand-assets/.test(readFileSync(f, "utf8"))).map((f) => path.relative(root, f));
  ok("brand-assets is never imported, fetched, linked or served", refs.length === 0 && !existsSync(pub("brand-assets")), refs.join(", "));
}

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
