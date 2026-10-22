"use client";

import { getScoreTier } from "@/lib/scoreTier";
import { isGrammarCategoryLocked } from "@/lib/purchase";
import ItemCard from "@/components/ItemCard";
import LockedRow from "@/components/LockedRow";
import Paywall from "@/components/Paywall";

// The "Grammar & usage" section of a course page: each grammar/usage category and its levels
// (Standard English Conventions: Boundaries, Form, Structure, and Sense; and, since
// 2026-09-24, Expression of Ideas: Transitions). Quiz-only — there's no separate study step
// the way vocabulary levels have one, since a level here is a set of graded questions, not
// words to review first, so each level has one button. Gating is per category, like
// vocabulary: a locked category is one locked row, and the one paywall card goes just before
// the first of them. Results come from lib/grammarProgress.js (voco_grammar_v1), tracked
// completely separately from vocabulary progress.
//
// `ready` is false until the page has read localStorage — locked/unlocked and score state
// aren't known before then, so nothing renders prematurely.
export default function GrammarList({ categories, records, subscribed, ready }) {
  let paywallShown = false;
  const paywallOnce = () => {
    if (paywallShown || !ready || subscribed) return null;
    paywallShown = true;
    return <Paywall />;
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const locked = ready && isGrammarCategoryLocked(category.id, subscribed);

        if (locked) {
          const questionCount = category.levels.reduce((sum, level) => sum + level.questions.length, 0);
          return (
            <div key={category.id} className="space-y-2">
              {paywallOnce()}
              <LockedRow name={category.title} meta={`${questionCount} questions`} sampleHref={`/preview/${category.id}`} />
            </div>
          );
        }

        return (
          <section key={category.id}>
            <h2 className="text-base font-semibold">{category.title}</h2>
            <div className="mt-2 space-y-2">
              {category.levels.map((level) => {
                const record = records[level.id];
                const tier = record && record.lastTotal > 0 ? getScoreTier(record.lastScore, record.lastTotal) : null;
                const done = tier === "perfect";
                return (
                  <ItemCard
                    key={level.id}
                    name={level.label}
                    meta={`${level.questions.length} questions`}
                    status={!record ? "Not started" : done ? "Done" : `Last quiz ${record.lastScore}/${record.lastTotal}`}
                    done={done}
                    primary={{ href: `/grammar/${level.id}`, label: record ? "Retake quiz" : "Take quiz", quiet: done }}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
