import { redirect } from "next/navigation";
import { belongsToHiddenCourse } from "@/lib/wordbanks";

// The sample-question page for an item of a course that is not live (lib/liveCourses.js)
// goes to the home screen with a real redirect. (An unknown id already did, from the browser.)
export default function PreviewLayout({ children, params }) {
  if (belongsToHiddenCourse(params.categoryId)) redirect("/");
  return children;
}
