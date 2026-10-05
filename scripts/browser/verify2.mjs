import { chromium } from "playwright-core";
import { BASE, launch, shot } from "./_env.mjs";
const wb = await import("../../lib/wordbanks.js");
const purchase = await import("../../lib/purchase.js");
const flat = wb.getAllWordsFlat();
const isLockedWord = (w) => purchase.isLevelLocked(w.categoryId, w.levelNumber, false);
const lockedSentences = flat.filter(isLockedWord).map((w) => w.quiz.sentence);
const freeSentences = new Set(flat.filter((w) => !isLockedWord(w)).map((w) => w.quiz.sentence));
const lockedFacts = flat.filter(isLockedWord).map((w) => w.fact);

const browser = await launch(chromium);
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`); };
const CLOCK = "2026-10-05T21:00:00-04:00";

async function ctxWith(seed, { sub } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, timezoneId: "America/New_York" });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  await page.clock.setFixedTime(new Date(CLOCK));
  // Record every piece of text that is ever in the DOM, so "never rendered" is checkable, not just "not showing at the end".
  await page.addInitScript(() => {
    window.__text = "";
    const grab = () => { window.__text += "\n" + (document.body ? document.body.innerText : ""); };
    new MutationObserver(grab).observe(document, { childList: true, subtree: true, characterData: true });
  });
  if (seed) await page.addInitScript(seed);
  if (sub) await page.addInitScript(sub);
  return { ctx, page };
}
const subSeed = (status, checkedAt) => `localStorage.setItem("voco_customer_id_v1","cus_test_123"); localStorage.setItem("voco_subscription_status_v1", JSON.stringify({status:${JSON.stringify(status)},cancelAt:null,checkedAt:${JSON.stringify(checkedAt)}}));`;
const TODAY = "2026-10-05";

// ---------------- A. non-subscriber, direct URLs ----------------
const lockedUrls = [
  "/sets/agreement-support-3/study", "/sets/agreement-support-3/quiz", "/sets/agreement-support-4/study", "/sets/agreement-support-4/quiz",
  "/sets/precise-description-3/quiz", "/sets/meetings-negotiation-3/study", "/sets/positive-charge-3/quiz",
  "/sets/disagreement-refutation-1/study", "/sets/disagreement-refutation-1/quiz", "/sets/emotional-nuance-2/quiz", "/sets/strategy-decisions-3/study",
  "/sets/negative-charge-1/quiz", "/sets/tone-attitude-4/quiz",
  "/sets/disagreement-refutation-missed-words/study", "/sets/disagreement-refutation-missed-words/quiz",
  "/passages/tide-pool-census", "/passages/the-farrow-map", "/cross-text/xt-stone-ring-alignment",
  "/grammar/boundaries-1", "/grammar/form-structure-sense-1", "/grammar/transitions-1", "/grammar/rhetorical-synthesis-1", "/practice-test",
];
for (const u of lockedUrls) {
  const { ctx, page } = await ctxWith();
  await page.goto(BASE + u, { waitUntil: "domcontentloaded" });
  const redirected = await page.waitForURL("**/unlock", { timeout: 8000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(150);
  const seen = await page.evaluate(() => window.__text || "");
  const leaked = [...lockedSentences, ...lockedFacts].find((t) => seen.includes(t.slice(0, 40)));
  ok(`non-subscriber ${u} -> /unlock, nothing of it ever rendered`, redirected && !leaked && page.errors.length === 0, leaked ? "LEAKED: " + leaked.slice(0, 50) : page.errors.join("|"));
  await ctx.close();
}
const openUrls = ["/sets/agreement-support-1/study", "/sets/agreement-support-2/quiz", "/sets/precise-description-2/study", "/sets/meetings-negotiation-1/quiz", "/sets/positive-charge-2/quiz", "/strategy/" + wb.courses[0].guides[0].id];
for (const u of openUrls) {
  const { ctx, page } = await ctxWith();
  await page.goto(BASE + u, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  ok(`non-subscriber ${u} stays open (free)`, !page.url().includes("/unlock") && (await page.locator("main").innerText()).length > 40, page.url());
  await ctx.close();
}

// ---------------- B. seeded old records ----------------
const wid = (levelId, i = 0) => flat.filter((w) => w.levelId === levelId)[i].id;
const seedRecords = {
  [wid("agreement-support-1", 0)]: 1, [wid("agreement-support-1", 1)]: 1, [wid("agreement-support-2", 0)]: 1, // free
  [wid("agreement-support-3", 0)]: 1, [wid("agreement-support-3", 1)]: 1, [wid("agreement-support-4", 0)]: 1, // locked tiers of the free category
  [wid("precise-description-3", 0)]: 1, [wid("positive-charge-3", 0)]: 1,
  [wid("disagreement-refutation-1", 0)]: 1, [wid("tone-attitude-2", 0)]: 1, [wid("emotional-nuance-1", 0)]: 1, [wid("leadership-workplace-3", 0)]: 1, // locked categories
};
const FREE_COUNT = 3, TOTAL = Object.keys(seedRecords).length;
const seedSrs = `localStorage.setItem("voco_word_srs_v1", JSON.stringify(${JSON.stringify(Object.fromEntries(Object.keys(seedRecords).map((id) => [id, { box: 1, maxBox: 1, timesSeen: 2, lastResult: "incorrect", nextReviewDate: "2020-01-01" }])))}));
 localStorage.setItem("voco_progress_v1", JSON.stringify({sets:{"agreement-support-3":{studiedAt:"2026-10-04",studiedTs:${Date.parse("2026-10-04T21:00:00-04:00")}},"agreement-support-1":{studiedAt:"2026-10-01",studiedTs:${Date.parse("2026-10-01T21:00:00-04:00")}}},quizDates:[]}));`;
const SRS_BEFORE = JSON.stringify(Object.keys(seedRecords).sort());

async function sessionSentences(page, nextLabel) {
  const shown = [];
  for (let i = 0; i < 40; i++) {
    const sentence = await page.locator("main p.font-display").first().innerText().catch(() => null);
    if (!sentence) break;
    shown.push(sentence);
    await page.locator("main button").filter({ hasNot: page.locator("svg[aria-label]") }).first().click().catch(() => {});
    const btn = page.getByRole("button", { name: nextLabel });
    if (!(await btn.isVisible().catch(() => false))) break;
    const label = await btn.innerText();
    await btn.click();
    if (/Finish review/.test(label)) break;
  }
  return shown;
}
{
  const { ctx, page } = await ctxWith(seedSrs);
  await page.goto(BASE + "/review", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const head = await page.locator("main p.uppercase").first().innerText().catch(() => "");
  ok("non-subscriber /review session has only the free words", /review — 1 of 3/i.test(head), head);
  const seen = await page.evaluate(() => window.__text);
  ok("…and not one locked-tier sentence was ever on screen", !lockedSentences.some((t) => seen.includes(t.slice(0, 40))));
  const shown = await sessionSentences(page, /Next word|Finish review/);
  ok("every question served in /review is a free-tier question", shown.length === FREE_COUNT && shown.every((s) => freeSentences.has(s)), `${shown.length} shown`);
  const srsAfter = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("voco_word_srs_v1"))).sort());
  ok("saved progress for locked words is untouched (nothing deleted)", JSON.stringify(srsAfter) === SRS_BEFORE);
  await ctx.close();
}
{
  const { ctx, page } = await ctxWith(seedSrs);
  await page.goto(BASE + "/sets/agreement-support-missed-words/study", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const head = await page.locator("main p.uppercase").first().innerText().catch(() => "");
  const counter = await page.getByText(/\d+ of \d+/).first().innerText().catch(() => "");
  ok("Missed Words (study) for the free category holds only its free-tier words", /1 of 3/.test(counter), `${head} | ${counter}`);
  const seen = await page.evaluate(() => window.__text);
  ok("…none of its Advanced/Expert facts were ever shown", !lockedFacts.some((t) => seen.includes(t.slice(0, 40))));
  await ctx.close();
}
{
  const { ctx, page } = await ctxWith(seedSrs);
  await page.goto(BASE + "/sets/agreement-support-missed-words/quiz", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const label = await page.locator("main p.uppercase").first().innerText().catch(() => "");
  ok("Missed Words (quiz) for the free category: 3 questions, free tiers only", /of 3$/i.test(label.trim()), label);
  const seen = await page.evaluate(() => window.__text);
  ok("…no locked sentence on screen", !lockedSentences.some((t) => seen.includes(t.slice(0, 40))));
  await ctx.close();
}
{
  const { ctx, page } = await ctxWith(seedSrs);
  await page.goto(BASE + "/sets/due-for-review/study", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const counter = await page.getByText(/\d+ of \d+/).first().innerText().catch(() => "");
  ok("due-for-review study set holds only the 3 free words", /1 of 3/.test(counter), counter);
  const seen = await page.evaluate(() => window.__text);
  ok("…no locked fact on screen", !lockedFacts.some((t) => seen.includes(t.slice(0, 40))));
  await ctx.close();
}
{
  const { ctx, page } = await ctxWith(seedSrs);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const body = await page.locator("main").innerText();
  ok("home screen shows 3 words due (not 12)", /3 words due for review/.test(body), (body.match(/\d+ words? due for review/) || [""])[0]);
  ok("home still-learning card counts only free-tier words", /3 words you're still learning/.test(body), (body.match(/\d+ words? you're still learning/) || [""])[0]);
  ok("home 'still learning' lists only the free categories", !/Disagreement|Tone & Attitude|Emotional Nuance|Leadership/.test(body.split("still learning")[1] ? body.split("still learning")[1].split("Courses")[0] : ""));
  const tonight = await page.getByText("Tonight's study", { exact: true }).isVisible();
  ok("Tonight's study shows", tonight);
  const href = await page.locator('a:has-text("Start studying")').first().getAttribute("href").catch(() => null);
  ok("Tonight's study never points at a locked level", href && !/-(3|4)\/study$/.test(href) && !/(disagreement|degree|change|certainty|tone|emotional|persuasion|strategy|leadership|negative|neutral)/.test(href), href);
  await shot(page, `v2-home.png`, {fullPage: true });
  await ctx.close();
}
{
  // Morning: last night's words — studied a locked tier last night must not be featured
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, timezoneId: "America/New_York" });
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date("2026-10-05T08:00:00-04:00"));
  await page.addInitScript(seedSrs);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const body = await page.locator("main").innerText();
  ok("morning: 'Last night's words' does not feature the locked Advanced tier that was studied", !/Last night's words/.test(body) || /Foundational/.test(body), body.slice(0, 200).replace(/\n/g, " | "));
  await ctx.close();
}

// ---------------- C. course page, unlock, samples ----------------
{
  const { ctx, page } = await ctxWith();
  await page.goto(BASE + "/courses/sat-vocab", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const agree = await page.locator("main").innerText();
  const lockedTierCards = await page.locator('a[href^="/preview/agreement-support-"]').count();
  ok("SAT free category: its Advanced and Expert tiers show a lock + sample link", lockedTierCards === 2, `${lockedTierCards}`);
  ok("each locked tier shows the price + scope", (agree.match(/\$1\.99\/month for full access to every course/g) || []).length >= 7, `${(agree.match(/\$1\.99\/month for full access to every course/g) || []).length}`);
  ok("the Foundational/Intermediate cards of the free category are still normal (Study + Take quiz)", (await page.locator('a[href="/sets/agreement-support-1/study"]').count()) === 1 && (await page.locator('a[href="/sets/agreement-support-2/quiz"]').count()) === 1);
  ok("no Study/Quiz link at all for a locked tier", (await page.locator('a[href="/sets/agreement-support-3/study"], a[href="/sets/agreement-support-3/quiz"]').count()) === 0);
  await shot(page, `v2-course-sat.png`, {fullPage: true });
  for (const section of ["passages", "grammar", "practice-test"]) {
    await page.goto(`${BASE}/courses/sat-vocab?section=${section}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
    const t = await page.locator("main").innerText();
    ok(`SAT ${section} tab: everything locked, nothing free`, /Locked|Requires a subscription/.test(t) && !/\bFree\b/.test(t) && !/Read the passage|Start level|Take quiz/.test(t), "");
    if (section !== "practice-test") ok(`SAT ${section} tab offers sample questions`, (await page.locator('a[href^="/preview/"]').count()) >= 4);
  }
  await page.goto(`${BASE}/courses/sat-vocab?section=strategy`, { waitUntil: "networkidle" });
  ok("Strategy tab still free", (await page.locator('a[href^="/strategy/"]').count()) === 4);
  await ctx.close();
}
for (const [url, expectText] of [["/preview/agreement-support-3", "Advanced"], ["/preview/agreement-support-4", "Expert"], ["/preview/precise-description-3", "Advanced"], ["/preview/disagreement-refutation", "Disagreement"], ["/preview/boundaries", "Boundaries"], ["/preview/rhetorical-synthesis", "Rhetorical"], ["/preview/tide-pool-census", "Tide Pool"], ["/preview/xt-stone-ring-alignment", "Highland"], ["/preview/the-farrow-map", "Farrow"]]) {
  const { ctx, page } = await ctxWith();
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(250);
  const t = await page.locator("main").innerText();
  const btns = page.locator("main button");
  const n = await btns.count();
  await btns.nth(0).click();
  await page.waitForTimeout(150);
  const after = await page.locator("main").innerText();
  ok(`sample ${url}: real question, 4 options, feedback + $1.99 prompt + trial terms`, t.toLowerCase().includes(expectText.toLowerCase()) && n === 4 && /\$1\.99\/month for full access to every course/.test(after) && after.includes("7 days free, then $1.99/month. Cancel anytime.") && page.errors.length === 0, `${n} options ${page.errors.join("|")}`);
  if (url === "/preview/agreement-support-3") await shot(page, `v2-preview.png`, {fullPage: true });
  const stored = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("voco_") && !k.includes("subscription")));
  ok(`sample ${url} records nothing`, stored.length === 0, stored.join(","));
  await ctx.close();
}
for (const url of ["/preview/agreement-support-1", "/preview/agreement-support", "/preview/precise-description-2", "/preview/nope"]) {
  const { ctx, page } = await ctxWith();
  await page.goto(BASE + url, { waitUntil: "domcontentloaded" });
  const home = await page.waitForURL(BASE + "/", { timeout: 6000 }).then(() => true).catch(() => false);
  ok(`free/unknown ${url} has no sample -> home`, home);
  await ctx.close();
}
{
  const { ctx, page } = await ctxWith();
  await page.goto(BASE + "/unlock", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const t = await page.locator("main").innerText();
  console.log("--- /unlock pitch ---\n" + t.split("Start 7-day")[0].replace(/\n+/g, "\n") + "\n---");
  const exp = [flat.filter((w) => isLockedWord(w)).length];
  ok("/unlock: locked word count is computed from the data", t.includes(`${exp[0]} more words`), `${exp[0]}`);
  ok("/unlock: names the free tiers and the four free categories", t.includes("Foundational and Intermediate levels of Agreement & Support, Precise Description, Meetings & Negotiation, and Positive Charge stay free"));
  ok("/unlock: trial terms beside the button", t.includes("7 days free, then $1.99/month. Cancel anytime."));
  ok("/unlock: lists the locked Advanced/Expert of the free category", /Agreement & Support — Advanced and Expert/.test(t));
  await shot(page, `v2-unlock.png`, {fullPage: true });
  await ctx.close();
}

// ---------------- D. subscriber: everything opens; re-locks after cancellation ----------------
{
  for (const u of lockedUrls.filter((u) => !u.includes("missed-words"))) {
    const { ctx, page } = await ctxWith(null, { sub: subSeed("trialing", TODAY) });
    await page.goto(BASE + u, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    ok(`subscriber ${u} opens`, !page.url().includes("/unlock") && (await page.locator("main").innerText()).length > 60 && page.errors.length === 0, page.url());
    await ctx.close();
  }
  const { ctx, page } = await ctxWith(seedSrs, { sub: subSeed("active", TODAY) });
  await page.goto(BASE + "/review", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const head = await page.locator("main p.uppercase").first().innerText().catch(() => "");
  ok(`subscriber /review serves all ${TOTAL} seeded due words`, new RegExp(`1 of ${TOTAL}`,"i").test(head), head);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const body = await page.locator("main").innerText();
  ok("subscriber home: all due words, 'full access' footer + Manage subscription", new RegExp(`${TOTAL} words due for review`).test(body) && body.includes("You have full access to every course.") && body.includes("Manage subscription"));
  await page.goto(BASE + "/courses/sat-vocab", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  ok("subscriber: no locked tier cards on the SAT course page", (await page.locator('a[href^="/preview/"]').count()) === 0 && (await page.locator('a[href="/sets/agreement-support-3/quiz"]').count()) === 1);
  await ctx.close();
}
for (const u of ["/sets/agreement-support-3/quiz", "/sets/disagreement-refutation-1/study", "/review"]) {
  const { ctx, page } = await ctxWith(seedSrs, { sub: subSeed("canceled", TODAY) });
  await page.goto(BASE + u, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const seen = await page.evaluate(() => window.__text);
  if (u === "/review") {
    ok("after cancellation /review serves only the free words again", /1 of 3/i.test(await page.locator("main p.uppercase").first().innerText().catch(() => "")));
  } else {
    ok(`after cancellation ${u} re-locks -> /unlock`, page.url().includes("/unlock") && !lockedSentences.some((t) => seen.includes(t.slice(0, 40))) && !lockedFacts.some((t) => seen.includes(t.slice(0, 40))));
  }
  await ctx.close();
}
{
  // The real client reconcile path with a mocked Stripe answer: cached "trialing" from yesterday -> daily recheck says canceled.
  const { ctx, page } = await ctxWith(null, { sub: subSeed("trialing", "2026-10-04") });
  let called = 0;
  await page.route("**/api/subscription-status", (route) => { called++; return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "canceled", cancelAt: null }) }); });
  await page.goto(BASE + "/sets/agreement-support-3/quiz", { waitUntil: "domcontentloaded" });
  const kicked = await page.waitForURL("**/unlock", { timeout: 8000 }).then(() => true).catch(() => false);
  ok("mid-session: a daily recheck that says 'canceled' kicks a subscriber out of a locked quiz to /unlock", kicked && called >= 1, `recheck calls: ${called}`);
  await ctx.close();
}
{
  // Fail open on a Stripe error: cached trialing stays unlocked.
  const { ctx, page } = await ctxWith(null, { sub: subSeed("trialing", "2026-10-04") });
  await page.route("**/api/subscription-status", (route) => route.fulfill({ status: 500, contentType: "application/json", body: "{}" }));
  await page.goto(BASE + "/sets/agreement-support-3/quiz", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  ok("a failed Stripe check keeps access (fail open, as documented)", !page.url().includes("/unlock") && (await page.getByText("1 of 10").count()) > 0);
  await ctx.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
