"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { getScoreTier, TIERS } from "@/lib/scoreTier";
import { TIER_ICONS } from "@/components/QuizResults";
import { isGrammarCategoryLocked, PRICE_LABEL, TRIAL_LABEL } from "@/lib/purchase";

// The "Grammar" section of a course page: each grammar category and its
// levels. Quiz-only — there's no separate study/flashcard step the way
// vocabulary levels have one, since a grammar level is a set of graded
// questions, not words to review first. Gating is per category, like
// vocabulary; results come from lib/grammarProgress.js (voco_grammar_v1),
// tracked completely separately from vocabulary progress.
//
// `ready` is false until the page has read localStorage — locked/unlocked
// and score state aren't known before then, so nothing renders prematurely.
export default function GrammarList({ categories, records, subscribed, ready }) {
  return (
    <div className="space-y-7">
      {categories.map((category) => {
        const locked = ready && isGrammarCategoryLocked(category.id, subscribed);
        const questionCount = category.levels.reduce((s, l) => s + l.questions.length, 0);

        return (
          <div key={category.id}>
            <h2 className="font-display text-lg text-[#EDEBFF]">{category.title}</h2>
            <p className="text-xs text-[#9B97C4] mt-1 mb-3">{category.description}</p>

            {locked ? (
              <div className="rounded-2xl p-4 bg-[#20223F] border border-[#ffffff1a]">
                <Link href="/unlock" className="block">
                  <span className="flex items-center gap-2 text-sm text-[#9B97C4]">
                    <Lock size={14} />
                    Locked — {questionCount} questions
                  </span>
                  <span className="block text-xs font-medium text-[#8B85FF] mt-2">
                    {PRICE_LABEL} for full access to every course
                  </span>
                  <span className="block text-[10px] text-[#6E699B] mt-0.5">{TRIAL_LABEL}</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {category.levels.map((level) => {
                  const record = records[level.id];
                  const tier = record && record.lastTotal > 0 ? getScoreTier(record.lastScore, record.lastTotal) : null;
                  const tierStyle = tier ? TIERS[tier] : null;
                  const TierIcon = tier ? TIER_ICONS[tier] : null;

                  return (
                    <div
                      key={level.id}
                      className={`bg-[#20223F] rounded-2xl p-4 ${tier === "perfect" ? "ring-1 ring-[#7BC9A066]" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm font-medium text-[#EDEBFF]">
                          {tier && (
                            <span
                              aria-hidden="true"
                              className="w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: tierStyle.accent }}
                            >
                              <TierIcon size={11} color="#14152B" strokeWidth={3} />
                            </span>
                          )}
                          {level.label}
                        </span>
                        <span className="text-xs text-[#6E699B]">{level.questions.length} questions</span>
                      </div>
                      <p
                        className={`text-xs mb-3 ${tier ? "font-medium" : "text-[#6E699B]"}`}
                        style={tier ? { color: tierStyle.accent } : undefined}
                      >
                        {tier ? `${tierStyle.label} — ${record.lastScore}/${record.lastTotal}` : "Not started"}
                      </p>
                      <Link
                        href={`/grammar/${level.id}`}
                        className="block text-center text-sm rounded-xl px-3 py-2 font-medium"
                        style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
                      >
                        {record ? "Retake quiz" : "Take quiz"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
