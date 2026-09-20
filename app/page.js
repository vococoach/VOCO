"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Flame, RotateCcw, Lock, Sparkles, Target, Info, Sunrise } from "lucide-react";
import { getScoreTier, TIERS } from "@/lib/scoreTier";
import { TIER_ICONS } from "@/components/QuizResults";
import NightThemeExplainer from "@/components/NightThemeExplainer";
import Onboarding from "@/components/Onboarding";
import ShareButton from "@/components/ShareButton";
import { streakCard } from "@/lib/milestones";
import { hasOnboarded, markOnboarded } from "@/lib/onboarding";
import { getPhase, findLastNightsLevel, getTonight } from "@/lib/timeOfDay";
import { categories, getAllWordsFlat, missedWordsId, DUE_FOR_REVIEW_ID } from "@/lib/wordbanks";
import {
  getAllProgress,
  getStreak,
  getNightToMorningStreak,
  resetProgress,
  getDueWordIds,
  getStruggleWordIds,
} from "@/lib/progress";
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
  // Consecutive mornings a full night-to-morning cycle was completed — a
  // different thing from `streak` (any quiz, any day). See lib/progress.js.
  const [nightToMorningStreak, setNightToMorningStreak] = useState(0);
  // null = not known yet (localStorage is client-only), true = show the
  // first-visit onboarding, false = normal home screen.
  const [onboarding, setOnboarding] = useState(null);
  const [ready, setReady] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const [struggleCounts, setStruggleCounts] = useState({});
  const [subscribed, setSubscribed] = useState(false);
  const [cancelAt, setCancelAt] = useState(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  // Local device time, read on the client only (the page is prerendered, so
  // the server has no meaningful "now"). null until mounted.
  const [now, setNow] = useState(null);

  // A tab left open overnight shouldn't keep showing last night's evening
  // framing at breakfast — re-read the clock and progress on coming back.
  useEffect(() => {
    function refresh() {
      if (document.visibilityState !== "visible") return;
      setNow(new Date());
      setProgress(getAllProgress());
      setStreak(getStreak());
      setNightToMorningStreak(getNightToMorningStreak());
      setDueCount(getDueWordIds().length);
    }
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    setOnboarding(!hasOnboarded());
    setNow(new Date());
    setProgress(getAllProgress());
    setStreak(getStreak());
    setNightToMorningStreak(getNightToMorningStreak());
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
    setNightToMorningStreak(0);
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

  // Time-of-day framing (see lib/timeOfDay.js). Evening: tonight's study.
  // Morning: last night's words, if any. Midday / anything else: the neutral
  // view. Only framing — nothing here ever locks or hides the quiz.
  const phase = now ? getPhase(now) : null;
  const isLocked = (categoryId) => isCategoryLocked(categoryId, subscribed);
  const lastNight = ready && phase === "morning" ? findLastNightsLevel(categories, progress, now, isLocked) : null;
  const tonight = ready && phase === "evening" ? getTonight(categories, progress, now, isLocked) : null;

  let subtitle = "Study a level before bed. Quiz yourself whenever you're ready.";
  if (tonight && tonight.kind === "suggest") subtitle = "Good evening. Study a level before bed — sleep helps it stick.";
  else if (tonight && tonight.kind === "done") subtitle = "Good evening. Sleep will help what you studied settle in.";
  else if (lastNight) subtitle = "Good morning. A quiz now shows what stuck overnight.";

  if (onboarding) {
    return (
      <Onboarding
        onFinish={() => {
          markOnboarded();
          setOnboarding(false);
        }}
      />
    );
  }

  return (
    // Hidden (not removed) until we know whether this is a first visit, so a
    // first-timer never glimpses the category list before the onboarding.
    <main className={`min-h-dvh bg-[#1A1C3A] px-4 py-8 ${onboarding === null ? "invisible" : ""}`}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Moon size={22} color="#8B85FF" />
            <span className="font-display text-xl text-[#EDEBFF]">Voco</span>
            <NightThemeExplainer />
          </div>
          <div className="flex flex-col items-end gap-1">
            {/* Tap either streak to share it as an image (components/ShareButton.js). */}
            {streak > 0 && (
              <ShareButton
                card={streakCard("daily", streak)}
                className="flex items-center gap-1 text-sm text-[#9B97C4] hover:text-[#EDEBFF]"
                title="Consecutive days you completed a quiz — tap to share"
                ariaLabel={`${streak} day streak — share`}
              >
                <Flame size={16} color="#FF9B5C" />
                {streak} day streak
              </ShareButton>
            )}
            {nightToMorningStreak > 0 && (
              <ShareButton
                card={streakCard("streak", nightToMorningStreak)}
                className="flex items-center gap-1 text-sm text-[#9B97C4] hover:text-[#EDEBFF]"
                title="Consecutive mornings you quizzed the words you studied the night before — tap to share"
                ariaLabel={`${nightToMorningStreak} day night-to-morning streak — share`}
              >
                <Sunrise size={16} color="#FFB27D" />
                {nightToMorningStreak} day night-to-morning streak
              </ShareButton>
            )}
          </div>
        </div>

        {/* Hidden (not removed) until the clock is read, so the greeting never visibly swaps text. */}
        <p className={`text-sm text-[#9B97C4] mb-6 ${ready ? "" : "invisible"}`}>{subtitle}</p>

        {lastNight && (
          <div
            className="rounded-2xl p-4 mb-6"
            style={{ background: "linear-gradient(to bottom, #FFD9B0, #FFEFDD)" }}
          >
            <div className="flex items-start gap-2 mb-1 text-[#3D2B4F] font-medium text-balance">
              <Sunrise size={18} color="#D9772F" className="mt-0.5 shrink-0" />
              Last night's words&nbsp;— quiz yourself now
            </div>
            <p className="text-xs text-[#8A6E7D] mb-3">
              {lastNight.category.title} · {lastNight.level.label} · {lastNight.level.words.length} words
            </p>
            <div className="flex gap-2">
              <Link
                href={`/sets/${lastNight.level.id}/quiz`}
                className="flex-1 text-center text-sm rounded-xl px-3 py-2 font-medium"
                style={{ backgroundColor: "#FF9B5C", color: "#14152B" }}
              >
                Take the quiz
              </Link>
              <Link
                href={`/sets/${lastNight.level.id}/study`}
                className="flex-1 text-center text-sm rounded-xl px-3 py-2 border border-[#3D2B4F33] text-[#3D2B4F]"
              >
                Restudy
              </Link>
            </div>
          </div>
        )}

        {tonight && (
          <div className="rounded-2xl p-4 mb-6 bg-[#20223F] border border-[#8B85FF40]">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium text-[#EDEBFF]">
              <Moon size={16} color="#8B85FF" />
              {tonight.kind === "done" ? "Tonight's study is done" : "Tonight's study"}
            </div>
            {tonight.kind === "done" ? (
              <p className="text-xs text-[#9B97C4]">
                You studied {tonight.category.title} · {tonight.level.label}. Sleep on it — quiz
                yourself in the morning to see what stuck.
              </p>
            ) : (
              <>
                <p className="text-xs text-[#9B97C4] mb-3">
                  {tonight.category.title} · {tonight.level.label} · {tonight.level.words.length} words.
                  Study it before bed, then quiz yourself in the morning.
                </p>
                <Link
                  href={`/sets/${tonight.level.id}/study`}
                  className="block text-center text-sm rounded-xl px-3 py-2 font-medium"
                  style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
                >
                  Start studying
                </Link>
              </>
            )}
          </div>
        )}

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
                  <div className="rounded-2xl p-4 bg-[#20223F] border border-[#ffffff1a]">
                    <Link href="/unlock" className="block">
                      <span className="flex items-center gap-2 text-sm text-[#9B97C4]">
                        <Lock size={14} />
                        Locked — {category.levels.reduce((s, l) => s + l.words.length, 0)} words
                      </span>
                      <span className="block text-xs font-medium text-[#8B85FF] mt-2">
                        {PRICE_LABEL} for full access to every category
                      </span>
                      <span className="block text-[10px] text-[#6E699B] mt-0.5">{TRIAL_LABEL}</span>
                    </Link>
                    {/* One real sample question — shows the format before paying (app/preview). */}
                    <Link
                      href={`/preview/${category.id}`}
                      className="mt-3 inline-flex items-center min-h-[40px] rounded-xl px-3.5 text-xs font-medium text-[#8B85FF] border border-[#8B85FF66]"
                    >
                      Try a sample question
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {category.levels.map((level) => {
                      const p = progress[level.id] || {};
                      const studied = Boolean(p.studiedAt);
                      const quizzed = Boolean(p.lastQuizAt);
                      // Tier of the most recent quiz (same tiers and colors as
                      // the end-of-quiz card); null until the level is quizzed.
                      const tier = quizzed && p.lastQuizTotal > 0 ? getScoreTier(p.lastScore, p.lastQuizTotal) : null;
                      const tierStyle = tier ? TIERS[tier] : null;
                      const TierIcon = tier ? TIER_ICONS[tier] : null;

                      return (
                        <div
                          key={level.id}
                          className={`bg-[#20223F] rounded-2xl p-4 ${tier === "perfect" ? "ring-1 ring-[#7BC9A066]" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-2 text-sm font-medium text-[#EDEBFF]">
                              {tier && (
                                <span
                                  aria-hidden="true"
                                  className="w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: tierStyle.accent }}
                                >
                                  <TierIcon size={11} color="#14152B" strokeWidth={3} />
                                </span>
                              )}
                              {level.label}
                            </span>
                            <span className="text-xs text-[#6E699B]">{level.words.length} words</span>
                          </div>
                          <p
                            className={`text-xs mb-3 ${tier ? "font-medium" : "text-[#6E699B]"}`}
                            style={tier ? { color: tierStyle.accent } : undefined}
                          >
                            {tier
                              ? `${tierStyle.label} — ${p.lastScore}/${p.lastQuizTotal}`
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
          <div className="text-center mt-3">
            <p className="text-xs text-[#9B97C4]">You have full access to every category.</p>
            <button
              onClick={handleManageSubscription}
              disabled={openingPortal}
              className="text-xs text-[#8B85FF] mt-1 disabled:opacity-50"
            >
              {openingPortal ? "Opening..." : "Manage subscription"}
            </button>
          </div>
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
