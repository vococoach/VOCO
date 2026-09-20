"use client";

import Link from "next/link";
import { Lock, Target } from "lucide-react";
import { getScoreTier, TIERS } from "@/lib/scoreTier";
import { TIER_ICONS } from "@/components/QuizResults";
import { missedWordsId } from "@/lib/wordbanks";
import { isCategoryLocked, PRICE_LABEL, TRIAL_LABEL } from "@/lib/purchase";

// One course's categories, each with its levels (or the locked card with a
// sample-question link), and a "still learning" drill when the learner has
// missed words in it. This is the category list the home screen used to render
// directly, now shown on a course's page (app/courses/[courseId]/page.js).
//
// `ready` is false until the page has read localStorage — locked/unlocked
// state isn't known before then, so nothing renders as locked prematurely.
export default function CategoryList({ categories, progress, struggleCounts, subscribed, ready }) {
  return (
    <div className="space-y-7">
      {categories.map((category) => {
        const struggleCount = struggleCounts[category.id] || 0;
        const locked = ready && isCategoryLocked(category.id, subscribed);

        return (
          <div key={category.id}>
            <h2 className="font-display text-lg text-[#EDEBFF]">{category.title}</h2>
            <p className="text-xs text-[#9B97C4] mt-1 mb-3">{category.description}</p>

            {category.levels.length === 0 ? (
              <div className="rounded-2xl p-4 flex items-center gap-2 text-xs text-[#6E699B] border border-dashed border-[#ffffff1a]">
                <Lock size={14} /> Coming soon
              </div>
            ) : locked ? (
              <div className="rounded-2xl p-4 bg-[#20223F] border border-[#ffffff1a]">
                <Link href="/unlock" className="block">
                  <span className="flex items-center gap-2 text-sm text-[#9B97C4]">
                    <Lock size={14} />
                    Locked — {category.levels.reduce((s, l) => s + l.words.length, 0)} words
                  </span>
                  <span className="block text-xs font-medium text-[#8B85FF] mt-2">
                    {PRICE_LABEL} for full access to every course
                  </span>
                  <span className="block text-[10px] text-[#6E699B] mt-0.5">{TRIAL_LABEL}</span>
                </Link>
                {/* One real sample question — shows the format before paying (app/preview). */}
                <Link
                  href={`/preview/${category.id}`}
                  className="mt-3 inline-flex items-center min-h-[40px] rounded-xl px-3.5 text-xs font-medium text-[#8B85FF] border border-[#8B85FF66]"
                >
                  Try a sample question
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {category.levels.map((level) => {
                  const p = progress[level.id] || {};
                  const studied = Boolean(p.studiedAt);
                  const quizzed = Boolean(p.lastQuizAt);
                  // Tier of the most recent quiz (same tiers and colors as
                  // the end-of-quiz card); null until the level is quizzed.
                  const tier = quizzed && p.lastQuizTotal > 0 ? getScoreTier(p.lastScore, p.lastQuizTotal) : null;
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
                        <span className="text-xs text-[#6E699B]">{level.words.length} words</span>
                      </div>
                      <p
                        className={`text-xs mb-3 ${tier ? "font-medium" : "text-[#6E699B]"}`}
                        style={tier ? { color: tierStyle.accent } : undefined}
                      >
                        {tier
                          ? `${tierStyle.label} — ${p.lastScore}/${p.lastQuizTotal}`
                          : studied
                          ? "Studied — quiz whenever you're ready"
                          : "Not started"}
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/sets/${level.id}/study`}
                          className="flex-1 text-center text-sm rounded-xl px-3 py-2 border border-[#ffffff26] text-[#EDEBFF]"
                        >
                          {studied ? "Restudy" : "Study"}
                        </Link>
                        <Link
                          href={`/sets/${level.id}/quiz`}
                          className="flex-1 text-center text-sm rounded-xl px-3 py-2 font-medium"
                          style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
                        >
                          {quizzed ? "Retake quiz" : "Take quiz"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {ready && !locked && struggleCount > 0 && (
              <div className="rounded-2xl p-4 mt-2 bg-[#20223F] border border-[#ffffff1a]">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={18} color="#FF9B5C" />
                  <span className="text-sm font-medium text-[#EDEBFF]">
                    {struggleCount} word{struggleCount !== 1 ? "s" : ""} you're still learning
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/sets/${missedWordsId(category.id)}/study`}
                    className="flex-1 text-center text-sm rounded-xl px-3 py-2 border border-[#ffffff26] text-[#EDEBFF]"
                  >
                    Study
                  </Link>
                  <Link
                    href={`/sets/${missedWordsId(category.id)}/quiz`}
                    className="flex-1 text-center text-sm rounded-xl px-3 py-2 font-medium"
                    style={{ backgroundColor: "#FF9B5C", color: "#14152B" }}
                  >
                    Quiz
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
