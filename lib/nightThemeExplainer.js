// "Has the 'why the night theme?' explainer already auto-shown THIS BROWSER
// SESSION?" — deliberately sessionStorage, not localStorage: it's per-tab and
// clears itself when the tab/window closes, which is exactly "once per fresh
// visit, not once ever." (See CLAUDE.md for why this trades a bit of
// repeat-visit friction for the explainer actually being seen again, instead
// of a once-ever flag that only ever helps the very first session.)
//
// Separate from lib/onboarding.js's voco_onboarded_v1, which is permanent
// (localStorage) and gates the full-screen first-visit intro, not this modal.

const KEY = "voco_night_theme_seen_session_v1";

export function hasSeenThisSession() {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch (e) {
    // Storage blocked (e.g. some private modes) — treat as "seen" so it
    // doesn't pop on every single page view, same fallback as onboarding.js.
    return true;
  }
}

export function markSeenThisSession() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch (e) {
    // fail silently
  }
}
