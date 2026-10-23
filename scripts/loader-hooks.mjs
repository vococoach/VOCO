// Lets plain Node import the app's own modules in the test scripts: the app
// writes extensionless relative imports ("./wordbanks") and "@/..." aliases,
// which Next resolves but Node's ESM loader doesn't. Registered by
// scripts/register-loader.mjs; used via `node --import ./scripts/register-loader.mjs`.
//
// It can also swap the one switch for which courses are live (lib/liveCourses.js) for this
// process only, so a test can look at the library as if other courses were on. The app never
// reads this; it is how the suites that check all of the content and every rule keep running
// against every course while only some are live, and how scripts/test-launch.mjs asks "what
// if this course launched?". `data.live` is "all", or a list of course ids; null leaves the
// real switch alone. See scripts/register-loader.mjs and scripts/register-loader-all-courses.mjs.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const liveCoursesUrl = pathToFileURL(path.join(root, "lib/liveCourses.js")).href;

let liveOverride = null;
export function initialize(data) {
  liveOverride = data && data.live ? data.live : null;
}

// A stand-in for lib/liveCourses.js with the same two exports.
function liveCoursesSource(live) {
  if (live === "all") return "export const LIVE_COURSES = []; export const isLiveCourseId = () => true;";
  return `export const LIVE_COURSES = ${JSON.stringify(live)}; export const isLiveCourseId = (id) => LIVE_COURSES.includes(id);`;
}

export async function resolve(specifier, context, nextResolve) {
  const result = await resolveApp(specifier, context, nextResolve);
  if (liveOverride && result.url === liveCoursesUrl) {
    return { url: `data:text/javascript,${encodeURIComponent(liveCoursesSource(liveOverride))}`, shortCircuit: true };
  }
  return result;
}

async function resolveApp(specifier, context, nextResolve) {
  // next/* has no "exports" map, so Node needs the extension Next adds itself.
  if (specifier === "next/server") return nextResolve("next/server.js", context);
  let target = null;
  if (specifier.startsWith("@/")) target = path.join(root, specifier.slice(2));
  else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:"))
    target = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
  if (target && !path.extname(target) && existsSync(`${target}.js`)) {
    return nextResolve(pathToFileURL(`${target}.js`).href, context);
  }
  return nextResolve(specifier, context);
}
