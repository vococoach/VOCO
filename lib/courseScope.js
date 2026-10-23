// The few phrases that say what a subscription covers. They name the course while one course
// is live ("full access to SAT Vocab") and say "every course" once there are several, so the
// wording is true after every launch without anyone editing copy: the paywall card, the sample
// question page and /unlock all build their sentences from this. (The Terms page uses `many`
// for the same reason: lib/liveCourses.js is the only thing to change when a course launches.)
//
// It is a function of the course list on purpose, so a test can ask what the words would be
// with any set of courses live.
import { courses } from "./wordbanks";

export function courseScope(liveCourses = courses) {
  const one = liveCourses.length === 1 ? liveCourses[0] : null;
  return {
    // More than one course is live.
    many: !one,
    // After "full access to" and after "Unlock".
    access: one ? one.title : "every course",
    // After "One subscription unlocks".
    all: one ? `all of ${one.title}` : "every course",
    // The start of a sentence: "___ is now available on this device."
    subject: one ? one.title : "Every course",
  };
}
