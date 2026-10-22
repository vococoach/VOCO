"use client";

import Link from "next/link";
import { guideReadingMinutes } from "@/lib/satStrategy";

// The "Strategy" section of a course page: one card per written guide. Free to everyone — there
// is no lock state here, unlike vocabulary and passages, so there is no paywall card either.
export default function StrategyList({ guides }) {
  return (
    <div className="space-y-2">
      {guides.map((guide) => (
        <Link key={guide.id} href={`/strategy/${guide.id}`} className="vc-surface vc-tap p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold">{guide.title}</h3>
            <span className="vc-muted shrink-0 pt-1 text-xs">{guideReadingMinutes(guide)} min read</span>
          </div>
          <p className="vc-muted mt-1 text-sm">{guide.summary}</p>
        </Link>
      ))}
    </div>
  );
}
