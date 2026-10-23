// Checks for the one switch that decides which courses learners can see (lib/liveCourses.js).
// Run with `npm run test:launch` (after `npm run build` to also check the pages and routes of
// the real build). Plain Node, no browser, no Stripe.
//
// What it proves:
//   1. The switch is one line, names real courses, and keeps SAT on.
//   2. Hidden means hidden, and nothing is deleted: for the switch as shipped, and for every
//      other choice of live courses (each hidden course turned on in turn, then all of them),
//      scripts/launch-checks.mjs checks the lists, lookups, word pools, sample questions, first
//      screen and wording that the screens are built from.
//   3. Nothing outside lib/wordbanks.js can read a hidden course, and no screen or component
//      hard-codes a course name or a "every course" phrase it should be getting from the list.
//   4. The real build: no course line, no "Courses" heading, no hidden course on the first
//      screen or in the Terms, and every URL of a hidden course is a redirect home (never a 404).
//   5. RE-LAUNCH: a scratch copy of the app, with a hidden course added to the switch (the one
//      line, edited), is built and checked. The course is back on the first screen, in the
//      Terms and on every route, the "every course" wording returns, and the courses still
//      hidden stay hidden.

import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, cpSync, symlinkSync, rmSync, writeFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import os from "node:os";
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
// Source without its comments, so a check on what a learner can see is not fooled by a note
// to the next developer.
const code = (f) => read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git"].includes(name)) continue;
    const full = path.join(dir, name);
    statSync(full).isDirectory() ? walk(full, out) : /\.js$/.test(name) && out.push(full);
  }
  return out;
}

const SWITCH_LINE = /^export const LIVE_COURSES = (\[[^\]\n]*\]);$/m;
const wb = await import("../lib/wordbanks.js");
const { allCourses, courses } = wb;
const allIds = allCourses.map((c) => c.id);

// ---------- 1. the switch ----------
const written = read("lib/liveCourses.js").match(SWITCH_LINE);
ok("the switch is one line: export const LIVE_COURSES = [...];", Boolean(written));
const REAL = written ? JSON.parse(written[1]) : [];
ok("it names real courses, each once", REAL.length > 0 && REAL.every((id) => allIds.includes(id)) && new Set(REAL).size === REAL.length, REAL.join(","));
ok("sat-vocab is live (the first screen's free question and the practice test live in it)", REAL.includes("sat-vocab"));
ok("this process uses the switch as written (no test override)", !process.env.VOCO_TEST_LIVE_COURSES && JSON.stringify(courses.map((c) => c.id)) === JSON.stringify(allIds.filter((id) => REAL.includes(id))));
const hidden = allCourses.filter((c) => !REAL.includes(c.id));

// ---------- 2. nothing is deleted ----------
{
  const words = (list) => list.flatMap((c) => c.categories.flatMap((cat) => cat.levels.flatMap((l) => l.words))).length;
  ok("every course is still in the repo: at least 4 courses, 15 categories and 537 words", allCourses.length >= 4 && wb.allCategories.length >= 15 && words(allCourses) >= 537, `${allCourses.length} courses, ${wb.allCategories.length} categories, ${words(allCourses)} words`);
  ok("each hidden course keeps its content (categories, levels and words)", hidden.every((c) => c.categories.length > 0 && words([c]) > 0), hidden.map((c) => `${c.id}:${words([c])}`).join(" "));
  ok("the app reads only the live courses (`courses`), and the full list exists for the validators and tests (`allCourses`)", courses.length === REAL.length && allCourses.length === allIds.length);
}

// ---------- 3. the same checks for every choice of live courses ----------
function runChecks(ids) {
  const r = spawnSync(process.execPath, ["--no-warnings", "--import", "./scripts/register-loader.mjs", "scripts/launch-checks.mjs"], {
    cwd: root,
    env: { ...process.env, VOCO_TEST_LIVE_COURSES: ids.join(",") },
    encoding: "utf8",
  });
  const lines = (r.stdout || "").split("\n").filter((l) => /^(PASS|FAIL) /.test(l));
  const summary = (r.stdout || "").match(/(\d+) passed, (\d+) failed/);
  if (!summary) ok(`the checks ran for ${ids.join(" + ")}`, false, ((r.stderr || "") + (r.stdout || "")).split("\n").slice(-4).join(" | "));
  return { lines, passed: summary ? Number(summary[1]) : 0, failed: summary ? Number(summary[2]) : 1 };
}
const scenarios = [
  { name: "as shipped", ids: REAL },
  ...hidden.map((c) => ({ name: `${c.title} launched`, ids: [...REAL, c.id] })),
  { name: "every course launched", ids: allIds },
];
for (const { name, ids } of scenarios) {
  const r = runChecks(ids);
  r.lines.filter((l) => l.startsWith("FAIL")).forEach((l) => console.log(l));
  ok(`${name} (${ids.join(" + ")}): ${r.passed} checks on the lists, lookups, word pools, samples, first screen and wording`, r.failed === 0 && r.passed >= 30, `${r.failed} failed`);
}

// ---------- 4. nothing else can see a hidden course, and no screen hard-codes what the list should say ----------
{
  const files = ["app", "components", "lib"].flatMap((d) => walk(path.join(root, d))).map((f) => path.relative(root, f));
  // Importing them is what matters (a local variable that happens to be called allCategories is fine).
  const importsAll = /import\s*\{[^}]*\ball(Courses|Categories)\b[^}]*\}\s*from\s*["'][^"']*wordbanks["']|import\s*\*\s*as\s+(\w+)\s+from\s*["'][^"']*wordbanks["'][\s\S]*\2\.all(Courses|Categories)\b/;
  const readers = files.filter((f) => f !== "lib/wordbanks.js" && importsAll.test(code(f)));
  ok("only lib/wordbanks.js reads the unfiltered course list (allCourses, allCategories)", readers.length === 0, readers.join(", "));

  const PLURAL = [/every course/i, /all courses/i, /several courses/i, /each course has/i, /four courses/i, /unlock every/i];
  const allowed = { "lib/courseScope.js": true, "app/terms/page.js": true };
  const hardcoded = files.filter((f) => !allowed[f] && PLURAL.some((re) => re.test(code(f))));
  ok("no screen or component writes \"every course\", \"all courses\", \"several courses\" or \"four courses\" by hand (lib/courseScope.js does)", hardcoded.length === 0, hardcoded.join(", "));
  const terms = code("app/terms/page.js");
  ok("the Terms page says them only in the branch for several live courses", /scope\.many \? " with several courses" : ""/.test(terms) && /scope\.many \? "Each course has one free category"/.test(terms) && /scope\.many \? ", in every course:" : ":"/.test(terms));

  const names = /everyday-vocabulary|professional-vocabulary|gre-vocab|Everyday Vocabulary|Professional Vocabulary|GRE Vocab/;
  const skip = ["lib/wordbanks.js", "lib/purchase.js", "lib/everydayVocabulary.js", "lib/professionalVocabulary.js", "lib/greVocabulary.js"];
  const named = files.filter((f) => !skip.includes(f) && names.test(code(f)));
  ok("no screen, component or helper names a hidden course (the courses come from the list; lib/purchase.js holds the free-set rules)", named.length === 0, named.join(", "));

  for (const f of ["app/page.js", "components/FirstVisit.js", "app/unlock/page.js", "app/terms/page.js"]) {
    ok(`${f} reads the live course list`, /import \{[^}]*\bcourses\b[^}]*\} from "@\/lib\/wordbanks"/.test(code(f)));
  }
  const home = code("app/page.js");
  ok("home: the \"Courses\" heading and the list exist only for several live courses; one course is a card on its own", /courses\.length > 1 \? \(\s*<>\s*<h2 className="vc-muted mb-3 mt-8 text-sm font-semibold">Courses<\/h2>/.test(home) && (home.match(/>Courses</g) || []).length === 1 && /<Link href=\{`\/courses\/\$\{courses\[0\]\.id\}`\} className="vc-surface vc-tap mt-6 p-5">/.test(home));
  ok("home: with one course there is no \"pick a course\" choice (a single button to its levels)", /tonight\.kind === "choose" && tonight\.courses\.length === 1/.test(home));
  const first = code("components/FirstVisit.js");
  ok("first screen: the course line and the \"Courses\" heading appear only with several live courses", /\{strip && \(\s*<Fold/.test(first) && /\{courses\.length > 1 && <h2 className="font-display text-lg mb-3">Courses<\/h2>\}/.test(first));

  const layouts = [["app/courses/[courseId]/layout.js", "courseId"], ["app/sets/[setId]/layout.js", "setId"], ["app/preview/[categoryId]/layout.js", "categoryId"]];
  for (const [f, param] of layouts) {
    const src = code(f);
    ok(`${f} sends a hidden course's URL home (a real redirect)`, /import \{ redirect \} from "next\/navigation"/.test(src) && new RegExp(`belongsToHiddenCourse\\(params\\.${param}\\)\\) redirect\\("/"\\)`).test(src) && /return children;/.test(src));
  }
}

// ---------- helpers for the built app ----------
const freePort = () => new Promise((resolve, reject) => {
  const s = net.createServer();
  s.listen(0, "127.0.0.1", () => { const { port } = s.address(); s.close(() => resolve(port)); });
  s.on("error", reject);
});
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function withServer(dir, fn) {
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", String(port)], {
    cwd: dir,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: "ignore",
  });
  const base = `http://127.0.0.1:${port}`;
  try {
    let up = false;
    for (let i = 0; i < 120 && !up; i++) {
      up = await fetch(base + "/", { redirect: "manual" }).then(() => true, () => false);
      if (!up) await pause(250);
    }
    if (!up) { ok("the built app starts", false, "no response from next start"); return; }
    await fn(base);
  } finally {
    server.kill("SIGTERM");
  }
}
const visit = (base, p) => fetch(base + p, { redirect: "manual" }).then((r) => ({ status: r.status, location: r.headers.get("location") }));
const plain = (html) => html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");

// The URLs that belong to one course: its page, its levels' study and quiz, a "still learning"
// set and the sample-question pages of its locked items.
function urlsOf(course) {
  const cat = course.categories[0];
  const free = course.categories.find((c) => c.levels.some((l) => l.level === 3));
  return [
    `/courses/${course.id}`,
    `/sets/${cat.levels[0].id}/study`,
    `/sets/${cat.levels[0].id}/quiz`,
    `/sets/${wb.missedWordsId(cat.id)}/study`,
    `/preview/${course.categories[course.categories.length - 1].id}`,
    `/preview/${free.levels.find((l) => l.level === 3).id}`,
  ];
}

// What a build of the app, with `liveIds` live, must look like on its static pages and routes.
async function checkBuild(title, dir, liveIds) {
  const liveList = allCourses.filter((c) => liveIds.includes(c.id));
  const hiddenList = allCourses.filter((c) => !liveIds.includes(c.id));
  const many = liveList.length > 1;
  const html = (name) => plain(readFileSync(path.join(dir, ".next/server/app", name), "utf8"));
  const home = html("index.html");
  const rawHome = readFileSync(path.join(dir, ".next/server/app/index.html"), "utf8");
  const termsText = html("terms.html");
  const counts = ["Zero", "One", "Two", "Three", "Four", "Five"];
  const strip = `${counts[liveList.length]} courses: ${liveList.map((c) => c.title.split(" ")[0]).join(" · ")}`;

  ok(`${title}: the first screen ${many ? "names the live courses in one line" : "has no course line"}`, many ? home.includes(strip) : !/\b(One|Two|Three|Four) courses:/.test(home), many ? strip : "");
  ok(`${title}: the first screen has ${many ? "a \"Courses\" heading and a card per live course" : "no \"Courses\" heading and one course card"}`, many ? /<h2[^>]*>Courses<\/h2>/.test(rawHome) && liveList.every((c) => rawHome.includes(`href="/courses/${c.id}"`)) : !/<h2[^>]*>Courses<\/h2>/.test(rawHome) && rawHome.includes(`href="/courses/${liveList[0].id}"`), "");
  ok(`${title}: the first screen links to no hidden course and names none`, hiddenList.every((c) => !rawHome.includes(`/courses/${c.id}`) && !home.includes(c.title)));
  ok(`${title}: the Terms name the free categories of the live courses only`, liveList.every((c) => termsText.includes(c.categories.find((cat) => cat.id === purchase.FREE_CATEGORY_BY_COURSE[c.id]).title)) && hiddenList.every((c) => !termsText.includes(c.categories.find((cat) => cat.id === purchase.FREE_CATEGORY_BY_COURSE[c.id]).title) && !termsText.includes(c.title)));
  const wording = { every: /\bevery course\b/i, several: /several courses/, each: /Each course has one free category/ };
  const wordingFound = Object.entries(wording).filter(([, re]) => re.test(termsText)).map(([k]) => k).sort().join(",");
  ok(`${title}: the Terms say ${many ? "\"several courses\", \"Each course has one free category\" and \"in every course\"" : "none of \"several courses\", \"each course\" or \"every course\" (one course: \"SAT Vocab has one free category\")"}`, many ? wordingFound === "each,every,several" : wordingFound === "" && termsText.includes(`${liveList[0].title} has one free category`), wordingFound);
  const pagesWithWording = ["index.html", "privacy.html", "how-it-works.html"].filter((n) => !many && (/\bevery course\b|\ball courses\b|\bseveral courses\b|\bfour courses\b/i.test(html(n))));
  ok(`${title}: no other page says "every course", "all courses" or "several courses" while it is untrue`, pagesWithWording.length === 0, pagesWithWording.join(", "));

  await withServer(dir, async (base) => {
    const back = [];
    for (const course of liveList) for (const p of urlsOf(course)) { const r = await visit(base, p); if (r.status !== 200) back.push(`${p}: ${r.status}`); }
    ok(`${title}: every route of every live course opens`, back.length === 0, back.join(", "));
    const gone = [];
    for (const course of hiddenList) for (const p of urlsOf(course)) { const r = await visit(base, p); if (!(r.status === 307 && new URL(r.location, base).pathname === "/")) gone.push(`${p}: ${r.status} ${r.location}`); }
    ok(`${title}: every URL of a hidden course is a redirect to the home screen (no 404, no blank page)`, gone.length === 0, gone.join(", "));
    const unknown = await Promise.all(["/courses/not-a-course", "/sets/not-a-level/study", "/preview/not-a-thing"].map((p) => visit(base, p)));
    ok(`${title}: an id that never existed is still not a 404 (the pages already handle it)`, unknown.every((r) => r.status === 200), unknown.map((r) => r.status).join(","));
  });
}
const purchase = await import("../lib/purchase.js");

// ---------- 5. the real build ----------
{
  const built = existsSync(path.join(root, ".next/BUILD_ID")) && existsSync(path.join(root, ".next/server/app/index.html"));
  if (built) await checkBuild("real build", root, REAL);
  else console.log("SKIP the real build's pages and routes: run `npm run build` first to produce .next");
}

// ---------- 6. RE-LAUNCH: turn a hidden course on in a scratch copy, build it, check it ----------
{
  const relaunch = hidden[0];
  if (!relaunch) {
    console.log("SKIP re-launch: every course is already live");
  } else {
    const ids = [...REAL, relaunch.id];
    const dir = mkdtempSync(path.join(os.tmpdir(), "voco-relaunch-"));
    try {
      for (const name of ["app", "components", "lib", "public"]) cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
      for (const name of ["next.config.mjs", "jsconfig.json", "postcss.config.js", "tailwind.config.js", "package.json"]) cpSync(path.join(root, name), path.join(dir, name));
      symlinkSync(path.join(root, "node_modules"), path.join(dir, "node_modules"), "dir");
      // The one line, edited.
      const file = path.join(dir, "lib/liveCourses.js");
      const before = readFileSync(file, "utf8");
      const after = before.replace(SWITCH_LINE, `export const LIVE_COURSES = ${JSON.stringify(ids)};`);
      writeFileSync(file, after);
      ok(`re-launch: ${relaunch.title} added to the switch by editing that one line`, after !== before && after.match(SWITCH_LINE)[1] === JSON.stringify(ids), after.match(SWITCH_LINE)[1]);
      const build = spawnSync(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "build"], { cwd: dir, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }, encoding: "utf8" });
      ok("re-launch: the app builds with the course on", build.status === 0, build.status === 0 ? "" : ((build.stdout || "") + (build.stderr || "")).split("\n").slice(-6).join(" | "));
      if (build.status === 0) await checkBuild(`re-launch (${ids.join(" + ")})`, dir, ids);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
