"use client";

import { getScoreTier } from "@/lib/scoreTier";
import { countPassagesCompleted } from "@/lib/passageProgress";
import { isPassageLocked, FREE_PASSAGE_IDS } from "@/lib/purchase";
import { ProgressLine } from "@/components/CourseProgress";
import ItemCard from "@/components/ItemCard";
import LockedRow from "@/components/LockedRow";
import Paywall from "@/components/Paywall";

// The "Passages" section of a course page: one card per reading passage, with its own simple
// "N of M passages" count (tracked separately from vocabulary progress — see
// lib/passageProgress.js). One passage is free (the free sample of the passage layout); the
// rest are part of the subscription. Same light card as the vocabulary levels (components/
// ItemCard.js); a locked passage is a lock, its name and a sample link, and the one paywall
// card goes just before the first of them. `ready` is false until localStorage has been read,
// so nothing shows as locked (or completed) prematurely.
export default function PassageList({ passages, records, subscribed, ready }) {
  const completed = countPassagesCompleted(passages, records);
  let paywallShown = false;
  const paywallOnce = () => {
    if (paywallShown || !ready || subscribed) return null;
    paywallShown = true;
    return <Paywall />;
  };

  return (
    <div>
      <ProgressLine done={completed} total={passages.length} unit="passages" className="mb-4" />
      <div className="space-y-2">
        {passages.map((passage) => {
          const locked = ready && isPassageLocked(passage.id, subscribed);
          const record = records[passage.id];
          const count = passage.questions.length;
          const meta = `${count} question${count !== 1 ? "s" : ""}`;

          if (locked) {
            return (
              <div key={passage.id} className="space-y-2">
                {paywallOnce()}
                <LockedRow name={passage.title} meta={meta} sampleHref={`/preview/${passage.id}`} />
              </div>
            );
          }

          const tier = record && record.lastTotal > 0 ? getScoreTier(record.lastScore, record.lastTotal) : null;
          const done = tier === "perfect";
          return (
            <ItemCard
              key={passage.id}
              name={passage.title}
              meta={meta}
              badge={FREE_PASSAGE_IDS.includes(passage.id) ? "Free" : undefined}
              status={!record ? "Not started" : done ? "Done" : `Last quiz ${record.lastScore}/${record.lastTotal}`}
              done={done}
              primary={{ href: `/passages/${passage.id}`, label: record ? "Read again" : "Read the passage", quiet: done }}
            />
          );
        })}
      </div>
    </div>
  );
}
