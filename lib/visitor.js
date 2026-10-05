// "Is this a first-time visitor?" — decided by what's on the device, because
// there are no accounts. A device with any saved progress, or a cached
// subscription, is a returning visitor and sees the normal home screen (review,
// tonight's study); a device with none of it sees the first-visit screen.
//
// Not a flag of its own: it's derived, so "Reset progress on this device"
// really does start the device over, and nothing can get out of step with the
// progress it describes. The inline script in lib/preHydration.js applies the
// identical rule before first paint.

import { SAVED_PROGRESS_KEYS } from "./progress";
import { CUSTOMER_KEY } from "./purchase";

export const RETURNING_KEYS = [...SAVED_PROGRESS_KEYS, CUSTOMER_KEY];

export function isReturningVisitor() {
  if (typeof window === "undefined") return false;
  try {
    return RETURNING_KEYS.some((key) => {
      const value = window.localStorage.getItem(key);
      return Boolean(value) && value !== "{}" && value !== "[]";
    });
  } catch (e) {
    // Storage blocked: nothing can be remembered, so every visit is a first one.
    return false;
  }
}

// Keeps <html data-returning> in step with the real answer. The inline script
// in lib/preHydration.js sets it before first paint (so a returning device sees
// the loading state, not the first-visit view); once React has the real answer
// it is re-applied here, so the two can't disagree afterwards — for example when
// "Reset progress on this device" turns a returning device back into a new
// visitor, which must show the first-visit screen again instead of staying
// hidden by a stale attribute.
export function setReturningAttribute(returning) {
  if (typeof document === "undefined") return;
  try {
    if (returning) document.documentElement.setAttribute("data-returning", "1");
    else document.documentElement.removeAttribute("data-returning");
  } catch (e) {
    // nothing to sync
  }
}

// Flags left behind by features that no longer exist (the two-slide onboarding
// and the auto-opening "why the night theme?" dialog). Nothing reads them any
// more; this just tidies them away so they can't sit in someone's storage
// forever. Safe to call any number of times.
const LEGACY_LOCAL_KEYS = ["voco_onboarded_v1"];
const LEGACY_SESSION_KEYS = ["voco_night_theme_seen_session_v1"];

export function clearLegacyFlags() {
  if (typeof window === "undefined") return;
  try {
    LEGACY_LOCAL_KEYS.forEach((key) => window.localStorage.removeItem(key));
    LEGACY_SESSION_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
  } catch (e) {
    // blocked storage — nothing to tidy
  }
}
