"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { getScoreTier } from "@/lib/scoreTier";
import { missedWordsId } from "@/lib/wordbanks";
import { isCategoryLocked, isLevelLocked } from "@/lib/purchase";
import ItemCard from "@/components/ItemCard";
import LockedRow from "@/components/LockedRow";
import Paywall from "@/components/Paywall";

// One course's categories, each with its levels, and a compact "still learning" row when the
// learner has missed words in it. A course's free category is open only at its Foundational
// and Intermediate tiers: its other tiers show as locked rows of their own (lib/purchase.js
// has the one definition of what's free), and every other category is one locked row.
//
// The look is deliberately light (see "Home screen and course pages" in app/globals.css):
// an open level is its name, a small word count, a quiet status ("Not started", "Studied",
// "Done" or the last quiz score) and ONE primary button, Study first and then Take quiz. The
// other action stays one tap away as a quiet text link, so quizzing before studying and
// restudying both still work. A locked item is a lock and its name with a quiet "Try a
// sample question" link and no price: the one paywall card (components/Paywall.js) is placed
// just before the first locked item and says the price and the free trial once.
//
// `ready` is false until the page has read localStorage — locked/unlocked state isn't known
// before then, so nothing renders as locked prematurely.
export default function CategoryList({ categories, progress, struggleCounts, subscribed, ready }) {
  let paywallShown = false;
  const paywallOnce = () => {
    if (paywallShown || !ready || subscribed) return null;
    paywallShown = true;
    return <Paywall />;
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const struggleCount = struggleCounts[category.id] || 0;
        // The whole category is behind the subscription (every category but each course's free one)…
        const locked = ready && isCategoryLocked(category.id, subscribed);

        if (locked && category.levels.length > 0) {
          const words = category.levels.reduce((sum, level) => sum + level.words.length, 0);
          return (
            <div key={category.id} className="space-y-2">
              {paywallOnce()}
              <LockedRow name={category.title} meta={`${words} words`} sampleHref={`/preview/${category.id}`} />
            </div>
          );
        }

        return (
          <section key={category.id}>
            <h2 className="text-base font-semibold">{category.title}</h2>

            {category.levels.length === 0 ? (
              <p className="vc-muted vc-surface mt-2 p-4 text-sm">Coming soon</p>
            ) : (
              <div className="mt-2 space-y-2">
                {category.levels.map((level) => {
                  const meta = `${level.words.length} words`;
                  // …or just this tier of a free category.
                  if (ready && isLevelLocked(category.id, level.level, subscribed)) {
                    return (
                      <div key={level.id} className="space-y-2">
                        {paywallOnce()}
                        <LockedRow name={level.label} meta={meta} sampleHref={`/preview/${level.id}`} />
                      </div>
                    );
                  }

                  const p = progress[level.id] || {};
                  const studied = Boolean(p.studiedAt);
                  const quizzed = Boolean(p.lastQuizAt);
                  // The tier of the most recent quiz (the same rule as the end-of-quiz card);
                  // a perfect score is "Done".
                  const tier = quizzed && p.lastQuizTotal > 0 ? getScoreTier(p.lastScore, p.lastQuizTotal) : null;
                  const done = tier === "perfect";
                  const study = `/sets/${level.id}/study`;
                  const quiz = `/sets/${level.id}/quiz`;

                  let status, primary, secondary;
                  if (!studied && !quizzed) {
                    status = "Not started";
                    primary = { href: study, label: "Study" };
                    secondary = { href: quiz, label: "Quiz" };
                  } else if (!quizzed) {
                    status = "Studied";
                    primary = { href: quiz, label: "Take quiz" };
                    secondary = { href: study, label: "Restudy" };
                  } else {
                    status = done ? "Done" : tier ? `Last quiz ${p.lastScore}/${p.lastQuizTotal}` : "Quizzed";
                    primary = { href: quiz, label: "Retake quiz", quiet: done };
                    secondary = { href: study, label: studied ? "Restudy" : "Study" };
                  }

                  return (
                    <ItemCard key={level.id} name={level.label} meta={meta} status={status} done={done} primary={primary} secondary={secondary} />
                  );
                })}
              </div>
            )}

            {ready && !locked && struggleCount > 0 && (
              <div className="vc-surface mt-2 flex items-center justify-between gap-2 py-1 pl-4 pr-1">
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <Target size={16} aria-hidden="true" className="shrink-0" style={{ color: "var(--vc-flame)" }} />
                  {struggleCount} still learning
                </span>
                <span className="flex shrink-0">
                  <Link href={`/sets/${missedWordsId(category.id)}/study`} className="vc-link">
                    Study
                  </Link>
                  <Link href={`/sets/${missedWordsId(category.id)}/quiz`} className="vc-link font-semibold">
                    Quiz
                  </Link>
                </span>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
