import { getCourseProgress } from "@/lib/milestones";

// One course's own progress summary — how much of THIS course is done,
// separate from every other course. "Completed" means scored 100% at least
// once (the same rule as the mastery milestone; see lib/milestones.js).
export default function CourseProgress({ course, progress, className = "" }) {
  const p = getCourseProgress(course, progress);
  return (
    <p className={`text-xs text-[#9B97C4] ${className}`}>
      {p.categoriesMastered} of {p.categoriesTotal} categories mastered · {p.levelsCompleted} of {p.levelsTotal} levels
      completed
    </p>
  );
}
