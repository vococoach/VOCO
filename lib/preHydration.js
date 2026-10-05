// A few bytes of inline script, run in <head> before the first paint (see
// app/layout.js). It reads the clock and localStorage — which the server can't
// — and records the answers as attributes on <html>, so the stylesheet can
// paint the right thing immediately instead of waiting for React to hydrate:
//
//   data-phase="morning"  the learner's local clock is in the morning window
//                         (same hours as getPhase() in lib/timeOfDay.js), so
//                         the first-visit screen is painted in the dawn palette
//                         (THEME_CSS in lib/timeTheme.js) with no dark flash
//   data-returning="1"    this device already has saved progress (or a cached
//                         subscription), so the first-visit screen is hidden
//                         rather than flashing before the normal home replaces it
//
// The server-rendered HTML is always the first-visit view; this only keeps a
// returning visitor from seeing it, and a morning visitor from seeing it in the
// wrong colors. React still decides the real view after hydration
// (lib/visitor.js uses the identical rule). Any failure — blocked storage, no
// clock — just leaves both attributes unset, i.e. the default first-visit view.
import { MORNING_START_HOUR, MIDDAY_START_HOUR } from "./timeOfDay";
import { RETURNING_KEYS } from "./visitor";

export const PRE_HYDRATION_SCRIPT =
  "(function(){try{var d=document.documentElement,h=new Date().getHours();" +
  `if(h>=${MORNING_START_HOUR}&&h<${MIDDAY_START_HOUR})d.setAttribute("data-phase","morning");` +
  `var k=${JSON.stringify(RETURNING_KEYS)},s=window.localStorage;` +
  'for(var i=0;i<k.length;i++){var v=s.getItem(k[i]);if(v&&v!=="{}"&&v!=="[]"){d.setAttribute("data-returning","1");break}}' +
  "}catch(e){}})();";
