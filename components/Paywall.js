import Link from "next/link";
import { Lock } from "lucide-react";
import { PRICE_LABEL, TRIAL_LABEL } from "@/lib/purchase";
import { courseScope } from "@/lib/courseScope";

// The one paywall card on a course page: the price and the free trial, said once. Locked
// items below it (components/LockedRow.js) carry no price or trial text of their own. It
// links to /unlock, the page that explains what a subscription includes and holds the
// start-trial button (that button is a TrialLink, so its analytics placement is unchanged).
// This card is a plain link, not a TrialLink, so it adds no tracking of its own.
//
// Render it once per section, for a learner who is not subscribed, just before the first
// locked item (see the lists in components/).
export default function Paywall() {
  // "SAT Vocab" while one course is live, "every course" once there are several (lib/courseScope.js).
  const scope = courseScope();
  return (
    <aside aria-label="Subscription" className="vc-surface p-4">
      <div className="flex items-center gap-2">
        <Lock size={16} aria-hidden="true" className="vc-muted shrink-0" />
        <p className="text-base font-semibold">Full access to {scope.access}</p>
      </div>
      <p className="vc-muted mt-1 text-sm">
        {PRICE_LABEL}. {TRIAL_LABEL}.
      </p>
      <Link href="/unlock" className="vc-btn vc-btn-quiet mt-3 w-full">
        See what&apos;s included
      </Link>
    </aside>
  );
}
