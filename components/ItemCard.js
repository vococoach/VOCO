import Link from "next/link";
import { Check } from "lucide-react";

// One open item on a course page: a level, a passage, a pair of passages or a grammar level.
// Light on purpose: the name, a small size label ("12 words"), a quiet status line, and ONE
// primary button. The other action (restudy, or quiz without studying first) stays reachable
// as a quiet text link beside it, so nothing the old card offered is lost. A finished item
// (`done`) gets a check and an outlined button, because nothing is asked of the learner.
//
//   primary   { href, label, quiet? }   the one filled button (outlined when `quiet`)
//   secondary { href, label }           optional quiet text link
export default function ItemCard({ name, meta, badge, status, done = false, primary, secondary }) {
  return (
    <div className={`vc-surface p-4 ${done ? "vc-surface-done" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex min-w-0 items-start gap-2 text-base font-semibold">
          {done && <Check size={16} strokeWidth={3} aria-hidden="true" className="mt-1 shrink-0" style={{ color: "var(--vc-ok)" }} />}
          <span>{name}</span>
        </h3>
        <span className="vc-muted shrink-0 pt-1 text-xs">{meta}</span>
      </div>
      {(status || badge) && (
        <p className="vc-muted mt-0.5 text-sm">
          {status}
          {badge && <span className="ml-2 rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: "var(--vc-border)" }}>{badge}</span>}
        </p>
      )}
      <div className="mt-3 flex items-center gap-1">
        <Link href={primary.href} className={`vc-btn min-w-0 flex-1 ${primary.quiet ? "vc-btn-quiet" : ""}`}>
          {primary.label}
        </Link>
        {secondary && (
          <Link href={secondary.href} className="vc-link shrink-0">
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  );
}
