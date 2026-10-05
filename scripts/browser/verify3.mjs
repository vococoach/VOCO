import { chromium, devices } from "playwright-core";
import { BASE, launch, shot } from "./_env.mjs";
const browser = await launch(chromium);
let pass = 0, fail = 0; const ok = (n, c, x = "") => { c ? pass++ : fail++; console.log(`${c ? "PASS" : "FAIL"} ${n}${x ? "  — " + x : ""}`); };
const SEED = `if(!sessionStorage.getItem("seeded")){sessionStorage.setItem("seeded","1"); localStorage.setItem("voco_word_srs_v1", JSON.stringify({"agreement-support-1::confirm":{box:1,maxBox:1,timesSeen:1,lastResult:"incorrect",nextReviewDate:"2020-01-01"}}));}`;
const mk = async (opts = {}, init) => { const ctx = await browser.newContext({ ...devices["iPhone 13"], timezoneId: "America/New_York", ...opts }); const page = await ctx.newPage(); if (opts.time) await page.clock.setFixedTime(new Date(opts.time)); if (init) await page.addInitScript(init); return { ctx, page }; };
const body = (page) => page.evaluate(() => document.body.innerText);

// 1. the shell: content-free, header only
{
  const { ctx, page } = await mk({}, SEED); await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const shell = await page.evaluate(() => { const s = document.querySelector(".vc-loading"); return { shown: getComputedStyle(s).display, text: s.innerText.trim(), bg: getComputedStyle(s).backgroundColor, role: s.getAttribute("role"), busy: s.getAttribute("aria-busy") }; });
  ok("returning device: the loading state is shown at DOMContentLoaded", shell.shown === "block");
  ok("it contains only the Voco wordmark — no numbers, greetings, names or suggestions", shell.text === "Voco", JSON.stringify(shell.text));
  ok("it uses the home screen's own dark shell colour", shell.bg === "rgb(26, 28, 58)", shell.bg);
  ok("announced as a busy status to assistive tech", shell.role === "status" && shell.busy === "true");
  await ctx.close();
}
// 2. new visitor: never shown, even in the raw HTML with JS off
{
  const { ctx, page } = await mk({ javaScriptEnabled: false }); await page.goto(BASE, { waitUntil: "load" });
  const d = await page.evaluate(() => getComputedStyle(document.querySelector(".vc-loading")).display);
  ok("new visitor (no JS at all): loading state hidden, question visible", d === "none" && (await page.getByText("Try one").isVisible()));
  await ctx.close();
}
// 3. dawn: shell stays the dark shell and matches the real home (no colour flip at the swap)
{
  const { ctx, page } = await mk({ time: "2026-10-05T08:00:00-04:00" }, SEED); await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const a = await page.evaluate(() => ({ shell: getComputedStyle(document.querySelector(".vc-loading")).backgroundColor, body: getComputedStyle(document.body).backgroundColor, phase: document.documentElement.getAttribute("data-phase") }));
  await page.waitForSelector("text=due for review"); const home = await page.evaluate(() => getComputedStyle(document.querySelector("main")).backgroundColor);
  ok("morning, returning: shell colour equals the real home's colour (no flip at the swap)", a.shell === home && a.phase === "morning", `${a.shell} vs ${home}`);
  await ctx.close();
}
// 4. reduced motion: no pulse
{
  const { ctx, page } = await mk({ reducedMotion: "reduce" }, SEED); await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const an = await page.evaluate(() => getComputedStyle(document.querySelector(".vc-skeleton")).animationName);
  ok("prefers-reduced-motion: the placeholder does not animate", an === "none", an);
  await ctx.close();
  const { ctx: c2, page: p2 } = await mk({}, SEED); await p2.goto(BASE, { waitUntil: "domcontentloaded" });
  ok("otherwise it pulses (opacity only)", (await p2.evaluate(() => getComputedStyle(document.querySelector(".vc-skeleton")).animationName)) === "vc-pulse");
  await c2.close();
}
// 5. swap leaves nothing behind
{
  const { ctx, page } = await mk({}, SEED); await page.goto(BASE, { waitUntil: "networkidle" }); await page.waitForSelector("text=due for review");
  ok("after hydration the loading state and first-visit view are gone from the DOM", (await page.locator(".vc-loading, .vc-first").count()) === 0);
  ok("the real home is showing", /1 word due for review/.test(await body(page)));
  // 6. Reset progress on this device -> first-visit again (stale data-returning attribute must not hide it)
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: /Reset progress/ }).click(); await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({ attr: document.documentElement.getAttribute("data-returning"), first: !!document.querySelector(".vc-first") && getComputedStyle(document.querySelector(".vc-first")).display, ld: getComputedStyle(document.querySelector(".vc-loading")).display }));
  ok("Reset progress: returns to the first-visit screen (attribute cleared, question visible, loading hidden)", after.attr === null && after.first === "block" && after.ld === "none" && (await page.getByText("Try one").isVisible()), JSON.stringify(after));
  await page.reload({ waitUntil: "networkidle" });
  ok("…and a reload after Reset still shows the first-visit question", await page.getByText("Try one").isVisible());
  await ctx.close();
}
// 7. stale attribute with no saved data self-corrects after hydration
{
  const { ctx, page } = await mk({}, `document.documentElement.setAttribute("data-returning","1");`); await page.goto(BASE, { waitUntil: "networkidle" }); await page.waitForTimeout(500);
  ok("stale data-returning with nothing saved: corrected after hydration, question visible", (await page.evaluate(() => document.documentElement.getAttribute("data-returning"))) === null && (await page.getByText("Try one").isVisible()));
  await ctx.close();
}
// 8. first-visit flow still works end to end for a new device, no loading state at any time
{
  const { ctx, page } = await mk({}, `window.__ld=[]; new MutationObserver(()=>{const l=document.querySelector(".vc-loading"); if(l&&getComputedStyle(l).display!=="none") window.__ld.push(1)}).observe(document,{childList:true,subtree:true,attributes:true});`);
  await page.goto(BASE, { waitUntil: "load" }); await page.getByRole("button", { name: "Overturn" }).click();
  ok("new visitor: wrong answer shows feedback + Keep going", await page.getByRole("link", { name: "Keep going" }).isVisible());
  await Promise.all([page.waitForURL("**/sets/agreement-support-1/quiz"), page.getByRole("link", { name: "Keep going" }).click()]);
  ok("…Keep going lands in the free level", await page.getByText("1 of 12").isVisible());
  ok("…and the loading state was never visible at any point", (await page.evaluate(() => window.__ld || [])).length === 0);
  await ctx.close();
}
console.log(`\n${pass} passed, ${fail} failed`); await browser.close();
