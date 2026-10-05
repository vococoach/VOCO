"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Lock, Check, X, Sparkles } from "lucide-react";
import TrialLink from "@/components/TrialLink";
import { courses } from "@/lib/wordbanks";
import {
  isFreeCategory,
  isFreeLevel,
  isCategoryLocked,
  isLevelLocked,
  isPassageLocked,
  isGrammarCategoryLocked,
  PRICE_LABEL,
  TRIAL_LABEL,
  TRIAL_TERMS,
  setCustomerId,
  isSubscribedCached,
  shouldRefreshStatus,
  refreshSubscriptionStatus,
} from "@/lib/purchase";

// "A", "A and B", "A, B, and C" — the free categories (one per course) read
// correctly however many courses there are.
function joinList(items) {
  if (items.length <= 2) return items.join(" and ");
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

// "checking" (deciding which state to show) -> "pitch" | "already", or,
// coming back from Stripe with ?session_id=... -> "verifying" -> "success" | "error"
export default function UnlockPage() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");

    if (sessionId) {
      setStatus("verifying");
      fetch("/api/verify-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.unlocked) {
            setCustomerId(data.customerId, data.status);
            setStatus("success");
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
      return;
    }

    if (isSubscribedCached()) {
      setStatus("already");
      if (shouldRefreshStatus()) {
        refreshSubscriptionStatus().then((subscribed) => {
          if (!subscribed) setStatus("pitch");
        });
      }
    } else {
      setStatus("pitch");
    }
  }, []);

  // Everything below is computed from the data and the one free-set definition
  // in lib/purchase.js — no counts or names are written by hand here, so the
  // pitch can't drift when content grows or the free set changes.
  const wordsIn = (levels) => levels.reduce((n, level) => n + level.words.length, 0);
  const freeCategories = courses.flatMap((course) => course.categories.filter((c) => isFreeCategory(c.id)));
  const freeLevels = freeCategories.flatMap((c) => c.levels.filter((l) => isFreeLevel(c.id, l.level)));
  const freeTierLabels = [...new Set(freeLevels.map((l) => l.label))];
  // Per course: whole categories that are locked, plus the locked tiers of a
  // free category (e.g. Advanced, and SAT Vocab's Expert), then passages,
  // cross-text pairs and grammar, none of which have a free sample any more.
  // (Strategy guides are free to everyone, so they never appear here.)
  const lockedByCourse = courses
    .map((course) => ({
      course,
      categories: course.categories.filter((c) => isCategoryLocked(c.id, false)),
      tiers: course.categories
        .filter((c) => !isCategoryLocked(c.id, false))
        .map((c) => ({ category: c, levels: c.levels.filter((l) => isLevelLocked(c.id, l.level, false)) }))
        .filter((t) => t.levels.length > 0),
      passages: (course.passages || []).filter((p) => isPassageLocked(p.id, false)),
      crossTextPairs: (course.crossTextPairs || []).filter((p) => isPassageLocked(p.id, false)),
      grammar: (course.grammar || []).filter((g) => isGrammarCategoryLocked(g.id, false)),
    }))
    .filter(
      (group) =>
        group.categories.length > 0 ||
        group.tiers.length > 0 ||
        group.passages.length > 0 ||
        group.crossTextPairs.length > 0 ||
        group.grammar.length > 0
    );
  const lockedPassageCount = lockedByCourse.reduce((sum, group) => sum + group.passages.length, 0);
  const lockedCrossTextCount = lockedByCourse.reduce((sum, group) => sum + group.crossTextPairs.length, 0);
  const lockedGrammarQuestionCount = lockedByCourse.reduce(
    (sum, group) =>
      sum + group.grammar.reduce((s, g) => s + g.levels.reduce((s2, l) => s2 + l.questions.length, 0), 0),
    0
  );
  const lockedCategories = lockedByCourse.flatMap((group) => group.categories);
  const lockedTierLevels = lockedByCourse.flatMap((group) => group.tiers.flatMap((t) => t.levels));
  const lockedWordCount =
    wordsIn(lockedCategories.flatMap((c) => c.levels)) + wordsIn(lockedTierLevels);
  const lockedTierLabels = [...new Set(lockedTierLevels.map((l) => l.label))];
  const freeTitles = joinList(freeCategories.map((c) => c.title));

  return (
    <main className="min-h-dvh bg-[#1A1C3A] px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <Moon size={22} color="#8B85FF" />
          <span className="font-display text-xl text-[#EDEBFF]">Voco</span>
        </Link>

        {(status === "checking" || status === "verifying") && (
          <div className="text-center">
            <Sparkles size={28} color="#8B85FF" className="mx-auto mb-3" />
            <p className="text-[#EDEBFF]">
              {status === "verifying" ? "Verifying your subscription..." : "One moment..."}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#8B85FF] flex items-center justify-center mx-auto mb-4">
              <Check size={26} color="#14152B" />
            </div>
            <p className="font-display text-xl text-[#EDEBFF] mb-2">You're unlocked</p>
            <p className="text-sm text-[#9B97C4] mb-6">
              Every course is now available on this device.
            </p>
            <Link
              href="/"
              className="block w-full rounded-xl px-4 py-3 font-medium text-center"
              style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
            >
              Back to Voco
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#20223F] flex items-center justify-center mx-auto mb-4">
              <X size={26} color="#FF9B5C" />
            </div>
            <p className="font-display text-xl text-[#EDEBFF] mb-2">Couldn't verify that subscription</p>
            <p className="text-sm text-[#9B97C4] mb-6">
              If you just started your trial, try refreshing this page. Otherwise, start below.
            </p>
            <TrialLink
              placement="unlock-error"
              className="block w-full rounded-xl px-4 py-3 font-medium text-center mb-3"
              style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
            >
              Start {TRIAL_LABEL}
            </TrialLink>
            <p className="text-center text-xs text-[#6E699B] mb-3">
              {TRIAL_TERMS} One subscription gives you full access to every course.
            </p>
            <Link href="/" className="block text-center text-[#8B85FF] text-sm">
              Back home
            </Link>
          </div>
        )}

        {status === "already" && (
          <div className="text-center">
            <Sparkles size={28} color="#8B85FF" className="mx-auto mb-3" />
            <p className="text-[#EDEBFF] mb-2">Everything's already unlocked on this device.</p>
            <Link href="/" className="text-[#8B85FF] text-sm">
              Back home
            </Link>
          </div>
        )}

        {status === "pitch" && (
          <div>
            <div className="text-center mb-6">
              <Lock size={28} color="#8B85FF" className="mx-auto mb-3" />
              <p className="font-display text-xl text-[#EDEBFF] mb-2">Unlock every course</p>
              <p className="text-sm text-[#9B97C4]">
                One subscription gives you full access to every course. The {joinList(freeTierLabels)} levels of{" "}
                {freeTitles} stay free ({wordsIn(freeLevels)} words, with quizzes and spaced repetition); everything
                else — {lockedCategories.length} more categories, the {joinList(lockedTierLabels)}{" "}
                {lockedTierLabels.length === 1 ? "level" : "levels"} of the free ones, {lockedWordCount} more words in
                all — unlocks together with a {TRIAL_LABEL}, then {PRICE_LABEL}.
                {lockedPassageCount > 0 && ` That includes ${lockedPassageCount} reading passages`}
                {lockedCrossTextCount > 0 && `, ${lockedCrossTextCount} cross-text pairs`}
                {lockedGrammarQuestionCount > 0 && ` and ${lockedGrammarQuestionCount} grammar questions`}
                {(lockedPassageCount > 0 || lockedCrossTextCount > 0 || lockedGrammarQuestionCount > 0) &&
                  "; the strategy guides are free for everyone."}
              </p>
            </div>

            <div className="bg-[#20223F] rounded-2xl p-4 mb-6 space-y-3">
              <p className="text-xs text-[#9B97C4]">One subscription unlocks all of these:</p>
              {lockedByCourse.map(({ course, categories: locked, tiers, passages, crossTextPairs, grammar }) => (
                <div key={course.id} className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-[#8B85FF]">{course.title}</p>
                  {tiers.map(({ category, levels }) => (
                    <div key={category.id} className="flex items-center gap-2 text-sm text-[#EDEBFF]">
                      <Lock size={14} color="#6E699B" />
                      {category.title} — {joinList(levels.map((l) => l.label))} ({wordsIn(levels)} words)
                    </div>
                  ))}
                  {locked.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 text-sm text-[#EDEBFF]">
                      <Lock size={14} color="#6E699B" />
                      {c.title}
                    </div>
                  ))}
                  {passages.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[#EDEBFF]">
                      <Lock size={14} color="#6E699B" />
                      Reading passages ({passages.length})
                    </div>
                  )}
                  {crossTextPairs.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-[#EDEBFF]">
                      <Lock size={14} color="#6E699B" />
                      Cross-text pairs ({crossTextPairs.length})
                    </div>
                  )}
                  {grammar.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 text-sm text-[#EDEBFF]">
                      <Lock size={14} color="#6E699B" />
                      {g.title} ({g.levels.reduce((s, l) => s + l.questions.length, 0)} questions)
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <TrialLink
              placement="unlock"
              className="block w-full rounded-xl px-4 py-3 font-medium text-center mb-3"
              style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
            >
              Start {TRIAL_LABEL}
            </TrialLink>
            <p className="text-center text-xs text-[#6E699B] mb-3">
              {TRIAL_TERMS} One subscription gives you full access to every course.
            </p>
            <Link href="/" className="block text-center text-[#8B85FF] text-sm">
              Not yet — back home
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
