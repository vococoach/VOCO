"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryList from "@/components/CategoryList";
import CourseProgress from "@/components/CourseProgress";
import Onboarding from "@/components/Onboarding";
import { getCourse } from "@/lib/wordbanks";
import { getAllProgress } from "@/lib/progress";
import { useSubscription, useOnboarding, computeStruggleCounts } from "@/lib/useLearnerState";

// One course's category list — what the home screen showed before Voco had
// more than one course, scoped to this course's categories. The daily-habit
// cards (due for review, tonight's study, streaks) stay on the home screen,
// unscoped to any course.
//
// A course page can be a visitor's very first page (a shared or bookmarked
// link), so it shows the first-visit onboarding too — and afterwards stays on
// this URL, i.e. the course they came for, rather than sending them to the home
// screen. See useOnboarding() in lib/useLearnerState.js.
export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const course = getCourse(params.courseId);
  const { subscribed } = useSubscription();
  const { onboarding, finishOnboarding } = useOnboarding();
  const [progress, setProgress] = useState({});
  const [struggleCounts, setStruggleCounts] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(getAllProgress());
    setStruggleCounts(computeStruggleCounts());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!course) router.replace("/");
  }, [course, router]);

  if (!course) return null;

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
          <p className="text-sm text-[#9B97C4] mt-1 mb-2">{course.description}</p>
          <CourseProgress course={course} progress={progress} className="mb-8" />

          <CategoryList
            categories={course.categories}
            progress={progress}
            struggleCounts={struggleCounts}
            subscribed={subscribed}
            ready={ready}
          />
        </div>
      </div>
    </main>
  );
}
