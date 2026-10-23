import { redirect } from "next/navigation";
import { belongsToHiddenCourse } from "@/lib/wordbanks";

// Covers /sets/<id>/study and /sets/<id>/quiz. A level of a course that is not live
// (lib/liveCourses.js), or that course's "still learning" set, goes to the home screen with a
// real redirect, instead of the "That level doesn't exist." page an unknown id gets. A learner's
// saved progress in the hidden course is untouched and is there again when the course returns.
export default function SetLayout({ children, params }) {
  if (belongsToHiddenCourse(params.setId)) redirect("/");
  return children;
}
