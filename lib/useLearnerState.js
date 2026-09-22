"use client";

import { useEffect, useState } from "react";
import { getAllWordsFlat } from "./wordbanks";
import { getStruggleWordIds } from "./progress";
import { isSubscribedCached, shouldRefreshStatus, refreshSubscriptionStatus, getCancelAt } from "./purchase";
import { hasOnboarded, markOnboarded } from "./onboarding";
import { markSeenThisSession as markNightThemeSeenThisSession } from "./nightThemeExplainer";

// Subscription state for a page: the cached answer immediately, then re-verified
// with Stripe in the background (at most once a day) — if that comes back
// different (e.g. a cancellation), the UI updates to match. A subscription can
// be genuinely active/trialing *and* already scheduled to end (Stripe's Customer
// Portal cancellation keeps access through the current period/trial rather than
// revoking it immediately) — cancelAt surfaces that instead of leaving it silent.
export function useSubscription() {
  const [subscribed, setSubscribed] = useState(false);
  const [cancelAt, setCancelAt] = useState(null);

  useEffect(() => {
    setSubscribed(isSubscribedCached());
    setCancelAt(getCancelAt());
    if (shouldRefreshStatus()) {
      refreshSubscriptionStatus().then((subscribedNow) => {
        setSubscribed(subscribedNow);
        setCancelAt(getCancelAt());
      });
    }
  }, []);

  return { subscribed, cancelAt };
}

// The first-visit onboarding gate, shared by every page that shows it (the home
// screen and each course page — anything a brand-new visitor could land on
// first). `onboarding` is null until localStorage has been read (the pages are
// server-rendered, so it can't be known earlier — hide the page until then so
// nothing flashes), then true (show the intro) or false. finishOnboarding()
// records the flag and returns to the page the visitor came for: the page just
// re-renders in place, so a deep link to a course lands on that course, not home.
export function useOnboarding() {
  const [onboarding, setOnboarding] = useState(null);

  useEffect(() => {
    setOnboarding(!hasOnboarded());
  }, []);

  function finishOnboarding() {
    markOnboarded();
    // The onboarding intro a brand-new visitor just finished already covers
    // the night-theme rationale (see Onboarding.js), so also count THIS
    // session as having seen NightThemeExplainer — otherwise it would
    // auto-pop again immediately, right on top of the intro that just closed.
    // A returning visitor's next fresh session is unaffected: this only runs
    // the one time onboarding itself runs.
    markNightThemeSeenThisSession();
    setOnboarding(false);
  }

  return { onboarding, finishOnboarding };
}

// How many words in each category are currently in box 1 ("still learning"),
// keyed by category id, across every course.
export function computeStruggleCounts() {
  const struggleIdSet = new Set(getStruggleWordIds());
  const counts = {};
  getAllWordsFlat().forEach((w) => {
    if (struggleIdSet.has(w.id)) counts[w.categoryId] = (counts[w.categoryId] || 0) + 1;
  });
  return counts;
}
