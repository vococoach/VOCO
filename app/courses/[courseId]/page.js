"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryList from "@/components/CategoryList";
import CourseProgress from "@/components/CourseProgress";
import PassageList from "@/components/PassageList";
import GrammarList from "@/components/GrammarList";
import StrategyList from "@/components/StrategyList";
import Onboarding from "@/components/Onboarding";
import { getCourse, getCourseSections } from "@/lib/wordbanks";
import { getAllProgress } from "@/lib/progress";
import { getAllPassageRecords } from "@/lib/passageProgress";
import { getAllGrammarRecords } from "@/lib/grammarProgress";
import { useSubscription, useOnboarding, computeStruggleCounts } from "@/lib/useLearnerState";

// One course's category list — what the home screen showed before Voco had
// more than one course, scoped to this course's categories. The daily-habit
// cards (due for review, tonight's study, streaks) stay on the home screen,
// unscoped to any course.
//
// A course that defines extra sections (the SAT course has reading passages,
// grammar questions and strategy guides) gets a tab bar under its header —
// Vocabulary | Passages | Grammar | Strategy — driven by getCourseSections().
// It always opens on Vocabulary, so the page looks as it always did, and the
// chosen tab lives in the URL (?section=passages) so it can be linked and so
// "Back" from a passage, grammar level or guide returns to the right tab. A
// course with no extra sections shows no tabs.
//
// A course page can be a visitor's very first page (a shared or bookmarked
// link), so it shows the first-visit onboarding too — and afterwards stays on
// this URL, i.e. the course they came for, rather than sending them to the home
// screen. See useOnboarding() in lib/useLearnerState.js.
export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const course = getCourse(params.courseId);
  const sections = course ? getCourseSections(course) : null;
  const requested = searchParams.get("section");
  const section = sections && sections.some((s) => s.id === requested) ? requested : "vocabulary";
  const { subscribed } = useSubscription();
  const { onboarding, finishOnboarding } = useOnboarding();
  const [progress, setProgress] = useState({});
  const [struggleCounts, setStruggleCounts] = useState({});
  const [passageRecords, setPassageRecords] = useState({});
  const [grammarRecords, setGrammarRecords] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(getAllProgress());
    setPassageRecords(getAllPassageRecords());
    setGrammarRecords(getAllGrammarRecords());
    setStruggleCounts(computeStruggleCounts());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!course) router.replace("/");
  }, [course, router]);

  if (!course) return null;

  // Switching tabs only rewrites the URL (no navigation), so it is instant.
  function selectSection(id) {
    const path = window.location.pathname;
    window.history.replaceState(null, "", id === "vocabulary" ? path : `${path}?section=${id}`);
  }

  if (onboarding) {
    return <Onboarding onFinish={finishOnboarding} />;
  }

  return (
    // Hidden (not removed) until we know whether this is a first visit, so a
    // first-timer never glimpses the course before the onboarding.
    <main className={`min-h-dvh bg-[#1A1C3A] px-4 py-8 ${onboarding === null ? "invisible" : ""}`}>
      <div className="max-w-md mx-auto">
        <Link href="/" className="flex items-center gap-1 text-xs text-[#9B97C4] mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        {/* Hidden (not removed) until localStorage is read, so locked categories never flash as unlocked. */}
        <div className={ready ? "" : "invisible"}>
          <h1 className="font-display text-2xl text-[#EDEBFF]">{course.title}</h1>
          <p className={`text-sm text-[#9B97C4] mt-1 ${sections ? "mb-5" : "mb-2"}`}>{course.description}</p>

          {sections && (
            <div role="tablist" aria-label={`${course.title} sections`} className="flex gap-1 p-1 rounded-xl bg-[#20223F] mb-6">
              {sections.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-selected={section === s.id}
                  aria-controls={`panel-${s.id}`}
                  onClick={() => selectSection(s.id)}
                  className={`flex-1 text-sm rounded-lg py-2 font-medium ${
                    section === s.id ? "bg-[#8B85FF] text-[#14152B]" : "text-[#9B97C4]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div role={sections ? "tabpanel" : undefined} id={`panel-${section}`} aria-labelledby={sections ? `tab-${section}` : undefined}>
            {section === "vocabulary" && (
              <>
                <CourseProgress course={course} progress={progress} className="mb-8" />

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
              <PassageList passages={course.passages} records={passageRecords} subscribed={subscribed} ready={ready} />
            )}
            {section === "grammar" && (
              <GrammarList categories={course.grammar} records={grammarRecords} subscribed={subscribed} ready={ready} />
            )}
            {section === "strategy" && <StrategyList guides={course.guides} />}
          </div>
        </div>
      </div>
    </main>
  );
}
