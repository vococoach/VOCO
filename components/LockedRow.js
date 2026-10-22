import Link from "next/link";
import { Lock } from "lucide-react";

// A locked item on a course page: a lock and the item's name, how much is behind it, and a
// quiet link to one real sample question (app/preview). There is no price or trial text in
// here; the one paywall card (components/Paywall.js) says that once for the whole section.
// `note` is an optional short line; `sampleHref` is omitted for an item with no sample (the
// practice test).
export default function LockedRow({ name, meta, note, sampleHref }) {
  return (
    // The sample link is a 44px target with its text in the middle, so the card's own bottom
    // padding shrinks to keep the space under the text level with the space above the name.
    <div className={`vc-surface px-4 pt-4 ${sampleHref ? "pb-1" : "pb-4"}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="vc-muted flex min-w-0 items-start gap-2 text-base font-semibold">
          <Lock size={16} aria-hidden="true" className="mt-1 shrink-0" />
          <span>
            <span className="sr-only">Locked: </span>
            {name}
          </span>
        </span>
        <span className="vc-muted shrink-0 pt-1 text-xs">{meta}</span>
      </div>
      {note && <p className="vc-muted mt-1 text-sm">{note}</p>}
      {sampleHref && (
        <Link href={sampleHref} className="vc-link -ml-3 mt-1">
          Try a sample question
        </Link>
      )}
    </div>
  );
}
