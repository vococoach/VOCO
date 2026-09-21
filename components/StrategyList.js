"use client";

import Link from "next/link";
import { guideReadingMinutes } from "@/lib/satStrategy";

// The "Strategy" section of a course page: one card per written guide. Free to
// everyone — there is no lock state here, unlike vocabulary and passages.
export default function StrategyList({ guides }) {
  return (
    <div>
      <p className="text-xs text-[#9B97C4] mb-4">Short written guides. Free for everyone.</p>
      <div className="space-y-3">
        {guides.map((guide) => (
          <Link key={guide.id} href={`/strategy/${guide.id}`} className="block rounded-2xl p-4 bg-[#20223F]">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="font-display text-lg text-[#EDEBFF]">{guide.title}</h3>
              <span className="shrink-0 text-[10px] uppercase tracking-wide text-[#7BC9A0] border border-[#7BC9A066] rounded-full px-2 py-0.5 mt-1">
                Free
              </span>
            </div>
            <p className="text-sm text-[#9B97C4] mb-2">{guide.summary}</p>
            <p className="text-xs text-[#6E699B]">{guideReadingMinutes(guide)} min read</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
