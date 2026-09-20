"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowLeft, Sparkles, Sunrise } from "lucide-react";
import {
  findLevel,
  wordId,
  getMissedWordsLevel,
  missedWordsCategoryId,
  getSetCategoryId,
  getCategoryCourse,
  categories,
  courses,
} from "@/lib/wordbanks";
import {
  recordQuizResult,
  recordWordResult,
  getStruggleWordIds,
  getAllProgress,
  recordNightToMorning,
  getNightToMorningStreak,
} from "@/lib/progress";
import { getPhase, findLastNightsLevel } from "@/lib/timeOfDay";
import { isCategoryLocked, isSubscribedCached, shouldRefreshStatus, refreshSubscriptionStatus } from "@/lib/purchase";
import QuizResults from "@/components/QuizResults";
import MilestoneCards from "@/components/MilestoneCards";
import ShareButton from "@/components/ShareButton";
import { checkNewMilestones, describeMilestone, streakCard } from "@/lib/milestones";

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

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const missedCategoryId = missedWordsCategoryId(params.setId);
  const isMissedWords = missedCategoryId !== null;
  const categoryId = getSetCategoryId(params.setId);
  // "Back" returns to the course this level belongs to (its category list).
  const course = categoryId ? getCategoryCourse(categoryId) : null;
  const backHref = course ? `/courses/${course.id}` : "/";
  const [struggleIds, setStruggleIds] = useState(null); // null = not loaded yet (missed-words only)
  const [subscribed, setSubscribed] = useState(null); // null = not checked yet
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  // Night-to-morning tracking: whether finishing THIS quiz completes a cycle
  // (decided once, when the quiz opens), and the resulting streak to show.
  const [cycleEligible, setCycleEligible] = useState(false);
  const [cycleStreak, setCycleStreak] = useState(0);
  const cycleChecked = useRef(false);
  // One-time milestone celebrations crossed by finishing this quiz (already
  // marked as shown, so they never repeat) — see lib/milestones.js.
  const [milestones, setMilestones] = useState([]);
  // Start with the identity order so server-rendered HTML and the first
  // client render match exactly; shuffle only after mount (client-only),
  // which avoids a hydration mismatch from Math.random() running on both
  // the server and the client with different results.
  const [order, setOrder] = useState([0, 1, 2, 3]);

  useEffect(() => {
    if (isMissedWords) {
      setStruggleIds(getStruggleWordIds());
    }
    // Show the cached subscription state immediately, then re-verify with
    // Stripe in the background (at most once a day). If that comes back
    // different — e.g. the subscription was cancelled — `locked` below
    // flips true and the redirect effect kicks the learner to /unlock
    // even mid-quiz, instead of leaving them unlocked from a stale check.
    setSubscribed(isSubscribedCached());
    if (shouldRefreshStatus()) {
      refreshSubscriptionStatus().then(setSubscribed);
    }
  }, [isMissedWords]);

  const locked = subscribed !== null && categoryId !== null && isCategoryLocked(categoryId, subscribed);

  useEffect(() => {
    if (locked) router.replace("/unlock");
  }, [locked, router]);

  // A completed quiz counts as one night-to-morning cycle when it's the very level the
  // home screen's "Last night's words" card would feature right now — the
  // exact same detection (findLastNightsLevel), not a second copy of it. It
  // has to be decided here, on open: once this quiz's result is recorded,
  // the level counts as "already quizzed this morning" and the card would
  // stop featuring it. Never for missed-words sessions (not real levels).
  useEffect(() => {
    if (cycleChecked.current || subscribed === null || isMissedWords) return;
    cycleChecked.current = true;
    const now = new Date();
    if (getPhase(now) !== "morning") return;
    const featured = findLastNightsLevel(categories, getAllProgress(), now, (id) =>
      isCategoryLocked(id, subscribed)
    );
    if (featured && featured.level.id === params.setId) setCycleEligible(true);
  }, [subscribed, isMissedWords, params.setId]);

  useEffect(() => {
    setOrder(shuffledIndices(4));
  }, [step]);

  // For the dynamic "still learning" level, wait for client-side progress
  // data before resolving `found` — reading localStorage during the very
  // first render would return different results on the server (empty) vs.
  // the client, causing a hydration mismatch. Same reasoning applies to the
  // subscription check: wait for it before rendering anything from a
  // locked category.
  if (subscribed === null || locked) {
    return null;
  }
  if (isMissedWords && struggleIds === null) {
    return null;
  }

  const found = isMissedWords ? getMissedWordsLevel(missedCategoryId, struggleIds) : findLevel(params.setId);

  if (isMissedWords && found.level.words.length === 0) {
    return (
      <main className="min-h-dvh bg-[#1A1C3A] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Sparkles size={28} color="#8B85FF" className="mx-auto mb-3" />
          <p className="text-[#EDEBFF] mb-1">Nothing to catch up on in {found.category.title} right now.</p>
          <p className="text-sm text-[#9B97C4] mb-5">
            Words show up here when you miss them in a quiz. You're not struggling with anything in this category — nice work.
          </p>
          <Link href="/" className="text-[#8B85FF] text-sm">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  if (!found) {
    return (
      <main className="min-h-dvh bg-[#1A1C3A] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#EDEBFF] mb-4">That level doesn't exist.</p>
          <Link href="/" className="text-[#8B85FF] text-sm">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const { category, level } = found;
  const words = level.words;
  const q = words[step].quiz;

  function answer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.correctIndex;
    if (correct) setScore((s) => s + 1);
    // "Still learning" entries carry their true source id in srsId, so
    // scoring here updates the word's real box instead of a disconnected
    // record keyed off the virtual per-category level id.
    recordWordResult(words[step].srsId || wordId(level.id, words[step].word), correct);
  }

  function next() {
    if (step + 1 < words.length) {
      setStep(step + 1);
      setSelected(null);
    } else {
      recordQuizResult(level.id, score, words.length);
      if (cycleEligible) {
        recordNightToMorning();
        setCycleStreak(getNightToMorningStreak());
      }
      // After everything above is recorded, so a streak / mastery / words
      // threshold crossed by THIS quiz is seen. Shown once, ever.
      setMilestones(checkNewMilestones(courses).map(describeMilestone));
      setDone(true);
    }
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#FFD9B0] to-[#FFEFDD] px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href={backHref} className="flex items-center gap-1 text-xs text-[#8A6E7D] mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        {!done ? (
          <div>
            <p className="text-xs uppercase tracking-wide text-[#8A6E7D] mb-4">
              {category.title} — {level.label} — {step + 1} of {words.length}
            </p>

            <div className="bg-[#FFF9F2] rounded-2xl p-6 mb-5">
              <p className="text-xs text-[#8A6E7D] mb-2">Which word best completes the sentence?</p>
              <p className="font-display text-lg mb-4 text-[#3D2B4F] leading-relaxed">{q.sentence}</p>
              <div className="space-y-2">
                {order.map((idx) => {
                  const opt = q.options[idx];
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
                      className={`w-full text-left rounded-xl px-4 py-3 border ${style} text-[#3D2B4F] flex items-center justify-between`}
                    >
                      {opt}
                      {selected !== null && isCorrect && <Check size={16} color="#7BC9A0" />}
                      {selected !== null && isSelected && !isCorrect && <X size={16} color="#E08A9E" />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <p className="text-sm mt-4 text-[#8A6E7D]">{q.explanation}</p>
              )}
            </div>

            {selected !== null && (
              <button
                onClick={next}
                className="w-full rounded-xl px-4 py-3 font-medium text-white"
                style={{ backgroundColor: "#FF9B5C" }}
              >
                {step + 1 < words.length ? "Next question" : "See results"}
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <QuizResults
              score={score}
              total={words.length}
              copy={
                isMissedWords
                  ? {
                      perfect: {
                        headline: "Every tricky word, right this time.",
                        note: `Nothing left to catch up on in ${category.title}.`,
                      },
                      good: {
                        headline: "Most of these are sticking now.",
                        note: "The ones still slipping stay under “still learning” until they do.",
                      },
                      watch: {
                        headline: "These are the ones to watch.",
                        note: "That's exactly what this session is for. The words you missed stay under “still learning” until they stick.",
                      },
                    }
                  : {
                      perfect: {
                        headline: "Every word remembered.",
                        note: `${category.title} · ${level.label}. Not a single miss.`,
                      },
                      good: {
                        headline: "Most of these are sticking.",
                        note: [`${category.title} · ${level.label}.`, "The ones you missed will come back for review."],
                      },
                      watch: {
                        headline: "These are the ones to watch.",
                        note: "The words you missed are flagged now. They'll come back for review, and that's how they stick.",
                      },
                    }
              }
            >
              {cycleStreak > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-[#8A6E7D]">
                  <Sunrise size={16} color="#D9772F" />
                  <span>
                    Night-to-morning complete —{" "}
                    {cycleStreak === 1 ? "your streak starts here." : `${cycleStreak} days in a row.`}
                  </span>
                  <ShareButton
                    card={streakCard("streak", cycleStreak)}
                    className="underline text-[#A9501A]"
                    ariaLabel="Share your night-to-morning streak"
                  >
                    Share
                  </ShareButton>
                </div>
              )}
            </QuizResults>
            <MilestoneCards milestones={milestones} />
            <Link
              href="/"
              className="block w-full rounded-xl px-4 py-3 font-medium text-white text-center"
              style={{ backgroundColor: "#FF9B5C" }}
            >
              Done
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
