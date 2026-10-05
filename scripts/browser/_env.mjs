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
