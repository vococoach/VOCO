"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Flame, RotateCcw, Lock, Sparkles, Target, Info } from "lucide-react";
import { categories, getAllWordsFlat, missedWordsId, DUE_FOR_REVIEW_ID } from "@/lib/wordbanks";
import { getAllProgress, getStreak, resetProgress, getDueWordIds, getStruggleWordIds } from "@/lib/progress";
import {
  isCategoryLocked,
  isSubscribedCached,
  shouldRefreshStatus,
  refreshSubscriptionStatus,
  getCancelAt,
  openBillingPortal,
  PRICE_LABEL,
  TRIAL_LABEL,
} from "@/lib/purchase";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function Home() {
  const [progress, setProgress] = useState({});
  const [streak, setStreak] = useState(0);
  const [ready, setReady] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const [struggleCounts, setStruggleCounts] = useState({});
  const [subscribed, setSubscribed] = useState(false);
  const [cancelAt, setCancelAt] = useState(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    setProgress(getAllProgress());
    setStreak(getStreak());
    setDueCount(getDueWordIds().length);

    // Show the cached subscription state immediately, then re-verify with
    // Stripe in the background (at most once a day) — if that comes back
    // different (e.g. a cancellation), the UI updates to match. A
    // subscription can be genuinely active/trialing *and* already
    // scheduled to end (Stripe's Customer Portal cancellation keeps
    // access through the current period/trial rather than revoking it
    // immediately) — cancelAt surfaces that instead of leaving it silent.
    setSubscribed(isSubscribedCached());
    setCancelAt(getCancelAt());
    if (shouldRefreshStatus()) {
      refreshSubscriptionStatus().then((subscribedNow) => {
        setSubscribed(subscribedNow);
        setCancelAt(getCancelAt());
      });
    }

    const struggleIdSet = new Set(getStruggleWordIds());
    const counts = {};
    getAllWordsFlat().forEach((w) => {
      if (struggleIdSet.has(w.id)) {
        counts[w.categoryId] = (counts[w.categoryId] || 0) + 1;
      }
    });
    setStruggleCounts(counts);

    setReady(true);
  }, []);

  function handleReset() {
    if (!window.confirm("Reset all progress on this device? This can't be undone.")) return;
    resetProgress();
    setProgress({});
    setStreak(0);
  }

  async function handleManageSubscription() {
    setOpeningPortal(true);
    const opened = await openBillingPortal();
    if (!opened) {
      window.alert("Couldn't open subscription management right now. Try again in a moment.");
      setOpeningPortal(false);
    }
    // On success the page is navigating away, so no need to reset state.
  }

  return (
    <main className="min-h-dvh bg-[#1A1C3A] px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Moon size={22} color="#8B85FF" />
            <span className="font-display text-xl text-[#EDEBFF]">Voco</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-sm text-[#9B97C4]">
              <Flame size={16} color="#FF9B5C" />
              {streak} day streak
            </div>
          )}
        </div>

        <p className="text-sm text-[#9B97C4] mb-6">
          Study a level before bed. Quiz yourself whenever you're ready.
        </p>

        {ready && dueCount > 0 && (
          <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: "#8B85FF" }}>
            <div className="flex items-center gap-2 mb-3 text-[#14152B] font-medium">
              <Sparkles size={18} />
              {dueCount} word{dueCount !== 1 ? "s" : ""} due for review
            </div>
            <div className="flex gap-2">
              <Link
                href={`/sets/${DUE_FOR_REVIEW_ID}/study`}
                className="flex-1 text-center text-sm rounded-xl px-3 py-2 border border-[#14152B40] text-[#14152B] font-medium"
              >
                Study
              </Link>
              <Link
                href="/review"
                className="flex-1 text-center text-sm rounded-xl px-3 py-2 font-medium bg-[#14152B] text-[#EDEBFF]"
              >
                Review
              </Link>
            </div>
          </div>
        )}

        {ready && subscribed && cancelAt && (
          <div className="rounded-2xl p-4 mb-6 bg-[#20223F] border border-[#FF9B5C40]">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium text-[#EDEBFF]">
              <Info size={16} color="#FF9B5C" />
              Your subscription ends on {formatDate(cancelAt)}
            </div>
            <p className="text-xs text-[#9B97C4] mb-3">
              You'll keep access to every category until then.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={openingPortal}
              className="text-sm text-[#8B85FF] disabled:opacity-50"
            >
              {openingPortal ? "Opening..." : "Manage subscription"}
            </button>
          </div>
        )}

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
                  <Link
                    href="/unlock"
                    className="rounded-2xl p-4 flex items-center justify-between bg-[#20223F] border border-[#ffffff1a]"
                  >
                    <span className="flex items-center gap-2 text-sm text-[#9B97C4]">
                      <Lock size={14} />
                      Locked — {category.levels.reduce((s, l) => s + l.words.length, 0)} words
                    </span>
                    <span className="text-right">
                      <span className="block text-xs font-medium text-[#8B85FF]">{PRICE_LABEL}</span>
                      <span className="block text-[10px] text-[#6E699B]">{TRIAL_LABEL}</span>
                    </span>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    {category.levels.map((level) => {
                      const p = progress[level.id] || {};
                      const studied = Boolean(p.studiedAt);
                      const quizzed = Boolean(p.lastQuizAt);

                      return (
                        <div key={level.id} className="bg-[#20223F] rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#EDEBFF]">{level.label}</span>
                            <span className="text-xs text-[#6E699B]">{level.words.length} words</span>
                          </div>
                          <p className="text-xs text-[#6E699B] mb-3">
                            {quizzed
                              ? `Last score: ${p.lastScore}/${p.lastQuizTotal}`
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

        {ready && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-[#6E699B] mt-8 mx-auto"
          >
            <RotateCcw size={12} /> Reset progress on this device
          </button>
        )}

        {ready && subscribed && !cancelAt && (
          <button
            onClick={handleManageSubscription}
            disabled={openingPortal}
            className="block text-xs text-[#8B85FF] mt-3 mx-auto disabled:opacity-50"
          >
            {openingPortal ? "Opening..." : "Manage subscription"}
          </button>
        )}

        <div className="flex items-center justify-center gap-4 mt-6">
          <Link href="/terms" className="text-xs text-[#6E699B]">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs text-[#6E699B]">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
