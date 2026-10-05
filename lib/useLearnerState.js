"use client";

import { useEffect, useState } from "react";
import { getAccessibleStruggleWordIds, countByCategory } from "./access";
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
  // False until the cached status has been read (localStorage is client-only).
  // `subscribed` is false in the meantime, so a screen that builds a list from
  // saved progress should wait for `known` — otherwise a subscriber would
  // briefly get the free-only list.
  const [known, setKnown] = useState(false);

  useEffect(() => {
    setSubscribed(isSubscribedCached());
    setCancelAt(getCancelAt());
    setKnown(true);
    if (shouldRefreshStatus()) {
      refreshSubscriptionStatus().then((subscribedNow) => {
        setSubscribed(subscribedNow);
        setCancelAt(getCancelAt());
      });
    }
  }, []);

  return { subscribed, cancelAt, known };
}

// How many words in each category are currently in box 1 ("still learning"),
// keyed by category id, across every course — counting only words in tiers this
// learner can open (lib/access.js), since the drill can't serve the others.
export function computeStruggleCounts(subscribed) {
  return countByCategory(getAccessibleStruggleWordIds(subscribed));
}
