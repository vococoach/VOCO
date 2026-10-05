"use client";

import { PAYMENT_LINK_URL } from "@/lib/purchase";
import { trackEvent, EVENTS } from "@/lib/analytics";

// Every "start the free trial" link goes through here, so each one is counted
// the same way (trial_cta_clicked, tagged with where it sat) and none can be
// added without it. The trial terms line (TRIAL_TERMS in lib/purchase.js) must
// be shown beside any use of this — callers render it.
export default function TrialLink({ placement, children, ...props }) {
  return (
    <a href={PAYMENT_LINK_URL} onClick={() => trackEvent(EVENTS.trialCtaClicked, { placement })} {...props}>
      {children}
    </a>
  );
}
