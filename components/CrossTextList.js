"use client";

import { getScoreTier } from "@/lib/scoreTier";
import { countPassagesCompleted } from "@/lib/passageProgress";
import { isPassageLocked } from "@/lib/purchase";
import ItemCard from "@/components/ItemCard";
import LockedRow from "@/components/LockedRow";
import Paywall from "@/components/Paywall";

// A second, clearly-labeled block within the "Passages" tab (not a new tab) listing
// Cross-Text Connections pairs (lib/satCrossText.js) — one card per pair, mirroring
// components/PassageList.js (same progress store, same gating, same light card), since a pair
// is tracked and gated identically to a single passage. `ready` is false until localStorage
// has been read, so nothing shows as locked (or completed) prematurely.
//
// The Passages tab shows ONE paywall card. PassageList places it before its first locked
// passage; this list only places one (`showPaywall`) when the course page finds that no
// passage is locked, so the tab can never end up with two or none.
export default function CrossTextList({ pairs, records, subscribed, ready, showPaywall = false }) {
  if (!pairs || pairs.length === 0) return null;
  const completed = countPassagesCompleted(pairs, records);
  let paywallShown = !showPaywall;
  const paywallOnce = () => {
    if (paywallShown || !ready || subscribed) return null;
    paywallShown = true;
    return <Paywall />;
  };

  return (
    <div className="mt-8">
      <h2 className="text-base font-semibold">Cross-text connections</h2>
      <p className="vc-muted mt-0.5 mb-4 text-sm">
        {completed} of {pairs.length} done. Two passages, one question.
      </p>
      <div className="space-y-2">
        {pairs.map((pair) => {
          const locked = ready && isPassageLocked(pair.id, subscribed);
          const record = records[pair.id];
          const count = pair.questions.length;
          const meta = `${count} question${count !== 1 ? "s" : ""}`;
          const name = `${pair.passageA.title} & ${pair.passageB.title}`;

          if (locked) {
            return (
              <div key={pair.id} className="space-y-2">
                {paywallOnce()}
                <LockedRow name={name} meta={meta} sampleHref={`/preview/${pair.id}`} />
              </div>
            );
          }

          const tier = record && record.lastTotal > 0 ? getScoreTier(record.lastScore, record.lastTotal) : null;
          const done = tier === "perfect";
          return (
            <ItemCard
              key={pair.id}
              name={name}
              meta={meta}
              status={!record ? "Not started" : done ? "Done" : `Last quiz ${record.lastScore}/${record.lastTotal}`}
              done={done}
              primary={{ href: `/cross-text/${pair.id}`, label: record ? "Read again" : "Read both passages", quiet: done }}
            />
          );
        })}
      </div>
    </div>
  );
}
