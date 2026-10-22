"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryList from "@/components/CategoryList";
import CourseProgress from "@/components/CourseProgress";
import PassageList from "@/components/PassageList";
import CrossTextList from "@/components/CrossTextList";
import GrammarList from "@/components/GrammarList";
import PracticeTestTab from "@/components/PracticeTestTab";
import SectionPills from "@/components/SectionPills";
import StrategyList from "@/components/StrategyList";
import { getCourse, getCourseSections } from "@/lib/wordbanks";
import { getAllProgress, getStruggleWordIds } from "@/lib/progress";
import { accessibleWordIds, countByCategory } from "@/lib/access";
import { getAllPassageRecords } from "@/lib/passageProgress";
import { getAllGrammarRecords } from "@/lib/grammarProgress";
import { getAllPracticeTestAttempts } from "@/lib/practiceTestProgress";
import { isPassageLocked } from "@/lib/purchase";
import { useSubscription } from "@/lib/useLearnerState";

// One course's category list — what the home screen showed before Voco had more than one
// course, scoped to this course's categories. The daily-habit cards (due for review,
// tonight's study, streaks) stay on the home screen, unscoped to any course.
//
// The page is the first screen's palette and button language (see "Home screen and course
// pages" in app/globals.css): a title, one short line, the section pills, a thin progress
// bar, and light cards with one primary button each. Nothing here decides access or
// progress; it only lays out what lib/ already knows.
//
// A course that defines extra sections (the SAT course has reading passages, grammar
// questions, a practice test and strategy guides) gets a row of section pills under its
// header — Vocabulary | Passages | Grammar & usage | Practice test | Strategy — driven by
// getCourseSections(). It always opens on Vocabulary, so the page looks as it always did, and
// the chosen section lives in the URL (?section=passages) so it can be linked and so "Back"
// from a passage, grammar level or guide returns to the right one. A course with no extra
// sections shows no pills.
//
// A course page can be a visitor's very first page (a shared or bookmarked link). It shows
// the course straight away — nothing sits in front of it.
export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const course = getCourse(params.courseId);
  const sections = course ? getCourseSections(course) : null;
  const requested = searchParams.get("section");
  const section = sections && sections.some((s) => s.id === requested) ? requested : "vocabulary";
  const { subscribed } = useSubscription();
  const [progress, setProgress] = useState({});
  const [struggleIds, setStruggleIds] = useState([]);
  const [passageRecords, setPassageRecords] = useState({});
  const [grammarRecords, setGrammarRecords] = useState({});
  const [practiceTestAttempts, setPracticeTestAttempts] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(getAllProgress());
    setPassageRecords(getAllPassageRecords());
    setGrammarRecords(getAllGrammarRecords());
    setPracticeTestAttempts(getAllPracticeTestAttempts());
    setStruggleIds(getStruggleWordIds());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!course) router.replace("/");
  }, [course, router]);

  if (!course) return null;

  // Only words in tiers this learner can open count toward "still learning"
  // (lib/access.js) — the drill can't serve the others.
  const struggleCounts = countByCategory(accessibleWordIds(struggleIds, subscribed));

  // The Passages section shows one paywall card: PassageList places it before its first locked
  // passage, and the cross-text pairs below place it only if no passage is locked.
  const passageLocked = (course.passages || []).some((passage) => isPassageLocked(passage.id, subscribed));

  // Switching sections only rewrites the URL (no navigation), so it is instant.
  function selectSection(id) {
    const path = window.location.pathname;
    window.history.replaceState(null, "", id === "vocabulary" ? path : `${path}?section=${id}`);
  }

  return (
    <main className="vc-page">
      <div className="mx-auto max-w-md">
        <Link href="/" className="vc-link -ml-3">
          <ArrowLeft size={16} aria-hidden="true" className="mr-1" /> Back
        </Link>

        {/* Hidden (not removed) until localStorage is read, so locked items never flash as unlocked. */}
        <div className={ready ? "" : "invisible"}>
          <h1 className="font-display mt-1 text-2xl">{course.title}</h1>
          <p className="vc-muted mt-1 text-sm">{course.tagline || course.description}</p>

          {sections && (
            <div className="mt-4">
              <SectionPills sections={sections} value={section} onSelect={selectSection} label={`${course.title} sections`} />
            </div>
          )}

          <div
            role={sections ? "tabpanel" : undefined}
            id={`panel-${section}`}
            aria-labelledby={sections ? `tab-${section}` : undefined}
            className="mt-5"
          >
            {section === "vocabulary" && (
              <>
                <CourseProgress course={course} progress={progress} className="mb-6" />

                <CategoryList
                  categories={course.categories}
                  progress={progress}
                  struggleCounts={struggleCounts}
                  subscribed={subscribed}
                  ready={ready}
                />
              </>
            )}
            {section === "passages" && (
              <>
                <PassageList passages={course.passages} records={passageRecords} subscribed={subscribed} ready={ready} />
                <CrossTextList
                  pairs={course.crossTextPairs}
                  records={passageRecords}
                  subscribed={subscribed}
                  ready={ready}
                  showPaywall={!passageLocked}
                />
              </>
            )}
            {section === "grammar" && (
              <GrammarList categories={course.grammar} records={grammarRecords} subscribed={subscribed} ready={ready} />
            )}
            {section === "practice-test" && (
              <PracticeTestTab attempts={practiceTestAttempts} subscribed={subscribed} ready={ready} />
            )}
            {section === "strategy" && <StrategyList guides={course.guides} />}
          </div>
        </div>
      </div>
    </main>
  );
}
