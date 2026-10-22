"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { MODULE_QUESTION_COUNT, MODULE_COUNT, TOTAL_QUESTIONS } from "@/lib/practiceTest";
import LockedRow from "@/components/LockedRow";
import Paywall from "@/components/Paywall";

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// The "Practice test" section of a course page: a timed, simulated Reading & Writing section
// pulling questions from vocabulary, passages, and grammar together (see lib/practiceTest.js).
// Entirely paid — no free attempt — so for a non-subscriber the whole tab is one locked row
// and the section's one paywall card, rather than a per-item lock the way vocabulary,
// passages and grammar have. Past attempts (lib/practiceTestProgress.js) are listed with a
// plain raw score and category breakdown — never anything resembling a predicted SAT score.
export default function PracticeTestTab({ attempts, subscribed, ready }) {
  if (!ready) return null;

  if (!subscribed) {
    return (
      <div className="space-y-2">
        <Paywall />
        <LockedRow
          name="Practice test"
          meta={`${TOTAL_QUESTIONS} questions`}
          note={`Timed, ${MODULE_COUNT} modules of ${MODULE_QUESTION_COUNT}. Mixes vocabulary, passages and grammar.`}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="vc-surface p-4">
        <div className="flex items-center gap-2">
          <Clock size={16} aria-hidden="true" className="shrink-0" style={{ color: "var(--vc-flame)" }} />
          <h3 className="text-base font-semibold">Practice test</h3>
        </div>
        <p className="vc-muted mt-1 text-sm">
          {TOTAL_QUESTIONS} questions in {MODULE_COUNT} timed modules of {MODULE_QUESTION_COUNT} ({"32 min each"}). You can skip
          ahead and come back before you submit a module.
        </p>
        <p className="vc-muted mt-1 text-sm">A raw score and a category breakdown. Not a predicted SAT score.</p>
        <Link href="/practice-test" className="vc-btn mt-3 w-full">
          {attempts.length > 0 ? "Start a new test" : "Start practice test"}
        </Link>
      </div>

      {attempts.length > 0 && (
        <div className="mt-6">
          <p className="vc-muted mb-2 text-sm">
            {attempts.length} attempt{attempts.length !== 1 ? "s" : ""} so far
          </p>
          <div className="space-y-2">
            {attempts
              .slice()
              .reverse()
              .map((a, i) => (
                <div key={i} className="vc-surface flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold">{formatDate(a.completedAt)}</p>
                    <p className="vc-muted mt-0.5 text-xs">
                      Vocab {a.byType.vocab.correct}/{a.byType.vocab.total} · Passages {a.byType.passages.correct}/
                      {a.byType.passages.total} · Grammar {a.byType.grammar.correct}/{a.byType.grammar.total}
                    </p>
                  </div>
                  <p className="text-base font-semibold">
                    {a.score}/{a.total}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
