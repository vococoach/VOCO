// Checks for the home screen and course pages redesign ("Home screen and course pages" in
// app/globals.css). Run with `npm run test:pages`. Plain Node, no browser: it tests the data,
// the design tokens (contrast math) and the shape of the source. The visual side (390, 375 and
// 360 px wide, night and dawn, no overflow, nothing under the safe areas) was checked in a real
// browser. See CLAUDE.md.
//
// The redesign is design and copy only, so half of this file is the other direction: it checks
// that the rules it must not touch (routes, access, the paywall's reach, analytics, storage)
// are still wired the way they were.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`);
};

const read = (f) => readFileSync(path.join(root, f), "utf8");
// Source without its comments, so a check on the words a learner sees is not fooled by (or
// failed by) a note to the next developer. Keeps "https://" and the like.
const code = (f) => read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
const count = (src, re) => (src.match(re) || []).length;

const { courses, getCourseSections } = await import("../lib/wordbanks.js");
const { NIGHT, DAWN, THEME_CSS } = await import("../lib/timeTheme.js");
const { SLEEP_SCIENCE } = await import("../lib/sleepScience.js");

const HOME = "app/page.js";
const COURSE = "app/courses/[courseId]/page.js";
const LISTS = ["components/CategoryList.js", "components/PassageList.js", "components/CrossTextList.js", "components/GrammarList.js", "components/PracticeTestTab.js", "components/StrategyList.js"];
const PARTS = ["components/ItemCard.js", "components/LockedRow.js", "components/Paywall.js", "components/SectionPills.js", "components/CourseProgress.js"];
const OTHERS = ["components/HomeLoading.js", "components/NightThemeExplainer.js"];
const FILES = [HOME, COURSE, ...LISTS, ...PARTS, ...OTHERS];

// ---------- copy: the few words ----------
{
  const dashes = FILES.filter((f) => code(f).includes("—"));
  ok("no em dash in any screen or component of the home and course pages", dashes.length === 0, dashes.join(", "));
  ok("none in the sleep-science sentences the home screen's info dialog shows either", Object.values(SLEEP_SCIENCE).every((s) => !String(s).includes("—")));
  const taglines = courses.map((c) => c.tagline);
  ok("every course has a tagline", taglines.every((t) => typeof t === "string" && t.length > 0), taglines.join(" | "));
  ok("each tagline is 8 words or fewer", taglines.every((t) => t.split(/\s+/).length <= 8), taglines.map((t) => t.split(/\s+/).length).join(","));
  ok("and short enough to stay on one line on a 360px phone (42 characters)", taglines.every((t) => t.length <= 42), taglines.map((t) => t.length).join(","));
  ok("sentence case, one plain sentence, no em dash", taglines.every((t) => /^[A-Z]/.test(t) && /\.$/.test(t) && !/[—!?;]/.test(t) && !/\. \S/.test(t)));
  ok("the taglines are all different", new Set(taglines).size === taglines.length);
  ok("the first-screen description is still its own, longer text", courses.every((c) => c.description && c.description.length > c.tagline.length));

  const sat = courses.find((c) => c.id === "sat-vocab");
  const sections = getCourseSections(sat);
  ok("the SAT course page has five sections with the same ids as before (they are the ?section= links)", JSON.stringify(sections.map((s) => s.id)) === JSON.stringify(["vocabulary", "passages", "grammar", "practice-test", "strategy"]));
  ok("their labels are short and sentence case", JSON.stringify(sections.map((s) => s.label)) === JSON.stringify(["Vocabulary", "Passages", "Grammar & usage", "Practice test", "Strategy"]) && sections.every((s) => s.label === s.label[0] + s.label.slice(1).toLowerCase()));
  ok("a course with no extra sections still has no section row", courses.filter((c) => c.id !== "sat-vocab").every((c) => getCourseSections(c) === null));

  const home = code(HOME);
  const gone = ["ScienceNote", "pickScienceFact", "sleepScience", "Study a level before bed", "Good evening", "Good morning", "categories mastered", "levels completed", "you're still learning"].filter((s) => home.includes(s));
  ok("the home screen has no intro sentence, no science card and no mastered/completed counts", gone.length === 0, gone.join(", "));
  ok("the facts are still shown where they were already used (study complete, /how-it-works, the info dialog)", ["components/StudyClose.js", "app/how-it-works/page.js", "components/NightThemeExplainer.js"].every((f) => read(f).includes("sleepScience")));
  ok("the due card says how many words are due, in a few words", /\{dueCount\} word\{dueCount !== 1 \? "s" : ""\} due\b/.test(home));
  ok("a course card is the title, its tagline and one progress line", /course\.tagline/.test(home) && /<CourseProgress course=\{course\}/.test(home) && !/course\.description/.test(home));
  const course = code(COURSE);
  ok("the course page subtitle is the tagline (the long description only as a fallback)", /course\.tagline \|\| course\.description/.test(course));
  ok("no per-section description is left on the course page or in its lists", ![COURSE, ...LISTS].some((f) => /Short written guides|Free for everyone|Reading passages with|Standard English Conventions|Quiz-only/.test(code(f))));
}

// ---------- type: one short scale, Inter except the titles ----------
{
  const css = read("app/globals.css");
  const block = css.slice(css.indexOf("/* Home screen and course pages."));
  const sizes = [...new Set([...block.matchAll(/font-size:\s*(\d+)px/g)].map((m) => Number(m[1])))].sort((a, b) => a - b);
  ok("the stylesheet block uses 12, 14 and 16 px only", JSON.stringify(sizes) === "[14,16]" || JSON.stringify(sizes) === "[12,14,16]", sizes.join(","));
  const used = new Set();
  for (const f of FILES.filter((f) => f !== "components/NightThemeExplainer.js")) for (const m of code(f).matchAll(/\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|\[\d+px\])/g)) used.add(m[1]);
  ok("the pages use text-xs, text-sm, text-base, text-xl (titles) and text-2xl only: 12, 14, 16, 20, 24 px", [...used].every((s) => ["xs", "sm", "base", "xl", "2xl"].includes(s)), [...used].join(","));
  const xl = FILES.flatMap((f) => code(f).split("\n").filter((l) => /\btext-xl\b/.test(l)).map((l) => `${f}: ${l.trim()}`));
  ok("text-xl is only ever the Fraunces wordmark, course title or dialog title", xl.length === 4 && xl.every((l) => /font-display/.test(l)), xl.join(" | "));
  const display = Object.fromEntries(FILES.map((f) => [f, count(code(f), /font-display/g)]).filter(([, n]) => n > 0));
  ok("Fraunces appears only on the wordmark, the page and course titles (and the info dialog's title)", JSON.stringify(display) === JSON.stringify({ [HOME]: 2, [COURSE]: 1, "components/HomeLoading.js": 1, "components/NightThemeExplainer.js": 1 }), JSON.stringify(display));
  ok("the wordmark and the course titles are the home's two", /font-display text-xl">Voco</.test(code(HOME)) && /<h3 className="font-display text-xl">\{course\.title\}/.test(code(HOME)));
  ok("the course page's one Fraunces use is its h1 title", /<h1 className="font-display[^"]*">\{course\.title\}/.test(code(COURSE)));
  ok("buttons and links are Inter semibold or medium", /\.vc-btn \{[^}]*font-weight: 600/.test(css) && /\.vc-pill \{[^}]*font-weight: 600/.test(css) && /\.vc-link \{[^}]*font-weight: 500/.test(css));
  ok("card titles are semibold", /<h3 className="[^"]*text-base font-semibold/.test(code("components/ItemCard.js")) && /text-base font-semibold/.test(code("components/LockedRow.js")) && /text-base font-semibold/.test(code("components/Paywall.js")));
}

// ---------- targets, safe areas, the pill row ----------
{
  const css = read("app/globals.css");
  const rule = (sel) => (css.match(new RegExp(sel.replace(/[.[\]]/g, "\\$&") + "\\s*\\{([^}]*)\\}")) || [])[1] || "";
  for (const sel of [".vc-btn", ".vc-link", ".vc-pill", ".vc-chip-btn"]) ok(`${sel} is at least 44px tall`, /min-height:\s*44px/.test(rule(sel)));
  ok(".vc-chip-btn (a streak in the top bar) is at least 44px wide", /min-width:\s*44px/.test(rule(".vc-chip-btn")));
  const page = rule(".vc-page");
  ok("the page shell keeps 1rem and never less than each device safe-area inset (top, right, bottom, left)", ["top", "right", "bottom", "left"].every((side) => new RegExp(`padding-${side}:\\s*max\\([^;]*env\\(safe-area-inset-${side}\\)`).test(page)));
  ok("the bottom padding clears the home indicator by a full 1rem", /padding-bottom:\s*max\(2rem,\s*calc\(env\(safe-area-inset-bottom\)\s*\+\s*1rem\)\)/.test(page));
  ok("the page shell is a full dynamic viewport tall and paints the palette", /min-height:\s*100dvh/.test(page) && /background:\s*var\(--vc-page\)/.test(page));
  const pills = rule(".vc-pills");
  ok("the section pills are one row that scrolls sideways and never wraps", /display:\s*flex/.test(pills) && /overflow-x:\s*auto/.test(pills) && !/flex-wrap/.test(pills) && !/flex-wrap|flex-col/.test(code(COURSE)));
  ok("each pill keeps its size and its text on one line", /flex:\s*none/.test(rule(".vc-pill")) && /white-space:\s*nowrap/.test(rule(".vc-pill")));
  ok("the pill row bleeds to the screen edges but keeps 1rem inside, so no pill is clipped at the ends", /margin-left:\s*-1rem/.test(pills) && /margin-right:\s*-1rem/.test(pills) && /padding:\s*2px 1rem/.test(pills));
  ok("the active pill is marked by its fill (aria-selected), not by colour of the text alone", /\.vc-pill\[aria-selected="true"\]\s*\{[^}]*background-color:\s*var\(--vc-focus\)/.test(css));
  const tabs = code("components/SectionPills.js");
  ok("the pills are a real tablist with aria-selected tabs, scrollable, and centre the active one", /role="tablist"/.test(tabs) && /role="tab"/.test(tabs) && /aria-selected=\{value === s\.id\}/.test(tabs) && /data-scrollx/.test(tabs) && /scrollLeft/.test(tabs));
  ok("the old five-tab control is gone from the course page", !/role="tab"/.test(code(COURSE)) && /<SectionPills /.test(code(COURSE)));
  ok("the pills' own scroll moves, never the page's (no scrollIntoView)", !/scrollIntoView/.test(tabs));
  ok("reduced motion switches the button and bar transitions off", /prefers-reduced-motion: reduce\)\s*\{[^}]*\.vc-btn[^}]*transition:\s*none/.test(css.slice(css.indexOf("/* Home screen and course pages."))));
  ok("the returning device's body takes the palette, and the placeholder bars use it too", /html\[data-returning\] body \{ background: var\(--vc-page\); \}/.test(css) && /\.vc-skeleton \{ background-color: var\(--vc-option-fill\);/.test(css));
}

// ---------- contrast ----------
{
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  // A palette's page is one colour (night) or a gradient (dawn): every stop counts.
  const stops = (t) => t.pageCss.match(/#[0-9A-Fa-f]{6}/g);
  const min = (fgs, bgs) => Math.min(...fgs.flatMap((f) => bgs.map((b) => ratio(f, b))));
  for (const [name, t] of [["night", NIGHT], ["dawn", DAWN]]) {
    const surfaces = [...stops(t), t.card];
    const r = (v) => v.toFixed(2);
    const muted = min([t.subtextAA], surfaces);
    ok(`${name}: muted text (--vc-subtext) is at least 4.5:1 on the page and on a card`, muted >= 4.5, r(muted));
    const body = min([t.text], surfaces);
    ok(`${name}: body text is at least 4.5:1 on the page and on a card`, body >= 4.5, r(body));
    ok(`${name}: the filled button's text is at least 4.5:1 on its fill`, ratio(t.onAccent, t.accent) >= 4.5, r(ratio(t.onAccent, t.accent)));
    ok(`${name}: an idle pill's text is at least 4.5:1 on its fill`, ratio(t.text, t.optionFill) >= 4.5, r(ratio(t.text, t.optionFill)));
    ok(`${name}: the active pill's text is at least 4.5:1 on its fill`, ratio(t.card, t.focus) >= 4.5, r(ratio(t.card, t.focus)));
    const edge = min([t.optionEdge], surfaces);
    ok(`${name}: a button or pill edge is at least 3:1 on the page and on a card`, edge >= 3, r(edge));
    ok(`${name}: the focus ring is at least 3:1 on the page and on a card`, min([t.focus], surfaces) >= 3, r(min([t.focus], surfaces)));
    ok(`${name}: the progress fill and the streak and tonight icons are at least 3:1 on the page and on a card`, min([t.barFill, t.flame], surfaces) >= 3, r(min([t.barFill, t.flame], surfaces)));
    ok(`${name}: a finished level's green edge is at least 3:1 on a card`, ratio(t.ok, t.card) >= 3, r(ratio(t.ok, t.card)));
    ok(`${name}: the new colours are published as CSS variables`, ["--vc-bar-track", "--vc-bar-fill", "--vc-flame"].every((v) => THEME_CSS.includes(`${v}:${{ "--vc-bar-track": t.barTrack, "--vc-bar-fill": t.barFill, "--vc-flame": t.flame }[v]}`)));
  }
}

// ---------- nothing else changed: routes, access, analytics, storage ----------
{
  const has = (f, ...parts) => parts.every((p) => read(f).includes(p));
  ok("home: the same links (review, due study, missed-words study and quiz, last night, tonight, courses, legal)", has(HOME, 'href="/review"', "/sets/${DUE_FOR_REVIEW_ID}/study", "/sets/${missedWordsId(category.id)}/study", "/sets/${missedWordsId(category.id)}/quiz", "/sets/${lastNight.level.id}/quiz", "/sets/${lastNight.level.id}/study", "/sets/${tonight.level.id}/study", "/courses/${course.id}", 'href="/terms"', 'href="/privacy"'));
  ok("home: the same rules decide what shows (phase, last night, tonight, due and still-learning from accessible words)", has(HOME, "getPhase(now)", "findLastNightsLevel(", "getTonight(", "accessibleWordIds(dueIds, subscribed)", "accessibleWordIds(struggleIds, subscribed)", "isLevelLocked(categoryId, level.level, subscribed)", 'phase === "morning"', 'phase === "evening"'));
  ok("home: reset and manage-subscription still do what they did", has(HOME, "resetProgress()", "openBillingPortal()", "window.confirm(", "useSubscription()"));
  ok("course page: sections, tab state in ?section= and the same progress readers", has(COURSE, "getCourseSections(course)", 'searchParams.get("section")', "history.replaceState", "getAllProgress()", "getAllPassageRecords()", "getAllGrammarRecords()", "getAllPracticeTestAttempts()", "getStruggleWordIds()"));
  ok("course page: access still comes from lib/purchase and lib/access", has(COURSE, "isPassageLocked(", "accessibleWordIds(struggleIds, subscribed)", "countByCategory(", "useSubscription()"));
  ok("vocabulary: study, quiz, sample and missed-words links are the same", has("components/CategoryList.js", "/sets/${level.id}/study", "/sets/${level.id}/quiz", "/preview/${level.id}", "/preview/${category.id}", "/sets/${missedWordsId(category.id)}/study", "/sets/${missedWordsId(category.id)}/quiz"));
  ok("vocabulary: the same two gates (a whole category, and a tier of a free category)", has("components/CategoryList.js", "ready && isCategoryLocked(category.id, subscribed)", "ready && isLevelLocked(category.id, level.level, subscribed)"));
  ok("passages, cross-text, grammar, practice test and guides: same routes and gates", has("components/PassageList.js", "/passages/${passage.id}", "/preview/${passage.id}", "ready && isPassageLocked(passage.id, subscribed)") && has("components/CrossTextList.js", "/cross-text/${pair.id}", "/preview/${pair.id}", "ready && isPassageLocked(pair.id, subscribed)") && has("components/GrammarList.js", "/grammar/${level.id}", "/preview/${category.id}", "ready && isGrammarCategoryLocked(category.id, subscribed)") && has("components/PracticeTestTab.js", 'href="/practice-test"', "if (!subscribed)") && has("components/StrategyList.js", "/strategy/${guide.id}"));
  const reimplemented = FILES.filter((f) => /FREE_TIER_NUMBERS|FREE_CATEGORY_BY_COURSE|FREE_CATEGORY_IDS|isFreeLevel|isFreeCategory/.test(code(f)));
  ok("no screen or component re-implements the free-tier rule (lib/purchase.js is the one place)", reimplemented.length === 0, reimplemented.join(", "));
  const tracking = FILES.filter((f) => /lib\/analytics|@vercel\/analytics|trackEvent|\btrack\(|TrialLink|PAYMENT_LINK_URL|TRIAL_TERMS/.test(code(f)));
  ok("no tracking added: none of these files sends an event or holds a trial link", tracking.length === 0, tracking.join(", "));
  const storage = FILES.filter((f) => /localStorage|sessionStorage/.test(code(f)));
  ok("no storage key touched: none of these files reads or writes localStorage itself", storage.length === 0, storage.join(", "));
  const routes = FILES.flatMap((f) => [...code(f).matchAll(/href=(?:"|\{`)(\/[^"`}$]*)/g)].map((m) => m[1]));
  ok("every link on these pages goes to a route that already exists", routes.every((r) => ["/", "/review", "/terms", "/privacy", "/unlock", "/practice-test", "/how-it-works"].includes(r) || r === "/sets/" || r === "/courses/" || /^\/(sets|courses|preview|passages|cross-text|grammar|strategy)\/$/.test(r)), [...new Set(routes)].join(" "));
}

// ---------- the paywall is said once, and never inside a locked item ----------
{
  const lists = ["components/CategoryList.js", "components/PassageList.js", "components/GrammarList.js"];
  ok("each course section renders its paywall card at one place, behind a once-only guard", lists.every((f) => count(code(f), /<Paywall \/>/g) === 1 && /paywallShown/.test(code(f)) && /if \(paywallShown \|\| !ready \|\| subscribed\) return null;/.test(code(f))));
  const cross = code("components/CrossTextList.js");
  ok("the cross-text block adds one only when the Passages tab has none of its own", count(cross, /<Paywall \/>/g) === 1 && /showPaywall = false/.test(cross) && /let paywallShown = !showPaywall;/.test(cross) && /showPaywall=\{!passageLocked\}/.test(code(COURSE)));
  const practice = code("components/PracticeTestTab.js");
  ok("the practice test tab shows one paywall card, before its locked row", count(practice, /<Paywall \/>/g) === 1 && practice.indexOf("<Paywall />") < practice.indexOf("<LockedRow"));
  const price = FILES.filter((f) => /PRICE_LABEL|TRIAL_LABEL|\$1\.99|free trial|7-day/i.test(code(f)));
  ok("the price and the trial are named in exactly one component (components/Paywall.js)", JSON.stringify(price) === JSON.stringify(["components/Paywall.js"]), price.join(", "));
  const paywall = code("components/Paywall.js");
  ok("the paywall card says the price and the free trial once, and links to /unlock", /\{PRICE_LABEL\}\. \{TRIAL_LABEL\}\./.test(paywall) && count(paywall, /PRICE_LABEL/g) === 2 && /href="\/unlock"/.test(paywall) && !/<a /.test(paywall));
  const locked = code("components/LockedRow.js");
  ok("a locked row is a lock, the name, how much is behind it, and a quiet sample link, with no price", /<Lock /.test(locked) && /Locked: /.test(locked) && /Try a sample question/.test(locked) && !/purchase/.test(locked));
  const importers = FILES.filter((f) => /from "@\/components\/Paywall"/.test(code(f)));
  ok("only the section lists import the paywall card", JSON.stringify(importers.sort()) === JSON.stringify([...lists, "components/CrossTextList.js", "components/PracticeTestTab.js"].sort()), importers.join(", "));
}

// ---------- one obvious action ----------
{
  const home = code(HOME);
  const buttons = [...home.matchAll(/className=(?:"([^"]*vc-btn[^"]*)"|\{`([^`]*vc-btn[^`]*)`\})/g)].map((m) => m[1] || m[2]);
  const filled = buttons.filter((c) => !/vc-btn-quiet/.test(c) && !/\$\{hasDue \? "vc-btn-quiet" : ""\}/.test(c));
  ok("home: exactly one button is always filled, the due card's Review", filled.length === 1 && /href="\/review" className="vc-btn mt-3 w-full"/.test(home), `${filled.length}: ${filled.join(" | ")}`);
  ok("home: the time-of-day card goes quiet while words are due, and the pick-a-course buttons are never filled", count(home, /\$\{hasDue \? "vc-btn-quiet" : ""\}/g) === 2 && /className="vc-btn vc-btn-quiet w-full">\s*\{course\.title\}/.test(home));
  ok("home: Study is a small secondary link under Review", /DUE_FOR_REVIEW_ID\}\/study`\} className="vc-link">\s*Study\s*</.test(home));
  ok("home: still-learning is a compact row inside the due card (a card of its own only when nothing is due)", /\{stillLearning\.length > 0 && \(\s*<div className="mt-2 border-t pt-2"/.test(home) && /!hasDue && stillLearning\.length > 0/.test(home));
  const item = code("components/ItemCard.js");
  ok("a course item has one filled button and, at most, one quiet text link beside it", count(item, /vc-btn /g) === 1 && count(item, /className="vc-link/g) === 1);
  const cat = code("components/CategoryList.js");
  ok("a level offers Study first, then Take quiz, then Retake quiz; the other action is a link", /label: "Study" \}/.test(cat) && /label: "Take quiz" \}/.test(cat) && /label: "Retake quiz"/.test(cat) && /label: "Restudy"/.test(cat) && /label: "Quiz" \}/.test(cat));
  ok("a level shows one quiet status line: Not started, Studied, Done or the last score", ["Not started", "Studied", "Done", "Last quiz ${p.lastScore}/${p.lastQuizTotal}"].every((s) => cat.includes(s)));
  ok("the course progress is a thin bar and one short label, not a stats paragraph", />\s*\{done\} of \{total\} \{unit\}\s*</.test(code("components/CourseProgress.js")) && /unit="levels"/.test(code("components/CourseProgress.js")));
}

// ---------- the loading state still shows nothing but the wordmark ----------
{
  const loading = code("components/HomeLoading.js");
  const text = [...loading.matchAll(/>([^<>{}\n]*[A-Za-z][^<>{}\n]*)</g)].map((m) => m[1].trim()).filter(Boolean);
  ok("the loading shell's only text is the wordmark", JSON.stringify(text) === JSON.stringify(["Voco"]), text.join(" | "));
  ok("it is the home page's shell and cards, in the palette", /vc-loading vc-page/.test(loading) && /vc-surface p-4/.test(loading) && /min-h-\[44px\]/.test(loading));
}

// ---------- the browser suites say what the pages now say ----------
{
  const suites = ["verify1", "verify2", "verify3", "contrast"].map((n) => [n, read(`scripts/browser/${n}.mjs`)]);
  const stale = suites.flatMap(([n, src]) => ["due for review", "you're still learning", "You have full access to every course.", "Last night's words", "for full access to every course/g"].filter((s) => src.includes(s)).map((s) => `${n}: ${s}`));
  ok("no Playwright suite still waits for or asserts the old home and course copy", stale.length === 0, stale.join("; "));
  const course = suites.find(([n]) => n === "contrast")[1];
  ok("the contrast sweep covers the course page (non-subscriber and subscriber)", /"course \(SAT, non-subscriber\)"/.test(course) && /"course \(SAT, subscriber\)"/.test(course));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
