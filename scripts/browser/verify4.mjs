// The courses learners can see (LIVE_COURSES in lib/liveCourses.js), in a real browser. Drives a RUNNING
// build, like the other suites here (see _env.mjs), and asks that build which courses are live, so it
// is right for whichever switch it was built with:
//   - every hidden course's URLs (its page, its levels, its "still learning" sets, its samples) are
//     redirects to the home screen, never a 404 or an empty page;
//   - every live course's page opens;
//   - with ONE course live: no course line or "Courses" heading on the first screen, a single card for
//     the course on the first screen and on the home screen, no "pick a course" choice, and the
//     wording says "SAT Vocab", not "every course" (/unlock, the paywall card, the sample page, the Terms).
// scripts/test-launch.mjs proves the same things on real builds without a browser; this is the look.
import { chromium } from "playwright-core";
import { BASE, launch, probeLiveCourses } from "./_env.mjs";
const wb = await import("../../lib/wordbanks.js");

const browser = await launch(chromium);
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`); };

const ids = wb.allCourses.map((c) => c.id);
const LIVE = await probeLiveCourses(ids);
const HIDDEN = ids.filter((id) => !LIVE.includes(id));
const ONE = LIVE.length === 1 ? wb.allCourses.find((c) => c.id === LIVE[0]) : null;
console.log(`live: ${LIVE.join(", ") || "(none)"}; hidden: ${HIDDEN.join(", ") || "(none)"}`);

async function fresh({ seed } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: "America/New_York" });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  if (seed) await page.addInitScript(seed);
  return { ctx, page };
}
// A selector for any link to a hidden course (one that matches nothing when none is hidden).
const hiddenLinks = HIDDEN.length ? HIDDEN.map((id) => `a[href="/courses/${id}"]`).join(", ") : "a[data-no-such-link]";
const bodyText = (page) => page.evaluate(() => document.body.innerText.replace(/\s+/g, " "));
// A returning device: some saved progress, and three words due for review.
const RETURNING = `if(!sessionStorage.getItem("seeded")){sessionStorage.setItem("seeded","1");
  localStorage.setItem("voco_progress_v1", JSON.stringify({ sets: { "agreement-support-1": { studiedAt: "2026-10-01", studiedTs: 1790000000000 } }, quizDates: [] }));
  const due = (box) => ({ box, maxBox: box, timesSeen: 2, lastResult: "incorrect", nextReviewDate: "2020-01-01" });
  localStorage.setItem("voco_word_srs_v1", JSON.stringify({ "agreement-support-1::confirm": due(1), "agreement-support-1::support": due(1), "agreement-support-1::agree": due(1) }));}`;

// ---- 1. a hidden course's URLs are redirects home
{
  const { ctx, page } = await fresh();
  for (const id of HIDDEN) {
    const course = wb.allCourses.find((c) => c.id === id);
    const cat = course.categories[0];
    const urls = [`/courses/${id}`, `/sets/${cat.levels[0].id}/study`, `/sets/${cat.levels[0].id}/quiz`, `/sets/${wb.missedWordsId(cat.id)}/study`, `/preview/${course.categories[course.categories.length - 1].id}`];
    const statuses = [];
    for (const u of urls) {
      const r = await ctx.request.get(BASE + u, { maxRedirects: 0 });
      statuses.push(`${r.status()}${(r.headers().location || "") === "/" ? "→/" : ""}`);
    }
    ok(`${course.title} (hidden): its page, a level's study and quiz, a "still learning" set and a sample page are all redirects to /`, statuses.every((s) => s === "307→/"), statuses.join(" "));
    await page.goto(BASE + urls[1], { waitUntil: "networkidle" });
    ok(`${course.title} (hidden): opening a level link lands on the home screen, not a "doesn't exist" page`, new URL(page.url()).pathname === "/" && !/doesn't exist/.test(await bodyText(page)));
  }
  await ctx.close();
}

// ---- 2. every live course opens
{
  const { ctx, page } = await fresh();
  for (const id of LIVE) {
    const course = wb.allCourses.find((c) => c.id === id);
    await page.goto(`${BASE}/courses/${id}`, { waitUntil: "networkidle" });
    ok(`${course.title} (live): its page opens`, await page.getByRole("heading", { name: course.title, exact: true }).isVisible());
  }
  await ctx.close();
}

// ---- 3. one course live: the first screen, the home screen and the wording
if (ONE) {
  {
    const { ctx, page } = await fresh();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    ok("first screen: no course line under the question", (await page.getByText(/\bcourses: /).count()) === 0);
    ok("first screen: no \"Courses\" heading, and one card for the course", (await page.getByRole("heading", { name: "Courses", exact: true }).count()) === 0 && (await page.locator(`a[href="/courses/${ONE.id}"]`).count()) === 1);
    ok("first screen: no hidden course is linked", (await page.locator(hiddenLinks).count()) === 0);
    await ctx.close();
  }
  {
    const { ctx, page } = await fresh({ seed: RETURNING });
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForSelector("text=/words? due/", { timeout: 5000 }).catch(() => {});
    const t = await bodyText(page);
    ok("home screen: no \"Courses\" heading, no list, no \"pick a course\"", !/\bCourses\b/.test(t) && !/pick a course/i.test(t) && (await page.getByRole("heading", { name: "Courses", exact: true }).count()) === 0);
    ok("home screen: the course is one card that opens its page", (await page.locator(`a[href="/courses/${ONE.id}"]`).count()) === 1 && (await page.getByRole("heading", { name: ONE.title, exact: true }).isVisible()));
    ok("home screen: no hidden course is named or linked", HIDDEN.every((id) => !t.includes(wb.allCourses.find((c) => c.id === id).title)) && (await page.locator(hiddenLinks).count()) === 0);
    ok("home screen: no horizontal overflow at 390px", await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await ctx.close();
  }
  {
    const { ctx, page } = await fresh();
    await page.goto(BASE + "/unlock", { waitUntil: "networkidle" });
    await page.waitForSelector("text=/Unlock /", { timeout: 5000 }).catch(() => {});
    const t = await bodyText(page);
    ok(`/unlock: says "Unlock ${ONE.title}" and "full access to ${ONE.title}", and never "every course" or "all courses"`, t.includes(`Unlock ${ONE.title}`) && t.includes(`full access to ${ONE.title}`) && !/every course|all courses/i.test(t));
    await page.goto(`${BASE}/courses/${ONE.id}`, { waitUntil: "networkidle" });
    const card = await page.locator("aside[aria-label=Subscription]").innerText().catch(() => "");
    ok(`the paywall card says "Full access to ${ONE.title}", the price and the trial once`, card.includes(`Full access to ${ONE.title}`) && /\$1\.99\/month/.test(card) && /7-day free trial/.test(card) && !/every course/i.test(card), card.replace(/\s+/g, " "));
    await page.goto(`${BASE}/preview/${ONE.categories[ONE.categories.length - 1].id}`, { waitUntil: "networkidle" });
    await page.locator("main button").first().click();
    await page.waitForSelector("text=/for full access to /", { timeout: 5000 }).catch(() => {});
    const sample = await bodyText(page);
    ok(`the sample page says "for full access to ${ONE.title}" and "unlocks all of ${ONE.title}"`, sample.includes(`for full access to ${ONE.title}`) && sample.includes(`unlocks all of ${ONE.title}`) && !/every course/i.test(sample));
    await page.goto(BASE + "/terms", { waitUntil: "networkidle" });
    const terms = await bodyText(page);
    ok(`the Terms say "${ONE.title} has one free category" and nothing about several courses or every course`, terms.includes(`${ONE.title} has one free category`) && !/several courses|Each course has|every course/i.test(terms));
    await ctx.close();
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
