"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { getScoreTier, TIERS } from "@/lib/scoreTier";
import { countPassagesCompleted } from "@/lib/passageProgress";
import { isPassageLocked, PRICE_LABEL, TRIAL_LABEL } from "@/lib/purchase";

// A second, clearly-labeled block within the "Passages" tab (not a new tab)
// listing Cross-Text Connections pairs (lib/satCrossText.js) — one card per
// pair, mirroring components/PassageList.js exactly (same progress store,
// same gating, same card layout), since a pair is tracked and gated
// identically to a single passage. `ready` is false until localStorage has
// been read, so nothing shows as locked (or completed) prematurely.
export default function CrossTextList({ pairs, records, subscribed, ready }) {
  if (!pairs || pairs.length === 0) return null;
  const completed = countPassagesCompleted(pairs, records);
  return (
    <div className="mt-8">
      <h2 className="font-display text-lg text-[#EDEBFF] mb-1">Cross-Text Connections</h2>
      <p className="text-xs text-[#9B97C4] mb-4">
        {completed} of {pairs.length} completed — two related passages, one question about how they connect.
      </p>
      <div className="space-y-3">
        {pairs.map((pair) => {
          const locked = ready && isPassageLocked(pair.id, subscribed);
          const record = records[pair.id];
          const tier = record && record.lastTotal > 0 ? getScoreTier(record.lastScore, record.lastTotal) : null;
          const tierStyle = tier ? TIERS[tier] : null;
          const count = pair.questions.length;

          return (
            <div key={pair.id} className="rounded-2xl p-4 bg-[#20223F]">
              <h3 className="font-display text-lg text-[#EDEBFF] mb-1">
                {pair.passageA.title} &amp; {pair.passageB.title}
              </h3>
              <p className="text-xs text-[#6E699B] mb-3">
                {pair.passageA.subject} · {count} question{count !== 1 ? "s" : ""}
              </p>

              {locked ? (
                <>
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
                  {/* One real sample question — shows the format before paying (app/preview). */}
                  <Link
                  href={`/preview/${pair.id}`}
                  className="mt-3 inline-flex items-center min-h-[40px] rounded-xl px-3.5 text-xs font-medium text-[#8B85FF] border border-[#8B85FF66]"
                >
                  Try a sample question
                </Link>
                </>
              ) : (
                <>
                  <p
                    className={`text-xs mb-3 ${tier ? "font-medium" : "text-[#6E699B]"}`}
                    style={tier ? { color: tierStyle.accent } : undefined}
                  >
                    {tier ? `${tierStyle.label} — ${record.lastScore}/${record.lastTotal}` : "Not started"}
                  </p>
                  <Link
                    href={`/cross-text/${pair.id}`}
                    className="block text-center text-sm rounded-xl px-3 py-2 font-medium"
                    style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
                  >
                    {record ? "Read again" : "Read both passages"}
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
