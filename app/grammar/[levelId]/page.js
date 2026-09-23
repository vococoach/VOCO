"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowLeft } from "lucide-react";
import { findGrammarLevel } from "@/lib/wordbanks";
import { isGrammarCategoryLocked, isSubscribedCached, shouldRefreshStatus, refreshSubscriptionStatus } from "@/lib/purchase";
import { recordGrammarResult } from "@/lib/grammarProgress";
import { getActivityTheme, NIGHT } from "@/lib/timeTheme";
import QuizResults from "@/components/QuizResults";

// Options are listed correct-first in the data (correctIndex: 0); shuffle the
// display order on the client only, after mount, so the server and first
// client render match — same approach as every other quiz on the site.
function shuffledIndices(count) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// One grammar level: a series of Standard English Conventions questions, each
// presenting 4 full versions of a sentence where only one is correct — not 4
// words filling a blank, since this tests construction, not word meaning.
// Reuses the same option/feedback pattern as vocabulary and passage quizzes.
// Results are stored on their own (lib/grammarProgress.js) — grammar never
// touches spaced repetition, streaks or milestones. Gating is per category,
// enforced here the same way /sets/[setId]/quiz and /passages/[passageId] do.
export default function GrammarQuizPage() {
  const params = useParams();
  const router = useRouter();
  const found = findGrammarLevel(params.levelId);
  const level = found ? found.level : null;
  const category = found ? found.category : null;
  const course = found ? found.course : null;
  const [subscribed, setSubscribed] = useState(null); // null = not checked yet
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [order, setOrder] = useState([0, 1, 2, 3]);
  // Real time of day, not "grammar quiz = always dawn" — see lib/timeTheme.js.
  const [theme, setTheme] = useState(NIGHT);

  useEffect(() => {
    // Cached status first (no loading flash), then re-verified with Stripe at
    // most once a day — if that comes back different (a cancellation), `locked`
    // flips and the learner is sent to /unlock even mid-quiz.
    setSubscribed(isSubscribedCached());
    if (shouldRefreshStatus()) refreshSubscriptionStatus().then(setSubscribed);
    setTheme(getActivityTheme(new Date()));
  }, []);

  useEffect(() => {
    setOrder(shuffledIndices(4));
  }, [step]);

  const locked = subscribed !== null && category !== null && isGrammarCategoryLocked(category.id, subscribed);
  useEffect(() => {
    if (locked) router.replace("/unlock");
  }, [locked, router]);

  if (subscribed === null || locked) return null;

  if (!level) {
    return (
      <main className={`min-h-dvh ${theme.page} flex items-center justify-center px-4`}>
        <div className="text-center">
          <p className="mb-4" style={{ color: theme.text }}>That grammar level doesn't exist.</p>
          <Link href="/" className="text-sm" style={{ color: theme.accent }}>
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const backHref = `/courses/${course.id}?section=grammar`;
  const total = level.questions.length;
  const q = level.questions[step];

  function answer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    if (step + 1 < total) {
      setStep(step + 1);
      setSelected(null);
    } else {
      recordGrammarResult(level.id, score, total);
      setDone(true);
    }
  }

  return (
    <main className={`min-h-dvh ${theme.page} px-4 py-8`}>
      <div className="max-w-md mx-auto">
        <Link href={backHref} className="flex items-center gap-1 text-xs mb-6" style={{ color: theme.subtext }}>
          <ArrowLeft size={14} /> Back
        </Link>

        {!done ? (
          <div>
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: theme.subtext }}>
              {category.title} — {level.label} — {step + 1} of {total}
            </p>

            <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: theme.card }}>
              <p className="text-xs mb-3" style={{ color: theme.subtext }}>{q.prompt}</p>
              <div className="space-y-2">
                {order.map((idx) => {
                  const isCorrect = idx === q.correctIndex;
                  const isSelected = idx === selected;
                  let style = theme.optionIdle;
                  if (selected !== null) {
                    if (isCorrect) style = "border-[#7BC9A0] bg-[#7BC9A01A]";
                    else if (isSelected) style = "border-[#E08A9E] bg-[#E08A9E1A]";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => answer(idx)}
                      className={`w-full text-left rounded-xl px-4 py-3 border ${style} flex items-center justify-between gap-3`}
                      style={{ color: theme.text }}
                    >
                      <span className="leading-relaxed">{q.options[idx]}</span>
                      {selected !== null && isCorrect && <Check size={16} color="#7BC9A0" className="shrink-0" />}
                      {selected !== null && isSelected && !isCorrect && <X size={16} color="#E08A9E" className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && <p className="text-sm mt-4" style={{ color: theme.subtext }}>{q.explanation}</p>}
            </div>

            {selected !== null && (
              <button
                onClick={next}
                className="w-full rounded-xl px-4 py-3 font-medium"
                style={{ backgroundColor: theme.accent, color: theme.onAccent }}
              >
                {step + 1 < total ? "Next question" : "See results"}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <QuizResults
              score={score}
              total={total}
              theme={theme}
              copy={{
                perfect: {
                  headline: "Every rule applied correctly.",
                  note: `${category.title} · ${level.label}. Not a single miss.`,
                },
                good: {
                  headline: "Most of these are sticking.",
                  note: [`${category.title} · ${level.label}.`, "Read the explanations on the ones you missed."],
                },
                watch: {
                  headline: "Worth another look.",
                  note: "These rules reward careful reading. Try the explanations again, then give this level another shot.",
                },
              }}
            >
              <div className="mt-5 flex gap-2">
                <Link
                  href={backHref}
                  className="flex-1 text-center text-sm rounded-xl px-3 py-2 font-medium"
                  style={{ backgroundColor: theme.accent, color: theme.onAccent }}
                >
                  More grammar
                </Link>
              </div>
            </QuizResults>
          </div>
        )}
      </div>
    </main>
  );
}
