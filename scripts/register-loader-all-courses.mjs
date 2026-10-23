import { register } from "node:module";

// The same loader, with EVERY course live. The suites that check all of the content and every
// rule (the validators, test:access, test:first-visit, test:pages) run through this, so the
// courses that are hidden at launch (lib/liveCourses.js) stay fully checked.
register("./loader-hooks.mjs", import.meta.url, { data: { live: "all" } });
