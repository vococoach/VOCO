"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowLeft } from "lucide-react";
import { findCrossTextPair } from "@/lib/wordbanks";
import { isPassageLocked, isSubscribedCached, shouldRefreshStatus, refreshSubscriptionStatus } from "@/lib/purchase";
import { recordPassageResult } from "@/lib/passageProgress";
import { getActivityTheme, NIGHT } from "@/lib/timeTheme";
import QuizResults from "@/components/QuizResults";
import PassageCard from "@/components/PassageCard";

// Options are listed correct-first in the data (correctIndex: 0); shuffle the
// display order on the client only, after mount, so the server and first client
// render match — same approach as every other quiz on the site.
function shuffledIndices(count) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// A Cross-Text Connections pair (lib/satCrossText.js): two related passages,
// both shown at once, stacked, followed by one or more questions about how
// they relate. Nearly identical to /passages/[passageId] — same option/
// feedback mechanic, same PassageCard component (now shared, twice) — the
// only real difference is two texts instead of one. Results are stored in
// the SAME store as single passages (lib/passageProgress.js), since a pair
// id is just another id in that store; gating reuses isPassageLocked() the
// same way. Never gets its own free sample — the existing free passage
// already samples this tab.
export default function CrossTextPage() {
  const params = useParams();
  const router = useRouter();
  const found = findCrossTextPair(params.pairId);
  const pair = found ? found.pair : null;
  const course = found ? found.course : null;
  const [subscribed, setSubscribed] = useState(null); // null = not checked yet
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [order, setOrder] = useState([0, 1, 2, 3]);
  // Real time of day, not "reading passage = always dawn" — see lib/timeTheme.js.
  const [theme, setTheme] = useState(NIGHT);

  useEffect(() => {
    // Cached status first (no loading flash), then re-verified with Stripe at
    // most once a day — if that comes back different (a cancellation), `locked`
    // flips and the learner is sent to /unlock even mid-pair.
    setSubscribed(isSubscribedCached());
    if (shouldRefreshStatus()) refreshSubscriptionStatus().then(setSubscribed);
    setTheme(getActivityTheme(new Date()));
  }, []);

  useEffect(() => {
    setOrder(shuffledIndices(4));
  }, [step]);

  const locked = subscribed !== null && pair !== null && isPassageLocked(pair.id, subscribed);
  useEffect(() => {
    if (locked) router.replace("/unlock");
  }, [locked, router]);

  if (subscribed === null || locked) return null;

  if (!pair) {
    return (
      <main className={`min-h-dvh ${theme.page} flex items-center justify-center px-4`}>
        <div className="text-center">
          <p className="mb-4" style={{ color: theme.text }}>That pair doesn't exist.</p>
          <Link href="/" className="text-sm" style={{ color: theme.accent }}>
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const backHref = `/courses/${course.id}?section=passages`;
  const total = pair.questions.length;
  const q = pair.questions[step];

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
      recordPassageResult(pair.id, score, total);
      setDone(true);
    }
  }

  function readAgain() {
    setStep(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  const pairTitle = `${pair.passageA.title} & ${pair.passageB.title}`;

  return (
    <main className={`min-h-dvh ${theme.page} px-4 py-8`}>
      <div className="max-w-md mx-auto">
        <Link href={backHref} className="flex items-center gap-1 text-xs mb-6" style={{ color: theme.subtext }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <p className="text-xs uppercase tracking-wide mb-3" style={{ color: theme.subtext }}>
          Text 1
        </p>
        <PassageCard title={pair.passageA.title} subject={pair.passageA.subject} text={pair.passageA.text} theme={theme} />

        <p className="text-xs uppercase tracking-wide mb-3" style={{ color: theme.subtext }}>
          Text 2
        </p>
        <PassageCard title={pair.passageB.title} subject={pair.passageB.subject} text={pair.passageB.text} theme={theme} />

        {!done ? (
          <div>
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: theme.subtext }}>
              Question {step + 1} of {total}
            </p>

            <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: theme.card }}>
              <p className="font-display text-lg mb-4 leading-relaxed" style={{ color: theme.text }}>{q.prompt}</p>
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
                      <span>{q.options[idx]}</span>
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
                  headline: "Every question right.",
                  note: `${pairTitle}. Careful reading paid off.`,
                },
                good: {
                  headline: "Most of it landed.",
                  note: [`${pairTitle}.`, "Read both passages once more and see which choice slipped."],
                },
                watch: {
                  headline: "Worth another read.",
                  note: "Connecting two texts rewards slow, careful reading. Read them again and see how they actually relate.",
                },
              }}
            >
              <div className="mt-5 flex gap-2">
                <button
                  onClick={readAgain}
                  className="flex-1 text-sm rounded-xl px-3 py-2 border"
                  style={{ borderColor: `${theme.text}33`, color: theme.text }}
                >
                  Read again
                </button>
                <Link
                  href={backHref}
                  className="flex-1 text-center text-sm rounded-xl px-3 py-2 font-medium"
                  style={{ backgroundColor: theme.accent, color: theme.onAccent }}
                >
                  More passages
                </Link>
              </div>
            </QuizResults>
          </div>
        )}
      </div>
    </main>
  );
}
