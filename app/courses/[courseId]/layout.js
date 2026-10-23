import { redirect } from "next/navigation";
import { belongsToHiddenCourse } from "@/lib/wordbanks";

// A course that is not live (lib/liveCourses.js) has no page. An old link or a bookmark to
// it goes to the home screen, with a real redirect, before anything is drawn: no 404, no
// blank page. An id that is not a course at all keeps the page's own handling (it sends the
// visitor home too, from the browser).
export default function CourseLayout({ children, params }) {
  if (belongsToHiddenCourse(params.courseId)) redirect("/");
  return children;
}
