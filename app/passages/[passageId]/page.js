"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowLeft } from "lucide-react";
import { findPassage } from "@/lib/wordbanks";
import { isPassageLocked, isSubscribedCached, shouldRefreshStatus, refreshSubscriptionStatus } from "@/lib/purchase";
import { recordPassageResult } from "@/lib/passageProgress";
import QuizResults from "@/components/QuizResults";

// Options are listed correct-first in the data (correctIndex: 0); shuffle the
// display order on the client only, after mount, so the server and first client
// render match — same approach as the vocabulary quizzes.
function shuffledIndices(count) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// The passage text, with any blank (a words-in-context passage) drawn as a
// visible underlined gap.
function PassageText({ paragraph }) {
  const parts = paragraph.split("______");
  return (
    <p className="font-display text-[17px] leading-[1.75] text-[#3D2B4F]">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span
              role="img"
              aria-label="blank"
              className="inline-block w-20 border-b-2 border-[#3D2B4F] mx-1 align-baseline"
            >
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

// One reading passage followed by one or two questions (lib/satPassages.js).
// Results are stored on their own (lib/passageProgress.js) — passages never touch
// spaced repetition, streaks or milestones. The first passage is free; the rest
// need the subscription, enforced here the same way /sets/[setId] enforces it.
export default function PassagePage() {
  const params = useParams();
  const router = useRouter();
  const found = findPassage(params.passageId);
  const passage = found ? found.passage : null;
  const course = found ? found.course : null;
  const [subscribed, setSubscribed] = useState(null); // null = not checked yet
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [order, setOrder] = useState([0, 1, 2, 3]);

  useEffect(() => {
    // Cached status first (no loading flash), then re-verified with Stripe at
    // most once a day — if that comes back different (a cancellation), `locked`
    // flips and the learner is sent to /unlock even mid-passage.
    setSubscribed(isSubscribedCached());
    if (shouldRefreshStatus()) refreshSubscriptionStatus().then(setSubscribed);
  }, []);

  useEffect(() => {
    setOrder(shuffledIndices(4));
  }, [step]);

  const locked = subscribed !== null && passage !== null && isPassageLocked(passage.id, subscribed);
  useEffect(() => {
    if (locked) router.replace("/unlock");
  }, [locked, router]);

  if (subscribed === null || locked) return null;

  if (!passage) {
    return (
      <main className="min-h-dvh bg-[#14152B] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#EDEBFF] mb-4">That passage doesn't exist.</p>
          <Link href="/" className="text-[#8B85FF] text-sm">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const backHref = `/courses/${course.id}?section=passages`;
  const total = passage.questions.length;
  const q = passage.questions[step];

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
      recordPassageResult(passage.id, score, total);
      setDone(true);
    }
  }

  function readAgain() {
    setStep(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#FFD9B0] to-[#FFEFDD] px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href={backHref} className="flex items-center gap-1 text-xs text-[#8A6E7D] mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="bg-[#FFF9F2] rounded-2xl p-6 mb-5">
          <p className="text-xs uppercase tracking-wide text-[#8A6E7D] mb-1">
            Reading passage · {passage.subject}
          </p>
          <h1 className="font-display text-xl text-[#3D2B4F] mb-4">{passage.title}</h1>
          <div className="space-y-4">
            {passage.text.map((paragraph, i) => (
              <PassageText key={i} paragraph={paragraph} />
            ))}
          </div>
        </div>

        {!done ? (
          <div>
            <p className="text-xs uppercase tracking-wide text-[#8A6E7D] mb-3">
              Question {step + 1} of {total}
            </p>

            <div className="bg-[#FFF9F2] rounded-2xl p-6 mb-5">
              <p className="font-display text-lg mb-4 text-[#3D2B4F] leading-relaxed">{q.prompt}</p>
              <div className="space-y-2">
                {order.map((idx) => {
                  const isCorrect = idx === q.correctIndex;
                  const isSelected = idx === selected;
                  let style = "border-[#00000014] bg-transparent";
                  if (selected !== null) {
                    if (isCorrect) style = "border-[#7BC9A0] bg-[#7BC9A01A]";
                    else if (isSelected) style = "border-[#E08A9E] bg-[#E08A9E1A]";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => answer(idx)}
                      className={`w-full text-left rounded-xl px-4 py-3 border ${style} text-[#3D2B4F] flex items-center justify-between gap-3`}
                    >
                      <span>{q.options[idx]}</span>
                      {selected !== null && isCorrect && <Check size={16} color="#7BC9A0" className="shrink-0" />}
                      {selected !== null && isSelected && !isCorrect && <X size={16} color="#E08A9E" className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && <p className="text-sm mt-4 text-[#8A6E7D]">{q.explanation}</p>}
            </div>

            {selected !== null && (
              <button
                onClick={next}
                className="w-full rounded-xl px-4 py-3 font-medium text-white"
                style={{ backgroundColor: "#FF9B5C" }}
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
              copy={{
                perfect: {
                  headline: "Every question right.",
                  note: `${passage.title}. Careful reading paid off.`,
                },
                good: {
                  headline: "Most of it landed.",
                  note: [`${passage.title}.`, "Read it once more and see which choice slipped."],
                },
                watch: {
                  headline: "Worth another read.",
                  note: "Passage questions reward slow, careful reading. Read it again and see what the text actually supports.",
                },
              }}
            >
              <div className="mt-5 flex gap-2">
                <button
                  onClick={readAgain}
                  className="flex-1 text-sm rounded-xl px-3 py-2 border border-[#3D2B4F33] text-[#3D2B4F]"
                >
                  Read it again
                </button>
                <Link
                  href={backHref}
                  className="flex-1 text-center text-sm rounded-xl px-3 py-2 font-medium"
                  style={{ backgroundColor: "#FF9B5C", color: "#14152B" }}
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
