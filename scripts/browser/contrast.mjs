import { chromium } from "playwright-core";
import { BASE, launch, shot } from "./_env.mjs";
const browser = await launch(chromium);
const CLOCKS = { morning: "2026-10-05T08:00:00-04:00", midday: "2026-10-05T14:00:00-04:00", evening: "2026-10-05T21:00:00-04:00" };
const SUB = `localStorage.setItem("voco_customer_id_v1","cus_t"); localStorage.setItem("voco_subscription_status_v1", JSON.stringify({status:"active",cancelAt:null,checkedAt:"2026-10-05"}));`;
const DUE = `(()=>{const r={}; ["agreement-support-1::confirm","agreement-support-1::support","agreement-support-1::agree"].forEach(id=>r[id]={box:1,maxBox:1,timesSeen:2,lastResult:"incorrect",nextReviewDate:"2020-01-01"}); localStorage.setItem("voco_word_srs_v1",JSON.stringify(r));})();`;

// Runs in the page: every visible button/link with text and a (blended) background; WCAG ratio of its text on that background.
const SWEEP = () => {
  const parse = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const blend = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
  const base = (el) => { // opaque colour behind an element (gradients: use the lighter end, the worse case for light-on-light is checked via both ends)
    let layers = [];
    for (let e = el.parentElement; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== "none") return [{ r: 255, g: 217, b: 176, a: 1 }, { r: 255, g: 239, b: 221, a: 1 }]; const c = parse(cs.backgroundColor); if (c.a > 0) { layers.push(c); if (c.a === 1) break; } }
    let b = { r: 255, g: 255, b: 255, a: 1 }; for (const l of layers.reverse()) b = blend(l, b); return [b];
  };
  const out = [];
  document.querySelectorAll("button, a").forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
    const text = (el.innerText || "").trim().replace(/\s+/g, " "); if (!text) return;
    const cs = getComputedStyle(el); const bg = parse(cs.backgroundColor); if (bg.a === 0) return; // only solid/tinted buttons (text-only links are listed separately)
    const fg = parse(cs.color);
    const worst = Math.min(...base(el).map((b) => { const bgf = blend(bg, b); const fgf = blend(fg, bgf); const l1 = Math.max(L(bgf), L(fgf)), l2 = Math.min(L(bgf), L(fgf)); return (l1 + 0.05) / (l2 + 0.05); }));
    out.push({ text: text.slice(0, 28), bg: cs.backgroundColor, fg: cs.color, ratio: Math.round(worst * 100) / 100, accent: /255, 155, 92|139, 133, 255/.test(cs.backgroundColor) });
  });
  return out;
};

const rows = []; // {screen, clock, text, ratio, accent}
async function run(screen, clockName, seed, drive) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 800 }, isMobile: true, timezoneId: "America/New_York" });
  const page = await ctx.newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  await page.clock.setFixedTime(new Date(CLOCKS[clockName]));
  await page.addInitScript(SUB); if (seed) await page.addInitScript(seed);
  const sweep = async (state) => { for (const x of await page.evaluate(SWEEP)) rows.push({ screen: `${screen} — ${state}`, clock: clockName, ...x }); };
  try { await drive(page, sweep); } catch (e) { rows.push({ screen: `${screen} ERROR`, clock: clockName, text: String(e.message).split("\n")[0], ratio: 0, accent: true }); }
  if (errs.length) rows.push({ screen: `${screen} PAGEERROR`, clock: clockName, text: errs[0], ratio: 0, accent: true });
  await ctx.close();
}
const nextBtn = (page) => page.getByRole("button", { name: /Next question|See results|Next word|Finish review/ });
async function answerAll(page, sweep, firstSweepLabel) {
  let first = true;
  for (let i = 0; i < 40; i++) {
    const opt = page.locator("main button").filter({ hasNotText: /Next|See results|Finish|Back|Share/ }).first();
    if (!(await opt.isVisible().catch(() => false))) break;
    await opt.click();
    if (first) { await sweep(firstSweepLabel); first = false; }
    const nb = nextBtn(page);
    if (!(await nb.isVisible().catch(() => false))) break;
    const label = await nb.innerText();
    await nb.click();
    if (/See results|Finish review/.test(label)) break;
  }
}
const screens = {
  "quiz": ["/sets/agreement-support-1/quiz", async (page, sweep) => { await page.goto(BASE + "/sets/agreement-support-1/quiz"); await page.waitForSelector("main button"); await answerAll(page, sweep, "answered"); await page.waitForTimeout(300); await sweep("results"); }],
  "study": ["", async (page, sweep) => { await page.goto(BASE + "/sets/agreement-support-1/study"); await page.waitForSelector("main"); await sweep("card"); for (let i = 0; i < 11; i++) await page.locator("main button").nth(1).click(); await sweep("last card (Done studying)"); await page.getByRole("button", { name: /Done studying/ }).click(); await page.waitForTimeout(300); await sweep("closing screen"); }],
  "review": ["", async (page, sweep) => { await page.goto(BASE + "/review"); await page.waitForSelector("main button"); await answerAll(page, sweep, "answered"); await page.waitForTimeout(300); await sweep("results"); }, DUE],
  "passage": ["", async (page, sweep) => { await page.goto(BASE + "/passages/tide-pool-census"); await page.waitForSelector("main button"); await answerAll(page, sweep, "answered"); await page.waitForTimeout(300); await sweep("results"); }],
  "cross-text": ["", async (page, sweep) => { await page.goto(BASE + "/cross-text/xt-stone-ring-alignment"); await page.waitForSelector("main button"); await answerAll(page, sweep, "answered"); await page.waitForTimeout(300); await sweep("results"); }],
  "grammar": ["", async (page, sweep) => { await page.goto(BASE + "/grammar/boundaries-1"); await page.waitForSelector("main button"); await answerAll(page, sweep, "answered"); await page.waitForTimeout(300); await sweep("results"); }],
  "practice test": ["", async (page, sweep) => {
    await page.goto(BASE + "/practice-test"); await page.getByRole("button", { name: /Begin Module 1/ }).waitFor({ timeout: 15000 }); await sweep("intro");
    await page.getByRole("button", { name: /Begin Module 1/ }).click(); await page.waitForTimeout(300); await sweep("module 1 question");
    for (let m = 1; m <= 2; m++) {
      for (let i = 0; i < 40; i++) { const sub = page.getByRole("button", { name: /Submit|Review and submit|Finish/ }); if (await sub.first().isVisible().catch(() => false)) break; const nx = page.getByRole("button", { name: /^Next/ }); if (!(await nx.isVisible().catch(() => false))) break; await nx.click(); }
      await sweep(`module ${m} last question`);
      await page.getByRole("button", { name: /Submit|Finish/ }).first().click(); await page.waitForTimeout(200); await sweep(`module ${m} submit confirm`);
      await page.getByRole("button", { name: /Submit|Yes|Confirm/ }).last().click(); await page.waitForTimeout(400);
      if (m === 1) { await sweep("transition"); await page.getByRole("button", { name: /Begin Module 2/ }).click(); await page.waitForTimeout(300); }
    }
    await sweep("results");
  }],
  "preview": ["", async (page, sweep) => { await page.goto(BASE + "/preview/disagreement-refutation"); }, null, true],
  "first-visit": ["", async (page, sweep) => { await page.goto(BASE + "/"); await page.getByRole("button", { name: "Uphold" }).click(); await sweep("answered"); }, null, true],
  "home (returning)": ["", async (page, sweep) => { await page.goto(BASE + "/"); await page.waitForSelector("text=due for review"); await sweep("home"); }, DUE],
};
const only = process.argv[2];
for (const [name, [, drive, seed, noSub]] of Object.entries(screens)) {
  if (only && !name.includes(only)) continue;
  for (const clock of Object.keys(CLOCKS)) {
    let d = drive;
    if (name === "preview") d = async (page, sweep) => { await page.goto(BASE + "/preview/disagreement-refutation"); await page.waitForSelector("main button"); await page.locator("main button").first().click(); await sweep("after answering"); };
    await run(name, clock, noSub ? `localStorage.clear();` : seed, d);
  }
}
// "noSub" screens must run as a non-subscriber: SUB is added first, so clear it.
const byScreen = {};
for (const r of rows) { const k = `${r.screen}`; (byScreen[k] ||= {}); (byScreen[k][r.clock] ||= []).push(r); }
let fails = 0;
for (const [screen, clocks] of Object.entries(byScreen)) {
  const cells = ["morning", "midday", "evening"].map((c) => { const rs = (clocks[c] || []); const acc = rs.filter((r) => r.accent); const mn = acc.length ? Math.min(...acc.map((r) => r.ratio)) : null; const all = rs.length ? Math.min(...rs.map((r) => r.ratio)) : null; return mn === null ? "—" : `${mn}`; });
  console.log(`${screen.padEnd(48)} accent-button min  morning ${cells[0].padEnd(6)} midday ${cells[1].padEnd(6)} evening ${cells[2]}`);
}
const bad = rows.filter((r) => r.accent && r.ratio < 4.5);
console.log("\nACCENT BUTTONS UNDER 4.5:1:", bad.length); bad.forEach((r) => console.log("  ", r.screen, r.clock, JSON.stringify(r.text), r.ratio));
const badOther = rows.filter((r) => !r.accent && r.ratio < 4.5 && !/ERROR/.test(r.screen));
console.log("OTHER SOLID/TINTED BUTTONS UNDER 4.5:1:", badOther.length); [...new Set(badOther.map((r) => `${r.screen} | ${r.clock} | ${r.text} | ${r.fg} on ${r.bg} = ${r.ratio}`))].slice(0, 400).forEach((l) => console.log("  ", l));
console.log("\nALL accent rows:"); const seen = new Set(); rows.filter((r) => r.accent).forEach((r) => { const k = `${r.screen}|${r.clock}|${r.text}`; if (!seen.has(k)) { seen.add(k); console.log("  ", r.screen, "|", r.clock, "|", JSON.stringify(r.text), "|", r.ratio); } });
await browser.close();
