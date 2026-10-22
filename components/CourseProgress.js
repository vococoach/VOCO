import { getCourseProgress } from "@/lib/milestones";

// A thin bar and one short label: "1 of 18 levels". `ProgressLine` is the same pattern for any
// "done of total" count (passages, for instance).
export function ProgressLine({ done, total, unit, className = "" }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className={className}>
      <div className="vc-bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="vc-muted mt-2 text-xs">
        {done} of {total} {unit}
      </p>
    </div>
  );
}

// One course's own progress, separate from every other course. "Completed" means scored 100%
// at least once (the same rule as the mastery milestone; see lib/milestones.js).
export default function CourseProgress({ course, progress, className = "" }) {
  const p = getCourseProgress(course, progress);
  return <ProgressLine done={p.levelsCompleted} total={p.levelsTotal} unit="levels" className={className} />;
}
