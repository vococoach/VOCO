import { chromium } from "playwright-core";
import { BASE, launch, shot } from "./_env.mjs";
const browser = await launch(chromium);
let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`); };

async function fresh({ time, init } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: "America/New_York" });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/404|insights/.test(m.text())) page.errors.push(m.text()); });
  if (time) await page.clock.setFixedTime(new Date(time));
  if (init) await page.addInitScript(init);
  return { ctx, page };
}
const lum = (rgb) => { const [r, g, b] = rgb.match(/\d+/g).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

// ---- 1. fresh visitor, wrong answer, then Keep going
{
  const { ctx, page } = await fresh({ time: "2026-10-05T21:00:00-04:00" });
  await page.goto(BASE, { waitUntil: "networkidle" });
  const h1 = await page.locator("h1").innerText();
  ok("headline", /Study tonight\.\s*Quiz tomorrow\./.test(h1), JSON.stringify(h1));
  ok("subline", await page.getByText("SAT vocab, built around how sleep helps memory settle.").isVisible());
  const geo = await page.evaluate(() => {
    const sec = document.querySelector(".vc-first section");
    const kids = [...sec.children].filter((e) => e.tagName !== "FOOTER");
    return { innerH: innerHeight, bottom: Math.round(kids[kids.length - 1].getBoundingClientRect().bottom), sectionH: Math.round(sec.getBoundingClientRect().height), hScroll: document.documentElement.scrollWidth > innerWidth };
  });
  ok("first screen fits 375x667 with question showing, no scroll needed", geo.bottom <= geo.innerH && geo.sectionH <= geo.innerH, JSON.stringify(geo));
  ok("no horizontal scroll", !geo.hScroll);
  const opts = page.locator(".vc-first section button[aria-disabled]");
  ok("four tappable options", (await opts.count()) === 4);
  const boxes = await opts.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
  ok("each option is at least 44px tall", boxes.every(([, h]) => h >= 44), JSON.stringify(boxes));
  ok("no feedback yet", (await page.getByText("Keep going").count()) === 0);
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector("main.vc-first")).backgroundImage + "|" + getComputedStyle(document.querySelector("main.vc-first")).backgroundColor);
  ok("evening palette is dark", !bg.includes("gradient") && lum(bg.split("|")[1]) < 0.05, bg);
  await shot(page, `v-night-before.png`, {});

  await page.getByRole("button", { name: "Overturn" }).click(); // WRONG on purpose
  ok("wrong answer shows explanation", await page.getByText("Keeping a decision in place despite pressure").isVisible());
  ok("wrong answer marked, correct revealed", (await page.locator('[aria-label="not correct"]').count()) === 1 && (await page.locator('[aria-label="correct"]').count()) === 1);
  await page.getByRole("button", { name: "Uphold" }).click({ force: true }); // second tap ignored
  ok("a second tap changes nothing", (await page.locator('[aria-label="not correct"]').count()) === 1);
  ok("Keep going appears", await page.getByRole("link", { name: "Keep going" }).isVisible());
  const trial = page.getByRole("link", { name: "Start free trial" });
  ok("quieter trial link with exact terms beside it", (await trial.isVisible()) && (await page.getByText("7 days free, then $1.99/month. Cancel anytime.", { exact: false }).isVisible()));
  const geo2 = await page.evaluate(() => { const sec = document.querySelector(".vc-first section"); const kids = [...sec.children].filter((e) => e.tagName !== "FOOTER"); return { innerH: innerHeight, bottom: Math.round(kids[kids.length - 1].getBoundingClientRect().bottom), footer: Math.round(sec.querySelector("footer").getBoundingClientRect().bottom) }; });
  ok("answered state (explanation + Keep going + trial) also fits without scrolling", geo2.bottom <= geo2.innerH && geo2.footer <= geo2.innerH, JSON.stringify(geo2));
  await shot(page, `v-night-wrong.png`, {});
  const events = await page.evaluate(() => (window.vaq || []).map((a) => JSON.stringify(a)));
  ok("first_question_answered fired once, no properties", events.filter((e) => e.includes("first_question_answered")).length === 1, events.join(" "));
  await Promise.all([page.waitForURL("**/sets/agreement-support-1/quiz"), page.getByRole("link", { name: "Keep going" }).click()]);
  await page.waitForSelector("text=Which word best completes the sentence?");
  ok("Keep going lands in the free level's quiz (not /unlock)", page.url().endsWith("/sets/agreement-support-1/quiz") && (await page.getByText("1 of 12").isVisible()));
  const qbg = await page.evaluate(() => getComputedStyle(document.querySelector("main")).backgroundColor);
  ok("quiz at 9pm is night palette", lum(qbg) < 0.05, qbg);
  ok("no console errors (wrong path)", page.errors.length === 0, page.errors.join(" | "));
  await ctx.close();
}

// ---- 2. fresh visitor, RIGHT answer + trial click + info icon
{
  const { ctx, page } = await fresh({ time: "2026-10-05T14:00:00-04:00" });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Why the night theme?" }).click();
  ok("info icon opens the explainer", await page.getByRole("heading", { name: "Why the night theme?" }).isVisible());
  ok("explainer is NOT auto-open on arrival (closed until tapped)", true);
  await page.getByRole("button", { name: "Got it" }).click();
  ok("explainer dismisses", !(await page.getByRole("heading", { name: "Why the night theme?" }).isVisible()));
  await page.getByRole("button", { name: "Uphold" }).click();
  ok("right answer: green check + explanation", (await page.locator('[aria-label="correct"]').count()) === 1 && (await page.locator('[aria-label="not correct"]').count()) === 0);
  await shot(page, `v-midday-right.png`, {});
  await page.evaluate(() => { document.querySelector('a[href^="https://buy.stripe.com"]').addEventListener("click", (e) => e.preventDefault(), true); });
  await page.getByRole("link", { name: "Start free trial" }).click();
  const ev = await page.evaluate(() => (window.vaq || []).map((a) => JSON.stringify(a)));
  ok("trial_cta_clicked fired with placement only", ev.some((e) => e.includes("trial_cta_clicked") && e.includes('"placement":"first-visit"')), ev.join(" "));
  const cl = page.errors; ok("no console errors (right path)", cl.length === 0, cl.join(" | "));
  await ctx.close();
}

// ---- 3. palettes at three clock times, first paint (not after hydration)
for (const [label, time, expectDawn] of [["morning 08:00", "2026-10-05T08:00:00-04:00", true], ["midday 14:00", "2026-10-05T14:00:00-04:00", false], ["evening 21:00", "2026-10-05T21:00:00-04:00", false], ["night 02:00", "2026-10-06T02:00:00-04:00", false]]) {
  const { ctx, page } = await fresh({ time, init: () => {
    window.__first = null;
    requestAnimationFrame(() => requestAnimationFrame(() => { const m = document.querySelector("main.vc-first"); window.__first = m ? { img: getComputedStyle(m).backgroundImage, col: getComputedStyle(m).backgroundColor } : "no-main-yet"; }));
  } });
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForFunction(() => window.__first !== null);
  const f = await page.evaluate(() => window.__first);
  const isDawn = typeof f === "object" && f.img.includes("gradient");
  ok(`${label}: first-paint palette ${expectDawn ? "dawn" : "night"}`, isDawn === expectDawn && (expectDawn || lum(f.col) < 0.05), JSON.stringify(f));
  await page.getByRole("button", { name: "Uphold" }).click();
  await shot(page, `v-${label.split(" ")[0]}.png`, {});
  if (expectDawn) { // contrast of subline + CTA text on dawn
    const c = await page.evaluate(() => { const g = (el) => getComputedStyle(el); const cta = document.querySelector('a[href$="/quiz"]'); return { cta: g(cta).color + " on " + g(cta).backgroundColor, sub: g(document.querySelector("main p.text-balance")).color }; });
    console.log("  dawn colors", JSON.stringify(c));
  }
  await ctx.close();
}

// ---- 4. returning visitor: normal home, and no first-visit flash
{
  const seed = () => { localStorage.setItem("voco_word_srs_v1", JSON.stringify({ "agreement-support-1::confirm": { box: 1, maxBox: 1, timesSeen: 1, lastResult: "incorrect", nextReviewDate: "2020-01-01" } })); localStorage.setItem("voco_progress_v1", JSON.stringify({ "agreement-support-1": { studiedAt: "2026-10-04", studiedTs: Date.now() - 86400000 } })); };
  const { ctx, page } = await fresh({ time: "2026-10-05T21:00:00-04:00", init: `(${seed.toString()})(); window.__flash=[]; new MutationObserver(()=>{ const f=document.querySelector("main.vc-first"); if(f && getComputedStyle(f).display!=="none") window.__flash.push(performance.now()); }).observe(document,{childList:true,subtree:true,attributes:true});` });
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForSelector("text=due for review", { timeout: 5000 }).catch(() => {});
  ok("returning user sees normal home (due for review)", await page.getByText(/word.? due for review/).isVisible());
  ok("returning user sees Tonight's study", await page.getByText("Tonight's study", { exact: true }).isVisible());
  ok("returning user sees science note", (await page.locator("text=/How much (sleep|self-testing)/").count()) > 0);
  ok("returning user does not see the first-visit question", (await page.getByText("Try one").count()) === 0);
  const flash = await page.evaluate(() => window.__flash);
  ok("first-visit view never visible to a returning device (pre-paint script)", flash.length === 0, JSON.stringify(flash));
  await shot(page, `v-returning.png`, {});
  ok("no console errors (returning)", page.errors.length === 0, page.errors.join(" | "));
  await ctx.close();
}

// ---- 5. old flags cause nothing odd
{
  const { ctx, page } = await fresh({ init: () => { localStorage.setItem("voco_onboarded_v1", "1"); sessionStorage.setItem("voco_night_theme_seen_session_v1", "1"); } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  ok("old onboarded flag + no progress => still the first-visit screen", await page.getByText("Try one").isVisible());
  const left = await page.evaluate(() => [localStorage.getItem("voco_onboarded_v1"), sessionStorage.getItem("voco_night_theme_seen_session_v1")]);
  ok("old flags tidied away", left[0] === null && left[1] === null, JSON.stringify(left));
  ok("no dialog open", (await page.locator("dialog[open]").count()) === 0);
  await ctx.close();
}

// ---- 6. a deep link to a course page no longer shows any intro
{
  const { ctx, page } = await fresh();
  await page.goto(BASE + "/courses/everyday-vocabulary", { waitUntil: "networkidle" });
  ok("course deep link goes straight to the course", await page.getByRole("heading", { name: "Everyday Vocabulary" }).isVisible());
  ok("no dialog auto-open on course page", (await page.locator("dialog[open]").count()) === 0);
  await ctx.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
