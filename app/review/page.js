"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, ArrowLeft, Sparkles } from "lucide-react";
import { getAllWordsFlat, courses } from "@/lib/wordbanks";
import { getDueWordIds, recordWordResult, REVIEW_SESSION_CAP } from "@/lib/progress";
import { getActivityTheme, NIGHT } from "@/lib/timeTheme";
import QuizResults from "@/components/QuizResults";
import MilestoneCards from "@/components/MilestoneCards";
import { checkNewMilestones, describeMilestone } from "@/lib/milestones";

// The word bank always lists the correct option first (correctIndex: 0).
// Shuffling the display order here — instead of in the data — fixes every
// question at once and means the answer isn't in the same spot every time.
function shuffledIndices(count) {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export default function ReviewPage() {
  const [dueWords, setDueWords] = useState(null); // null = still loading
  const [overflowCount, setOverflowCount] = useState(0);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  // One-time milestones crossed by this session (only "words learned" can
  // move here) — already marked as shown, so they never repeat.
  const [milestones, setMilestones] = useState([]);
  // Start with the identity order so server-rendered HTML and the first
  // client render match exactly; shuffle only after mount (client-only),
  // which avoids a hydration mismatch from Math.random() running on both
  // the server and the client with different results.
  const [order, setOrder] = useState([0, 1, 2, 3]);
  // Real time of day, not "review = always dawn" — see lib/timeTheme.js.
  const [theme, setTheme] = useState(NIGHT);

  useEffect(() => {
    const dueIds = getDueWordIds(); // pre-sorted: lowest box first, then most overdue
    const byId = new Map(getAllWordsFlat().map((w) => [w.id, w]));
    const prioritized = dueIds.map((id) => byId.get(id)).filter(Boolean);
    setDueWords(prioritized.slice(0, REVIEW_SESSION_CAP));
    setOverflowCount(Math.max(0, prioritized.length - REVIEW_SESSION_CAP));
    setTheme(getActivityTheme(new Date()));
  }, []);

  useEffect(() => {
    setOrder(shuffledIndices(4));
  }, [step]);

  if (dueWords === null) {
    return null; // avoid a flash of "nothing due" before localStorage loads
  }

  if (dueWords.length === 0) {
    return (
      <main className={`min-h-dvh ${theme.page} flex items-center justify-center px-4`}>
        <div className="text-center max-w-sm">
          <Sparkles size={28} color={theme.accent} className="mx-auto mb-3" />
          <p className="mb-1" style={{ color: theme.text }}>Nothing due for review right now.</p>
          <p className="text-sm mb-5" style={{ color: theme.subtext }}>
            Words come back here once you've quizzed on them and it's time to review again.
          </p>
          <Link href="/" className="text-sm" style={{ color: theme.accent }}>
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const current = dueWords[step];
  const q = current.quiz;

  function answer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.correctIndex;
    if (correct) setScore((s) => s + 1);
    recordWordResult(current.id, correct);
  }

  function next() {
    if (step + 1 < dueWords.length) {
      setStep(step + 1);
      setSelected(null);
    } else {
      setMilestones(checkNewMilestones(courses).map(describeMilestone));
      setDone(true);
    }
  }

  return (
    <main className={`min-h-dvh ${theme.page} px-4 py-8`}>
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-1 text-xs mb-6" style={{ color: theme.subtext }}>
          <ArrowLeft size={14} /> Back
        </Link>

        {!done ? (
          <div>
            <p className="text-xs uppercase tracking-wide mb-4" style={{ color: theme.subtext }}>
              Review — {step + 1} of {dueWords.length}
            </p>

            <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: theme.card }}>
              <p className="text-xs mb-2" style={{ color: theme.subtext }}>
                {current.categoryTitle} · {current.levelLabel}
              </p>
              <p className="font-display text-lg mb-4 leading-relaxed" style={{ color: theme.text }}>{q.sentence}</p>
              <div className="space-y-2">
                {order.map((idx) => {
                  const opt = q.options[idx];
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
                      className={`w-full text-left rounded-xl px-4 py-3 border ${style} flex items-center justify-between`}
                      style={{ color: theme.text }}
                    >
                      {opt}
                      {selected !== null && isCorrect && <Check size={16} color="#7BC9A0" />}
                      {selected !== null && isSelected && !isCorrect && <X size={16} color="#E08A9E" />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <p className="text-sm mt-4" style={{ color: theme.subtext }}>{q.explanation}</p>
              )}
            </div>

            {selected !== null && (
              <button
                onClick={next}
                className="w-full rounded-xl px-4 py-3 font-medium"
                style={{ backgroundColor: theme.accent, color: theme.onAccent }}
              >
                {step + 1 < dueWords.length ? "Next word" : "Finish review"}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <QuizResults
              score={score}
              total={dueWords.length}
              theme={theme}
              copy={{
                perfect: { headline: "Perfect. Nothing missed.", note: "Every word came back stronger." },
                good: {
                  headline: "Most of these came back strong.",
                  note: "The ones you missed will be right back in your next review.",
                },
                watch: {
                  headline: "These are the ones to watch.",
                  note: "The words you missed are flagged now. They'll be right back in your next review, and that's how they stick.",
                },
              }}
            >
              {overflowCount > 0 && (
                <p className="text-sm mt-3" style={{ color: theme.subtext }}>
                  {overflowCount} more due — they'll be here next time.
                </p>
              )}
            </QuizResults>
            <MilestoneCards milestones={milestones} theme={theme} />
            <Link
              href="/"
              className="block w-full rounded-xl px-4 py-3 font-medium text-center"
              style={{ backgroundColor: theme.accent, color: theme.onAccent }}
            >
              Done
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
