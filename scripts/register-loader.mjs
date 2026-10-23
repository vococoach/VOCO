import { register } from "node:module";

// VOCO_TEST_LIVE_COURSES (tests only): "all", or a comma list of course ids, replaces the one
// switch in lib/liveCourses.js for this process. Unset means the real switch.
const raw = (process.env.VOCO_TEST_LIVE_COURSES || "").trim();
const live = raw === "all" ? "all" : raw ? raw.split(",").map((id) => id.trim()).filter(Boolean) : null;
register("./loader-hooks.mjs", import.meta.url, { data: { live } });
