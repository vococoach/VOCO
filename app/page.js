"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, Flame, RotateCcw, Sunrise, ChevronRight } from "lucide-react";
import NightThemeExplainer from "@/components/NightThemeExplainer";
import VocoMark from "@/components/VocoMark";
import FirstVisit from "@/components/FirstVisit";
import HomeLoading from "@/components/HomeLoading";
import ShareButton from "@/components/ShareButton";
import CourseProgress from "@/components/CourseProgress";
import { streakCard } from "@/lib/milestones";
import { getPhase, findLastNightsLevel, getTonight } from "@/lib/timeOfDay";
import { courses, categories, missedWordsId, DUE_FOR_REVIEW_ID } from "@/lib/wordbanks";
import { TRADEMARK_NOTICE } from "@/lib/legal";
import { getAllProgress, getStreak, getNightToMorningStreak, resetProgress, getDueWordIds, getStruggleWordIds } from "@/lib/progress";
import { isLevelLocked, openBillingPortal } from "@/lib/purchase";
import { accessibleWordIds, countByCategory } from "@/lib/access";
import { useSubscription } from "@/lib/useLearnerState";
import { isReturningVisitor, setReturningAttribute, clearLegacyFlags } from "@/lib/visitor";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// "Agreement & Support · Intermediate · 12 words": which level a suggestion is for.
function levelLabel(category, level) {
  return [category.title, level.label, `${level.words.length} words`].join(" · ");
}

// The home screen has two layers. The top is the daily habit loop — due for
// review, tonight's study, last night's words, words still being learned, the
// streaks — and it is deliberately NOT scoped to any course: it pulls from
// every course's words together, so nobody has to pick a course just to see
// what's due. Below it, a compact card per course leads to that course's own
// category list (app/courses/[courseId]/page.js). Which courses exist for a learner is one
// switch (lib/liveCourses.js): with ONE course live there is no "Courses" heading and no list,
// that course's card stands on its own as the main card, and there is nothing to pick between.
//
// It is the first screen's palette and button language (see "Home screen and course
// pages" in app/globals.css), and it follows the real time of day the same way: night
// by default, dawn in the morning. There is ONE obvious action. When words are due, the
// due card carries the only filled button and the time-of-day card (tonight's study, or
// last night's words) is quiet; with nothing due, that card takes the filled button. The
// cards still appear under exactly the same conditions as before and link to the same places.
//
// That is the RETURNING view. A first-time visitor (no saved progress on this
// device) gets components/FirstVisit.js instead: it is what the server renders,
// so it shows the moment the HTML arrives, and this component swaps to the
// returning view after hydration only if localStorage says there is progress.
// (The inline script in lib/preHydration.js hides the first-visit view before
// first paint for a returning device, so they never see it flash.)
export default function Home() {
  const [progress, setProgress] = useState({});
  const [streak, setStreak] = useState(0);
  // Consecutive mornings a full night-to-morning cycle was completed — a
  // different thing from `streak` (any quiz, any day). See lib/progress.js.
  const [nightToMorningStreak, setNightToMorningStreak] = useState(0);
  // false until localStorage says this device has saved progress. Starting at
  // false is deliberate: it matches the server-rendered first-visit view, so
  // there is no hydration mismatch and nothing waits on JavaScript to appear.
  const [returning, setReturning] = useState(false);
  const [ready, setReady] = useState(false);
  // The raw saved lists. What the learner may actually open is worked out in
  // render from these plus `subscribed` (lib/access.js), so the due count and
  // the "still learning" rows never include words from a locked tier.
  const [dueIds, setDueIds] = useState([]);
  const [struggleIds, setStruggleIds] = useState([]);
  const { subscribed, cancelAt } = useSubscription();
  const [openingPortal, setOpeningPortal] = useState(false);
  // Local device time, read on the client only (the page is prerendered, so
  // the server has no meaningful "now"). null until mounted.
  const [now, setNow] = useState(null);

  // Re-read whether this device is a returning one and keep <html data-returning>
  // (which decides, in CSS, what shows before hydration) in step with it.
  function syncReturning() {
    const isReturning = isReturningVisitor();
    setReturningAttribute(isReturning);
    setReturning(isReturning);
  }

  // A tab left open overnight shouldn't keep showing last night's evening
  // framing at breakfast — re-read the clock and progress on coming back.
  useEffect(() => {
    function refresh() {
      if (document.visibilityState !== "visible") return;
      syncReturning();
      setNow(new Date());
      setProgress(getAllProgress());
      setStreak(getStreak());
      setNightToMorningStreak(getNightToMorningStreak());
      setDueIds(getDueWordIds());
      setStruggleIds(getStruggleWordIds());
    }
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    clearLegacyFlags();
    syncReturning();
    setNow(new Date());
    setProgress(getAllProgress());
    setStreak(getStreak());
    setNightToMorningStreak(getNightToMorningStreak());
    setDueIds(getDueWordIds());
    setStruggleIds(getStruggleWordIds());
    setReady(true);
  }, []);

  function handleReset() {
    if (!window.confirm("Reset all progress on this device? This can't be undone.")) return;
    resetProgress();
    setProgress({});
    setStreak(0);
    setNightToMorningStreak(0);
    setStruggleIds([]);
    setDueIds([]);
    // A device with nothing left saved is a first visit again (unless it still
    // has a cached subscription), so the home screen follows.
    syncReturning();
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
  const isLocked = (categoryId, level) => isLevelLocked(categoryId, level.level, subscribed);
  const dueCount = ready ? accessibleWordIds(dueIds, subscribed).length : 0;
  const struggleCounts = ready ? countByCategory(accessibleWordIds(struggleIds, subscribed)) : {};
  const lastNight = ready && phase === "morning" ? findLastNightsLevel(categories, progress, now, isLocked) : null;
  const tonight = ready && phase === "evening" ? getTonight(courses, progress, now, isLocked) : null;

  // Words still being learned, one drill per category (the per-category design
  // is deliberate — see lib/wordbanks.js), gathered across every course.
  const stillLearning = ready
    ? categories.filter((category) => struggleCounts[category.id] > 0).map((category) => ({ category, count: struggleCounts[category.id] }))
    : [];

  // The one filled button on the screen: the due card's, or (with nothing due) the time-of-day
  // card's. The "pick a course" card has four equal choices, so it never has a filled one.
  const hasDue = ready && dueCount > 0;

  if (!returning) {
    // Both are in the server HTML; CSS (html[data-returning], set before first
    // paint) shows exactly one: the first-visit view for a new device, the
    // content-free loading state for a returning one while this hydrates.
    return (
      <>
        <FirstVisit />
        <HomeLoading />
      </>
    );
  }

  const learningRows = stillLearning.map(({ category, count }) => (
    <div key={category.id} className="flex items-center justify-between gap-2">
      <div className="min-w-0 py-1">
        <p className="text-sm font-semibold">{category.title}</p>
        <p className="vc-muted text-xs">
          {count} word{count !== 1 ? "s" : ""} still learning
        </p>
      </div>
      <div className="flex shrink-0">
        <Link href={`/sets/${missedWordsId(category.id)}/study`} className="vc-link">
          Study
        </Link>
        <Link href={`/sets/${missedWordsId(category.id)}/quiz`} className="vc-link font-semibold">
          Quiz
        </Link>
      </div>
    </div>
  ));

  return (
    <main className="vc-page">
      <div className="mx-auto max-w-md">
        <header className="flex min-h-[44px] items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <VocoMark size={26} />
            <span className="font-display text-xl">Voco</span>
            <NightThemeExplainer />
          </div>
          <div className="-mr-2 flex items-center">
            {/* Tap either streak to share it as an image (components/ShareButton.js). The visible
                label is just the number; the full name is the accessible name and the tooltip. */}
            {streak > 0 && (
              <ShareButton
                card={streakCard("daily", streak)}
                className="vc-chip-btn"
                title="Days in a row you finished a quiz. Tap to share."
                ariaLabel={`${streak} day streak, share`}
              >
                <Flame size={16} aria-hidden="true" style={{ color: "var(--vc-flame)" }} />
                {streak}
              </ShareButton>
            )}
            {nightToMorningStreak > 0 && (
              <ShareButton
                card={streakCard("streak", nightToMorningStreak)}
                className="vc-chip-btn"
                title="Mornings in a row you quizzed the words you studied the night before. Tap to share."
                ariaLabel={`${nightToMorningStreak} day night-to-morning streak, share`}
              >
                <Sunrise size={16} aria-hidden="true" style={{ color: "var(--vc-flame)" }} />
                {nightToMorningStreak}
              </ShareButton>
            )}
          </div>
        </header>

        {hasDue && (
          <section aria-labelledby="due-title" className="vc-surface mt-4 p-4">
            <h2 id="due-title" className="text-2xl font-semibold">
              {dueCount} word{dueCount !== 1 ? "s" : ""} due
            </h2>
            <Link href="/review" className="vc-btn mt-3 w-full">
              Review
            </Link>
            <div className="mt-1 flex justify-center">
              <Link href={`/sets/${DUE_FOR_REVIEW_ID}/study`} className="vc-link">
                Study
              </Link>
            </div>
            {stillLearning.length > 0 && (
              <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--vc-border)" }}>
                {learningRows}
              </div>
            )}
          </section>
        )}

        {lastNight && (
          <section className="vc-surface mt-3 p-4">
            <div className="flex items-center gap-2">
              <Sunrise size={16} aria-hidden="true" className="shrink-0" style={{ color: "var(--vc-flame)" }} />
              <h2 className="text-base font-semibold">Quiz last night's words</h2>
            </div>
            <p className="vc-muted mt-1 text-xs">{levelLabel(lastNight.category, lastNight.level)}</p>
            <div className="mt-3 flex items-center gap-1">
              <Link href={`/sets/${lastNight.level.id}/quiz`} className={`vc-btn min-w-0 flex-1 ${hasDue ? "vc-btn-quiet" : ""}`}>
                Take the quiz
              </Link>
              <Link href={`/sets/${lastNight.level.id}/study`} className="vc-link shrink-0">
                Restudy
              </Link>
            </div>
          </section>
        )}

        {tonight && (
          <section className="vc-surface mt-3 p-4">
            <div className="flex items-center gap-2">
              <Moon size={16} aria-hidden="true" className="shrink-0" style={{ color: "var(--vc-flame)" }} />
              <h2 className="text-base font-semibold">{tonight.kind === "done" ? "Tonight's study is done" : "Tonight's study"}</h2>
            </div>
            {tonight.kind === "done" ? (
              <p className="vc-muted mt-1 text-sm">Quiz it tomorrow morning.</p>
            ) : tonight.kind === "choose" && tonight.courses.length === 1 ? (
              // Nothing to follow yet, and only one course is live: nothing to choose between, so
              // one button to its levels (quiet while words are due, like the other cards).
              <>
                <p className="vc-muted mt-1 text-sm">Pick a level to study tonight.</p>
                <Link href={`/courses/${tonight.courses[0].id}`} className={`vc-btn mt-3 w-full ${hasDue ? "vc-btn-quiet" : ""}`}>
                  Open {tonight.courses[0].title}
                </Link>
              </>
            ) : tonight.kind === "choose" ? (
              // Nothing to follow yet (no course started), and no default course
              // on purpose: the learner picks where tonight's study happens. Equal
              // choices, so none is the filled button.
              <>
                <p className="vc-muted mt-1 text-sm">Pick a course to study tonight.</p>
                <div className="mt-3 flex flex-col gap-2">
                  {tonight.courses.map((course) => (
                    <Link key={course.id} href={`/courses/${course.id}`} className="vc-btn vc-btn-quiet w-full">
                      {course.title}
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="vc-muted mt-1 text-xs">{levelLabel(tonight.category, tonight.level)}</p>
                <p className="vc-muted mt-0.5 text-sm">Quiz it tomorrow morning.</p>
                <Link href={`/sets/${tonight.level.id}/study`} className={`vc-btn mt-3 w-full ${hasDue ? "vc-btn-quiet" : ""}`}>
                  Start studying
                </Link>
              </>
            )}
          </section>
        )}

        {/* Words still being learned: part of the due card when words are due, a card of its own otherwise. */}
        {!hasDue && stillLearning.length > 0 && (
          <section className="vc-surface mt-3 px-4 py-2">{learningRows}</section>
        )}

        {ready && subscribed && cancelAt && (
          <section className="vc-surface mt-3 p-4">
            <p className="text-base font-semibold">Subscription ends {formatDate(cancelAt)}</p>
            <p className="vc-muted mt-0.5 text-sm">Full access until then.</p>
            <button onClick={handleManageSubscription} disabled={openingPortal} className="vc-link -ml-3 disabled:opacity-50">
              {openingPortal ? "Opening..." : "Manage subscription"}
            </button>
          </section>
        )}

        {courses.length > 1 ? (
          <>
            <h2 className="vc-muted mb-3 mt-8 text-sm font-semibold">Courses</h2>
            <div className="space-y-3">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`} className="vc-surface vc-tap p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl">{course.title}</h3>
                    <ChevronRight size={18} aria-hidden="true" className="shrink-0" style={{ color: "var(--vc-subtext)" }} />
                  </div>
                  <p className="vc-muted mt-1 text-sm">{course.tagline}</p>
                  <CourseProgress course={course} progress={progress} className="mt-3" />
                </Link>
              ))}
            </div>
          </>
        ) : (
          // One live course: its card is the main card. No heading, no list. The same card, a
          // little larger (a page-title-sized Fraunces title), and a whole-card link.
          <Link href={`/courses/${courses[0].id}`} className="vc-surface vc-tap mt-6 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">{courses[0].title}</h2>
              <ChevronRight size={18} aria-hidden="true" className="shrink-0" style={{ color: "var(--vc-subtext)" }} />
            </div>
            <p className="vc-muted mt-1 text-sm">{courses[0].tagline}</p>
            <CourseProgress course={courses[0]} progress={progress} className="mt-4" />
          </Link>
        )}

        <footer className="mt-8 flex flex-col items-center">
          {ready && (
            <button onClick={handleReset} className="vc-link">
              <RotateCcw size={14} aria-hidden="true" className="mr-1.5" /> Reset progress
            </button>
          )}

          {ready && subscribed && !cancelAt && (
            <div className="flex flex-col items-center">
              <p className="vc-muted text-xs">You have full access.</p>
              <button onClick={handleManageSubscription} disabled={openingPortal} className="vc-link disabled:opacity-50">
                {openingPortal ? "Opening..." : "Manage subscription"}
              </button>
            </div>
          )}

          <div className="flex items-center justify-center">
            <Link href="/terms" className="vc-link !text-xs">
              Terms of Service
            </Link>
            <Link href="/privacy" className="vc-link !text-xs">
              Privacy Policy
            </Link>
          </div>
          <p className="vc-muted mt-1 text-center text-xs leading-snug">{TRADEMARK_NOTICE}</p>
        </footer>
      </div>
    </main>
  );
}
