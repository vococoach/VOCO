// One-time "has this device seen the first-visit onboarding?" flag.
//
// Deliberately its own localStorage key, NOT derived from progress data:
// "Reset progress on this device" (lib/progress.js resetProgress) must not
// bring the onboarding back, and an empty progress store doesn't mean a first
// visit (someone may have cleared it, or only browsed).

const KEY = "voco_onboarded_v1";

export function hasOnboarded() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch (e) {
    // Storage is blocked (e.g. some private modes), so we couldn't remember
    // that it was shown — better to skip it than nag on every single visit.
    return true;
  }
}

export function markOnboarded() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch (e) {
    // fail silently
  }
}
