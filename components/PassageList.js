"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { getScoreTier, TIERS } from "@/lib/scoreTier";
import { countPassagesCompleted } from "@/lib/passageProgress";
import { isPassageLocked, FREE_PASSAGE_IDS, PRICE_LABEL, TRIAL_LABEL } from "@/lib/purchase";

// The "Passages" section of a course page: one card per reading passage, with
// its own simple "N of M passages completed" count (tracked separately from
// vocabulary progress — see lib/passageProgress.js). One passage is free (the
// free sample of the passage layout); the rest are part of the subscription.
// `ready` is false until localStorage has been read, so nothing shows as locked
// (or completed) prematurely.
export default function PassageList({ passages, records, subscribed, ready }) {
  const completed = countPassagesCompleted(passages, records);
  return (
    <div>
      <p className="text-xs text-[#9B97C4] mb-4">
        {completed} of {passages.length} passages completed
      </p>
      <div className="space-y-3">
        {passages.map((passage) => {
          const locked = ready && isPassageLocked(passage.id, subscribed);
          const free = FREE_PASSAGE_IDS.includes(passage.id);
          const record = records[passage.id];
          const tier = record && record.lastTotal > 0 ? getScoreTier(record.lastScore, record.lastTotal) : null;
          const tierStyle = tier ? TIERS[tier] : null;
          const count = passage.questions.length;

          return (
            <div key={passage.id} className="rounded-2xl p-4 bg-[#20223F]">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-display text-lg text-[#EDEBFF]">{passage.title}</h3>
                {free && (
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-[#7BC9A0] border border-[#7BC9A066] rounded-full px-2 py-0.5 mt-1">
                    Free
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E699B] mb-3">
                {passage.subject} · {count} question{count !== 1 ? "s" : ""}
              </p>

              {locked ? (
                <Link href="/unlock" className="block">
                  <span className="flex items-center gap-2 text-sm text-[#9B97C4]">
                    <Lock size={14} />
                    Locked
                  </span>
                  <span className="block text-xs font-medium text-[#8B85FF] mt-2">
                    {PRICE_LABEL} for full access to every course
                  </span>
                  <span className="block text-[10px] text-[#6E699B] mt-0.5">{TRIAL_LABEL}</span>
                </Link>
              ) : (
                <>
                  <p
                    className={`text-xs mb-3 ${tier ? "font-medium" : "text-[#6E699B]"}`}
                    style={tier ? { color: tierStyle.accent } : undefined}
                  >
                    {tier ? `${tierStyle.label} — ${record.lastScore}/${record.lastTotal}` : "Not started"}
                  </p>
                  <Link
                    href={`/passages/${passage.id}`}
                    className="block text-center text-sm rounded-xl px-3 py-2 font-medium"
                    style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
                  >
                    {record ? "Read again" : "Read the passage"}
                  </Link>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
