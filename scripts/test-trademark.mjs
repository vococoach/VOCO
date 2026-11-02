// Checks for the College Board notice and for how "SAT" is used on screen. Run with
// `npm run test:trademark`. Plain Node, no browser: it tests the wording, the shape of the shared
// component and of the pages that render it, and the source for any "SAT" written as a noun. The
// visual side (390 px wide, night and dawn, nothing moved, no new scrolling) was checked in a real
// browser. See "The College Board notice" in CLAUDE.md.
//
// The rules (CLAUDE.md, "Working rules"): every page that shows the mark carries the College Board
// notice, and "SAT" is only ever an adjective.

import { readFileSync, readdirSync, statSync } from "node:fs";
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
function walk(dir) {
  const out = [];
  for (const name of readdirSync(path.join(root, dir))) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
    const rel = `${dir}/${name}`;
    if (statSync(path.join(root, rel)).isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}

const { TRADEMARK_NOTICE } = await import("../lib/legal.js");
const { NIGHT, DAWN } = await import("../lib/timeTheme.js");

// ---------- the wording ----------
{
  ok("the notice names the mark with the registered sign and the College Board", /^SAT® is a registered trademark of the College Board, which /.test(TRADEMARK_NOTICE), TRADEMARK_NOTICE);
  ok("it is one plain sentence that says the College Board is not affiliated with and does not endorse Voco, with no em dash", /which is not affiliated with and does not endorse Voco\.$/.test(TRADEMARK_NOTICE) && !/[—!?;]/.test(TRADEMARK_NOTICE) && count(TRADEMARK_NOTICE, /\. /g) === 0);
  ok("it is the wording the home screen, the first screen, /unlock and the Terms already showed, unchanged", TRADEMARK_NOTICE === "SAT® is a registered trademark of the College Board, which is not affiliated with and does not endorse Voco.");
  ok("it stays one sentence of about a hundred characters (two lines from 360 to 390px wide, three at 320px, measured)", TRADEMARK_NOTICE.length <= 110, String(TRADEMARK_NOTICE.length));
  const shorter = [...walk("app"), ...walk("components"), ...walk("lib"), ...walk("scripts")].filter((f) => f !== "scripts/test-trademark.mjs" && /\.m?js$/.test(f) && /TRADEMARK_FOOTER/.test(read(f)));
  ok("there is one notice: the shorter TRADEMARK_FOOTER wording is gone everywhere", shorter.length === 0, shorter.join(", "));
}

// ---------- the shared component ----------
{
  const src = code("components/TrademarkNotice.js");
  ok("it shows TRADEMARK_NOTICE from lib/legal.js and types none of the words itself", /import \{ TRADEMARK_NOTICE \} from "@\/lib\/legal"/.test(src) && /\{TRADEMARK_NOTICE\}/.test(src) && !/College Board|registered trademark|endorse/i.test(src));
  ok("it is a footer element with a data-trademark-notice hook", /<footer\b/.test(src) && /data-trademark-notice/.test(src));
  ok("it is small and quiet: 12px, centred, snug, in the muted colour unless the page gives its own", /\btext-xs\b/.test(src) && /\btext-center\b/.test(src) && /\bleading-snug\b/.test(src) && /vc-muted/.test(src) && /color \? ""/.test(src));
  ok("its lines are balanced, so a narrow phone never splits \"College Board\" or strands the last two words", /\btext-balance\b/.test(src));
  ok("it stays in the flow: never fixed, sticky or absolute, so it cannot cover anything or follow the screen", !/\b(fixed|sticky|absolute|inset-\d|z-\d|top-\d|bottom-\d)\b/.test(src));
  ok("it adds space above itself only (one top margin), so it only lengthens a page at its end", /\bmt-5\b/.test(src) && !/\b(mb|my|pb|py|p)-\d/.test(src));
  ok("it is plain markup: no client directive, state or effects", !/use client|useState|useEffect|\buse[A-Z]\w*\(/.test(src));
}

// ---------- the pages that render it ----------
{
  const IMPORT = /import TrademarkNotice from "@\/components\/TrademarkNotice";/;
  const pages = {
    "app/courses/[courseId]/page.js": [/<TrademarkNotice \/>/, "no colour: it follows night and dawn through --vc-subtext"],
    "app/strategy/[guideId]/page.js": [/<TrademarkNotice color="#9B97C4" \/>/, "the page's own night muted colour"],
    "app/preview/[categoryId]/page.js": [/<TrademarkNotice color=\{theme\.subtextAA\} \/>/, "the theme's readable muted colour"],
    "app/practice-test/page.js": [/\{\(phase === "intro" \|\| phase === "results"\) && <TrademarkNotice color=\{theme\.subtextAA\} \/>\}/, "intro and results only"],
    "app/privacy/page.js": [/<TrademarkNotice color="#9B97C4" \/>/, "the page's own night muted colour"],
  };
  for (const [f, [re, what]] of Object.entries(pages)) {
    const src = code(f);
    ok(`${f} imports the notice and renders it once (${what})`, IMPORT.test(src) && count(src, /<TrademarkNotice\b/g) === 1 && re.test(src));
  }
  const course = code("app/courses/[courseId]/page.js");
  ok("on the course page it comes after every tab's content, outside every section block, so all five tabs show it", course.indexOf("<TrademarkNotice") > course.indexOf('section === "strategy"') && !/section === "[a-z-]+" && <TrademarkNotice/.test(course));
  const usesTheme = Object.keys(pages).filter((f) => /<TrademarkNotice color=\{theme\.subtextAA\}/.test(code(f)));
  ok("the two pages that follow the clock pass the theme's `subtextAA`, which night and dawn both define (the plain `subtext` is under 4.5:1 on dawn)", usesTheme.length === 2 && typeof NIGHT.subtextAA === "string" && typeof DAWN.subtextAA === "string", usesTheme.join(", "));

  // Quiet is not faint: each colour the notice can take reads at 4.5:1 or better on the page it sits on.
  const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  };
  const contrast = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (hi + 0.05) / (lo + 0.05);
  };
  const dawnStops = DAWN.pageCss.match(/#[0-9A-Fa-f]{6}/g);
  const combos = [
    ["night page, the course page (--vc-subtext)", NIGHT.subtextAA, [NIGHT.pageCss]],
    ["night page, the strategy guides and the privacy page (#9B97C4)", "#9B97C4", ["#1A1C3A"]],
    ["night page, the sample page and the practice test (subtextAA)", NIGHT.subtextAA, [NIGHT.pageCss]],
    ["dawn page, the course page, the sample page and the practice test (subtextAA)", DAWN.subtextAA, dawnStops],
  ];
  for (const [name, fg, bgs] of combos) {
    const worst = Math.min(...bgs.map((bg) => contrast(fg, bg)));
    ok(`readable: ${name} is at least 4.5:1`, worst >= 4.5, `${worst.toFixed(2)}:1`);
  }
  ok("the strategy and privacy colour is the night page's own muted text, not a new one", /text-\[#9B97C4\]/.test(code("app/strategy/[guideId]/page.js")) && /text-\[#9B97C4\]/.test(code("app/privacy/page.js")) && NIGHT.subtext === "#9B97C4" && /bg-\[#1A1C3A\]/.test(code("app/strategy/[guideId]/page.js")) && /bg-\[#1A1C3A\]/.test(code("app/privacy/page.js")));

  for (const f of ["app/page.js", "components/FirstVisit.js", "app/unlock/page.js", "app/terms/page.js"]) {
    const src = code(f);
    ok(`${f} still prints the same notice itself`,/import \{ TRADEMARK_NOTICE \} from "@\/lib\/legal";/.test(src) && /\{TRADEMARK_NOTICE\}/.test(src));
  }
}

// ---------- every page that shows the mark has a notice ----------
{
  const pages = walk("app").filter((f) => /(^|\/)page\.js$/.test(f));
  // A page shows the mark when it writes SAT, or prints the course name or tagline (which is
  // "SAT Vocab" while it is the live course), the scope wording built from it, or the promise.
  const SHOWS = /\bSAT\b|course\.title|course\.tagline|courseScope\(|\bPROMISE\b/;
  const showing = pages.filter((f) => SHOWS.test(code(f)));
  const missing = showing.filter((f) => !/<TrademarkNotice\b|\{TRADEMARK_NOTICE\}/.test(code(f)));
  ok("every page that shows SAT, the course name or the promise carries a College Board notice", missing.length === 0 && showing.length >= 8, `${showing.length} of ${pages.length} pages show it; missing: ${missing.join(", ") || "none"}`);
}

// ---------- "SAT" is only ever an adjective ----------
{
  // Anything a learner can read: the screens, the components, the content and the manifest.
  const sources = [...walk("app"), ...walk("components"), ...walk("lib")].filter((f) => f.endsWith(".js")).concat("public/manifest.webmanifest");
  // What may follow the word: SAT Vocab, SAT vocabulary, the Digital SAT exam, a predicted SAT
  // score, SAT questions, any SAT administration, a real Digital SAT domain, or the sign itself.
  const FOLLOWERS = new Set(["vocab", "vocabulary", "exam", "test", "score", "question", "questions", "administration", "domain"]);
  const nouns = [];
  for (const f of sources) {
    const src = f.endsWith(".js") ? code(f) : read(f);
    for (const m of src.matchAll(/\bSAT\b/g)) {
      const rest = src.slice(m.index + 3);
      if (rest.startsWith("®")) continue;
      const next = (rest.match(/^\s*([A-Za-z]+)/) || [])[1];
      if (next && FOLLOWERS.has(next.toLowerCase())) continue;
      nouns.push(`${f}: "...${src.slice(Math.max(0, m.index - 20), m.index + 24).replace(/\s+/g, " ")}..."`);
    }
  }
  ok("SAT is an adjective everywhere a learner can read it (SAT Vocab, SAT vocabulary, the Digital SAT exam), never a noun", nouns.length === 0, nouns.join(" | "));
  ok("the three strings that used it as a noun now say \"exam\"", /tagline: "Words in context for the Digital SAT exam\."/.test(code("lib/wordbanks.js")) && /matched to the Digital SAT exam's Words in Context/.test(code("lib/wordbanks.js")) && /the Digital SAT exam's Reading and Writing section/.test(code("lib/satStrategy.js")));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
