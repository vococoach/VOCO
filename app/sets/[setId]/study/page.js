"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft, Sparkles } from "lucide-react";
import {
  findLevel,
  getMissedWordsLevel,
  missedWordsCategoryId,
  getDueForReviewLevel,
  getSetCategoryId,
  DUE_FOR_REVIEW_ID,
} from "@/lib/wordbanks";
import { markStudied, getStruggleWordIds, getDueWordIds, REVIEW_SESSION_CAP } from "@/lib/progress";
import { isCategoryLocked, isSubscribedCached, shouldRefreshStatus, refreshSubscriptionStatus } from "@/lib/purchase";
import { getPhase } from "@/lib/timeOfDay";
import StudyClose from "@/components/StudyClose";

export default function StudyPage() {
  const router = useRouter();
  const params = useParams();
  const missedCategoryId = missedWordsCategoryId(params.setId);
  const isMissedWords = missedCategoryId !== null;
  const isDueForReview = params.setId === DUE_FOR_REVIEW_ID;
  const isDynamic = isMissedWords || isDueForReview;
  const categoryId = getSetCategoryId(params.setId);
  const [struggleIds, setStruggleIds] = useState(null); // null = not loaded yet (missed-words only)
  const [dueIds, setDueIds] = useState(null); // null = not loaded yet (due-for-review only)
  const [subscribed, setSubscribed] = useState(null); // null = not checked yet
  const [index, setIndex] = useState(0);
  // null while studying; set on "Done studying" to show the closing screen.
  const [closing, setClosing] = useState(null);

  useEffect(() => {
    if (isMissedWords) {
      setStruggleIds(getStruggleWordIds());
    }
    if (isDueForReview) {
      // Same priority order and cap as /review, so studying previews
      // exactly what that quiz session will cover.
      setDueIds(getDueWordIds().slice(0, REVIEW_SESSION_CAP));
    }
    // Show the cached subscription state immediately, then re-verify with
    // Stripe in the background (at most once a day). If that comes back
    // different — e.g. the subscription was cancelled — `locked` below
    // flips true and the redirect effect kicks the learner to /unlock
    // even mid-session, instead of leaving them unlocked from a stale check.
    setSubscribed(isSubscribedCached());
    if (shouldRefreshStatus()) {
      refreshSubscriptionStatus().then(setSubscribed);
    }
  }, [isMissedWords, isDueForReview]);

  const locked = subscribed !== null && categoryId !== null && isCategoryLocked(categoryId, subscribed);

  useEffect(() => {
    if (locked) router.replace("/unlock");
  }, [locked, router]);

  // For a dynamic level, wait for client-side progress data before
  // resolving `found` — reading localStorage during the very first render
  // would return different results on the server (empty) vs. the client,
  // causing a hydration mismatch. Same reasoning applies to the
  // subscription check: wait for it before rendering anything from a
  // locked category.
  if (subscribed === null || locked) {
    return null;
  }
  if ((isMissedWords && struggleIds === null) || (isDueForReview && dueIds === null)) {
    return null;
  }

  const found = isMissedWords
    ? getMissedWordsLevel(missedCategoryId, struggleIds)
    : isDueForReview
    ? getDueForReviewLevel(dueIds)
    : findLevel(params.setId);

  if (isDynamic && found.level.words.length === 0) {
    return (
      <main className="min-h-dvh bg-[#14152B] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Sparkles size={28} color="#8B85FF" className="mx-auto mb-3" />
          {isDueForReview ? (
            <>
              <p className="text-[#EDEBFF] mb-1">Nothing due for review right now.</p>
              <p className="text-sm text-[#9B97C4] mb-5">
                Words come back here once you've quizzed on them and it's time to review again.
              </p>
            </>
          ) : (
            <>
              <p className="text-[#EDEBFF] mb-1">Nothing to catch up on in {found.category.title} right now.</p>
              <p className="text-sm text-[#9B97C4] mb-5">
                Words show up here when you miss them in a quiz. You're not struggling with anything in this category — nice work.
              </p>
            </>
          )}
          <Link href="/" className="text-[#8B85FF] text-sm">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  if (!found) {
    return (
      <main className="min-h-dvh bg-[#14152B] flex items-center justify-center px-4">
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
  const word = level.words[index];
  const isLast = index === level.words.length - 1;

  function finish() {
    markStudied(level.id);
    // Not straight home: a brief closing screen first (components/StudyClose.js)
    // that says why to let sleep do its part before quizzing. Still just a
    // suggestion — "Back home" is one tap and nothing is locked.
    setClosing({ evening: getPhase(new Date()) === "evening" });
  }

  if (closing) {
    return <StudyClose evening={closing.evening} />;
  }

  return (
    <main className="min-h-dvh bg-[#14152B] px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-1 text-xs text-[#9B97C4] mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        <p className="text-xs uppercase tracking-wide text-[#9B97C4] mb-4">
          {category.title} — {level.label}
        </p>

        <div className="bg-[#1F2142] rounded-2xl p-6 min-h-[180px] flex items-center mb-5">
          <p className="font-display text-xl leading-relaxed text-[#EDEBFF]">{word.fact}</p>
        </div>

        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="p-3 -m-1 rounded-full text-[#9B97C4] disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
            {level.words.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: i === index ? "#8B85FF" : "#ffffff26" }}
              />
            ))}
          </div>

          {!isLast ? (
            <button
              onClick={() => setIndex((i) => Math.min(level.words.length - 1, i + 1))}
              className="p-3 -m-1 rounded-full text-[#9B97C4]"
            >
              <ChevronRight size={20} />
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        <p className="text-xs text-center text-[#9B97C4] mb-5">
          {index + 1} of {level.words.length}
        </p>

        {isLast && (
          <button
            onClick={finish}
            className="w-full rounded-xl px-4 py-3 font-medium"
            style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
          >
            Done studying
          </button>
        )}
      </div>
    </main>
  );
}
