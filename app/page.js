"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Flame, RotateCcw, Sparkles, Target, Info, Sunrise, ChevronRight } from "lucide-react";
import NightThemeExplainer from "@/components/NightThemeExplainer";
import Onboarding from "@/components/Onboarding";
import ShareButton from "@/components/ShareButton";
import CourseProgress from "@/components/CourseProgress";
import ScienceNote from "@/components/ScienceNote";
import { streakCard } from "@/lib/milestones";
import { getPhase, findLastNightsLevel, getTonight } from "@/lib/timeOfDay";
import { pickScienceFact } from "@/lib/sleepScience";
import { courses, categories, getCategoryCourse, missedWordsId, DUE_FOR_REVIEW_ID } from "@/lib/wordbanks";
import { getAllProgress, getStreak, getNightToMorningStreak, resetProgress, getDueWordIds } from "@/lib/progress";
import { isCategoryLocked, openBillingPortal } from "@/lib/purchase";
import { useSubscription, useOnboarding, computeStruggleCounts } from "@/lib/useLearnerState";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// "SAT Vocab · Agreement & Support · Foundational" — which course a suggested
// level belongs to matters now that there's more than one.
function levelLabel(category, level) {
  const course = getCategoryCourse(category.id);
  return [course && course.title, category.title, level.label].filter(Boolean).join(" · ");
}

// The home screen has two layers. The top is the daily habit loop — due for
// review, tonight's study, last night's words, words still being learned, the
// streaks — and it is deliberately NOT scoped to any course: it pulls from
// every course's words together, so nobody has to pick a course just to see
// what's due. Below it, a card per course leads to that course's own category
// list (app/courses/[courseId]/page.js).
export default function Home() {
  const [progress, setProgress] = useState({});
  const [streak, setStreak] = useState(0);
  // Consecutive mornings a full night-to-morning cycle was completed — a
  // different thing from `streak` (any quiz, any day). See lib/progress.js.
  const [nightToMorningStreak, setNightToMorningStreak] = useState(0);
  // null = not known yet (localStorage is client-only), true = show the
  // first-visit onboarding, false = normal home screen.
  const { onboarding, finishOnboarding } = useOnboarding();
  const [ready, setReady] = useState(false);
  const [dueCount, setDueCount] = useState(0);
  const [struggleCounts, setStruggleCounts] = useState({});
  const { subscribed, cancelAt } = useSubscription();
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
      setStruggleCounts(computeStruggleCounts());
    }
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    setNow(new Date());
    setProgress(getAllProgress());
    setStreak(getStreak());
    setNightToMorningStreak(getNightToMorningStreak());
    setDueCount(getDueWordIds().length);
    setStruggleCounts(computeStruggleCounts());
    setReady(true);
  }, []);

  function handleReset() {
    if (!window.confirm("Reset all progress on this device? This can't be undone.")) return;
    resetProgress();
    setProgress({});
    setStreak(0);
    setNightToMorningStreak(0);
    setStruggleCounts({});
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
  const tonight = ready && phase === "evening" ? getTonight(courses, progress, now, isLocked) : null;

  // Words still being learned, one drill per category (the per-category design
  // is deliberate — see lib/wordbanks.js), gathered across every course.
  const stillLearning = ready
    ? categories
        .filter((category) => struggleCounts[category.id] > 0 && !isLocked(category.id))
        .map((category) => ({ category, course: getCategoryCourse(category.id), count: struggleCounts[category.id] }))
    : [];
  const stillLearningTotal = stillLearning.reduce((n, row) => n + row.count, 0);

  let subtitle = "Study a level before bed. Quiz yourself whenever you're ready.";
  if (tonight && (tonight.kind === "suggest" || tonight.kind === "choose"))
    subtitle = "Good evening. Study a level before bed — sleep helps it stick.";
  else if (tonight && tonight.kind === "done") subtitle = "Good evening. Sleep will help what you studied settle in.";
  else if (lastNight) subtitle = "Good morning. A quiz now shows what stuck overnight.";

  if (onboarding) {
    return <Onboarding onFinish={finishOnboarding} />;
  }

  return (
    // Hidden (not removed) until we know whether this is a first visit, so a
    // first-timer never glimpses the home screen before the onboarding.
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
        <p className={`text-sm text-[#9B97C4] mb-4 ${ready ? "" : "invisible"}`}>{subtitle}</p>

        {/* Always present, every visit (not a one-time tip, nothing to dismiss): one short
            science fact matched to the time of day — sleep in the evening, retrieval
            practice in the morning. See lib/sleepScience.js. */}
        {ready && phase && <ScienceNote fact={pickScienceFact(phase, now)} />}

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
              {levelLabel(lastNight.category, lastNight.level)} · {lastNight.level.words.length} words
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
                You studied {levelLabel(tonight.category, tonight.level)}. Sleep on it — quiz yourself in the
                morning to see what stuck.
              </p>
            ) : tonight.kind === "choose" ? (
              // Nothing to follow yet (no course started), and no default course
              // on purpose: the learner picks where tonight's study happens.
              <>
                <p className="text-xs text-[#9B97C4] mb-3">
                  Pick a course to study tonight, then quiz yourself in the morning.
                </p>
                <div className="flex flex-col gap-2">
                  {tonight.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="block text-center text-sm rounded-xl px-3 py-2 font-medium"
                      style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
                    >
                      {course.title}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-[#9B97C4] mb-3">
                  {levelLabel(tonight.category, tonight.level)} · {tonight.level.words.length} words. Study it
                  before bed, then quiz yourself in the morning.
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

        {stillLearning.length > 0 && (
          <div className="rounded-2xl p-4 mb-6 bg-[#20223F] border border-[#ffffff1a]">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} color="#FF9B5C" />
              <span className="text-sm font-medium text-[#EDEBFF]">
                {stillLearningTotal} word{stillLearningTotal !== 1 ? "s" : ""} you're still learning
              </span>
            </div>
            <div className="space-y-3">
              {stillLearning.map(({ category, course, count }) => (
                <div key={category.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[#EDEBFF] truncate">{category.title}</p>
                    <p className="text-xs text-[#6E699B]">
                      {course ? `${course.title} · ` : ""}
                      {count} word{count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/sets/${missedWordsId(category.id)}/study`}
                      className="text-center text-xs rounded-lg px-3 py-2 border border-[#ffffff26] text-[#EDEBFF]"
                    >
                      Study
                    </Link>
                    <Link
                      href={`/sets/${missedWordsId(category.id)}/quiz`}
                      className="text-center text-xs rounded-lg px-3 py-2 font-medium"
                      style={{ backgroundColor: "#FF9B5C", color: "#14152B" }}
                    >
                      Quiz
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ready && subscribed && cancelAt && (
          <div className="rounded-2xl p-4 mb-6 bg-[#20223F] border border-[#FF9B5C40]">
            <div className="flex items-center gap-2 mb-1 text-sm font-medium text-[#EDEBFF]">
              <Info size={16} color="#FF9B5C" />
              Your subscription ends on {formatDate(cancelAt)}
            </div>
            <p className="text-xs text-[#9B97C4] mb-3">You'll keep access to every course until then.</p>
            <button
              onClick={handleManageSubscription}
              disabled={openingPortal}
              className="text-sm text-[#8B85FF] disabled:opacity-50"
            >
              {openingPortal ? "Opening..." : "Manage subscription"}
            </button>
          </div>
        )}

        <h2 className="font-display text-lg text-[#EDEBFF] mb-3">Courses</h2>
        <div className="space-y-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="block bg-[#20223F] rounded-2xl p-4 border border-[#ffffff14] hover:border-[#8B85FF66]"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg text-[#EDEBFF]">{course.title}</h3>
                <ChevronRight size={18} color="#8B85FF" className="shrink-0" />
              </div>
              <p className="text-xs text-[#9B97C4] mt-1 mb-3">{course.description}</p>
              <CourseProgress course={course} progress={progress} />
            </Link>
          ))}
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
            <p className="text-xs text-[#9B97C4]">You have full access to every course.</p>
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
