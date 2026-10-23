// THE SWITCH: which courses learners can see.
//
// A course whose id is not in this list is hidden everywhere at once. It is not on the home
// screen or the first screen, not on /unlock or in the Terms, its words are never served by
// review, due-for-review or "still learning", and its URLs send the visitor home. The wording
// that depends on how many courses are live ("full access to SAT Vocab" now, "full access to
// every course" with several) follows this list too (lib/courseScope.js).
//
// Nothing is deleted. Every course stays in lib/ (`allCourses` in lib/wordbanks.js), the
// validators and tests still cover all of it, and the progress a learner saved in a hidden
// course stays on their device and comes back with the course.
//
// To launch a course, add its id here. That is the whole change, and scripts/test-launch.mjs
// proves it: it edits this one line in a scratch copy, builds that copy and checks that the
// course is back on every screen and every link.
//
// Course ids: sat-vocab, everyday-vocabulary, professional-vocabulary, gre-vocab.
// Keep the list on one line (the test edits it) and keep "sat-vocab" in it: the first screen's
// free question and the practice test live in that course.
export const LIVE_COURSES = ["sat-vocab"];

export function isLiveCourseId(courseId) {
  return LIVE_COURSES.includes(courseId);
}
