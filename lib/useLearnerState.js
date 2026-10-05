"use client";

import { useEffect, useState } from "react";
import { getAllWordsFlat } from "./wordbanks";
import { getStruggleWordIds } from "./progress";
import { isSubscribedCached, shouldRefreshStatus, refreshSubscriptionStatus, getCancelAt } from "./purchase";

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
