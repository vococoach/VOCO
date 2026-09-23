"use client";

import Link from "next/link";
import { Lock, Clock } from "lucide-react";
import { getScoreTier, TIERS } from "@/lib/scoreTier";
import { PRICE_LABEL, TRIAL_LABEL } from "@/lib/purchase";
import { MODULE_QUESTION_COUNT, MODULE_COUNT, TOTAL_QUESTIONS } from "@/lib/practiceTest";

function formatDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// The "Practice Test" section of a course page: a timed, simulated Reading &
// Writing section pulling questions from vocabulary, passages, and grammar
// together (see lib/practiceTest.js). Entirely paid — no free attempt — so
// this whole panel shows a locked state for a non-subscriber, the same
// price/trial/unlock pattern as every other locked card in the app, rather
// than a per-item lock the way vocabulary/passages/grammar have. Past
// attempts (lib/practiceTestProgress.js) are listed with a plain raw score
// and category breakdown — never anything resembling a predicted SAT score.
export default function PracticeTestTab({ attempts, subscribed, ready }) {
  if (!ready) return null;

  if (!subscribed) {
    return (
      <div className="rounded-2xl p-5 bg-[#20223F] border border-[#ffffff1a] text-center">
        <Lock size={24} color="#8B85FF" className="mx-auto mb-3" />
        <p className="font-display text-lg text-[#EDEBFF] mb-1">Practice Test</p>
        <p className="text-sm text-[#9B97C4] mb-4">
          A timed, simulated Reading & Writing section — {TOTAL_QUESTIONS} questions across {MODULE_COUNT} modules
          of {MODULE_QUESTION_COUNT}, mixing vocabulary, passages, and grammar. Requires a subscription, since a
          realistic mixed test needs content from every category, not just the free ones.
        </p>
        <Link
          href="/unlock"
          className="inline-block rounded-xl px-4 py-2.5 text-sm font-medium"
          style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
        >
          {PRICE_LABEL} for full access to every course
        </Link>
        <p className="text-[10px] text-[#6E699B] mt-2">{TRIAL_LABEL}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl p-5 bg-[#20223F] border border-[#ffffff1a] mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={18} color="#8B85FF" />
          <p className="font-display text-lg text-[#EDEBFF]">Practice Test</p>
        </div>
        <p className="text-sm text-[#9B97C4] mb-4">
          {TOTAL_QUESTIONS} questions across {MODULE_COUNT} timed modules of {MODULE_QUESTION_COUNT} ({"32 min each"}),
          mixing vocabulary, passages, and grammar — the closest thing here to actually sitting the real section. You
          can skip ahead and come back before submitting each module, the same as the real test. This is a raw score
          and a category breakdown, not a predicted SAT score.
        </p>
        <Link
          href="/practice-test"
          className="block text-center rounded-xl px-4 py-3 font-medium"
          style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
        >
          {attempts.length > 0 ? "Start a new practice test" : "Start practice test"}
        </Link>
      </div>

      {attempts.length > 0 && (
        <div>
          <p className="text-xs text-[#9B97C4] mb-3">
            {attempts.length} attempt{attempts.length !== 1 ? "s" : ""} so far
          </p>
          <div className="space-y-2">
            {attempts
              .slice()
              .reverse()
              .map((a, i) => {
                const tier = getScoreTier(a.score, a.total);
                const tierStyle = TIERS[tier];
                return (
                  <div key={i} className="rounded-2xl p-4 bg-[#20223F] flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#EDEBFF]">{formatDate(a.completedAt)}</p>
                      <p className="text-xs mt-0.5" style={{ color: tierStyle.accent }}>
                        Vocab {a.byType.vocab.correct}/{a.byType.vocab.total} · Passages {a.byType.passages.correct}/
                        {a.byType.passages.total} · Grammar {a.byType.grammar.correct}/{a.byType.grammar.total}
                      </p>
                    </div>
                    <p className="font-display text-lg text-[#EDEBFF]">
                      {a.score}/{a.total}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
