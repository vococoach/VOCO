// Shared setup for the browser suites in this folder. They drive a real
// Chromium against a RUNNING build of the app, so they are not part of
// `npm test`. To run one on a clean checkout:
//   npm i --no-save playwright-core        (not a project dependency)
//   npm run build && npx next start -p 3000
//   node scripts/browser/<suite>.mjs
// Environment:
//   BASE_URL           where the app is running (default http://localhost:3000)
//   CHROMIUM_PATH      a Chromium/Chrome binary; default: the newest one under
//                      PLAYWRIGHT_BROWSERS_PATH (or /opt/pw-browsers), else
//                      Playwright's own download
//   SCREENSHOT_DIR     if set, suites that take screenshots write them there
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";

export const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
export const SHOTS = process.env.SCREENSHOT_DIR || null;
export const shot = async (page, name, opts = {}) => {
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name), ...opts });
};

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(root)) return undefined;
  const dirs = readdirSync(root).filter((d) => d.startsWith("chromium-")).sort().reverse();
  for (const d of dirs) {
    const p = path.join(root, d, "chrome-linux", "chrome");
    if (existsSync(p)) return p;
  }
  return undefined;
}

export async function launch(chromium) {
  return chromium.launch({ executablePath: findChromium(), args: ["--no-sandbox"] });
}

// Which of these courses the app under test shows. A live course's page opens (200); a course that is
// not live (lib/liveCourses.js) redirects home (307). Asked of the running app, not read from the repo,
// so the answer is about the build that is actually being driven.
export async function probeLiveCourses(courseIds) {
  const live = [];
  for (const id of courseIds) {
    const r = await fetch(`${BASE}/courses/${id}`, { redirect: "manual" });
    if (r.status === 200) live.push(id);
  }
  return live;
}

// For suites that check every course (verify2): say SKIP and stop, with a success exit, when the app under
// test hides some of them. Build with every course in LIVE_COURSES to run them; verify4 covers the
// single-course launch.
export async function requireAllCoursesLive(suite, courseIds) {
  const live = await probeLiveCourses(courseIds);
  const hidden = courseIds.filter((id) => !live.includes(id));
  if (hidden.length > 0) {
    console.log(`SKIP ${suite}: it checks every course, and the app at ${BASE} hides ${hidden.join(", ")} (LIVE_COURSES in lib/liveCourses.js). Build with every course live to run it.`);
    process.exit(0);
  }
}
