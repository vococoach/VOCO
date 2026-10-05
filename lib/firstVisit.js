// The one question a first-time visitor answers on the home screen
// (components/FirstVisit.js). Chosen, not random, and the same for everyone.
//
// Why this one — "Uphold" from Agreement & Support · Foundational:
//   - It is a real question from the free level, in the real quiz format, so
//     "Keep going" continues into the very level they just sampled.
//   - It's easy to get right on a first read, but with a genuine pull the other
//     way: "Overturn" is a tempting wrong answer, and the sentence's own cue
//     ("despite public pressure to change") is what settles it. That teaches the
//     skill the whole app is about — reading context, not recalling definitions
//     — in about five seconds.
//   - Short (94 characters) and one clause, so it fits a 375px-wide phone with
//     all four options and the explanation, no scrolling.
//   - Single-word options, so they sit in a compact 2×2 grid of large tap targets.
//   - It's a self-explanatory, everyday-feeling scene (a judge, a ruling) and
//     needs no specialist knowledge.
// The other eleven Foundational sentences were read against it; "Verify"
// (journalist) and "Support" (committee) were the runners-up, but "Uphold" has
// the strongest distractor and the clearest explanation.
//
// The on-screen order is fixed rather than shuffled: the question is the same
// for every visitor, and shuffling after mount would swap the options under
// someone's thumb a moment after the server-rendered page appeared. The data
// lists the correct option first (index 0); this order puts it third, so it is
// not in the first slot. Used only here — real quizzes still shuffle every time.

import { findLevel } from "./wordbanks";

export const FIRST_VISIT_LEVEL_ID = "agreement-support-1";
export const FIRST_VISIT_WORD = "Uphold";
export const FIRST_VISIT_OPTION_ORDER = [1, 2, 0, 3];

export function getFirstVisitQuestion() {
  const found = findLevel(FIRST_VISIT_LEVEL_ID);
  const word = found.level.words.find((w) => w.word === FIRST_VISIT_WORD);
  return {
    levelId: FIRST_VISIT_LEVEL_ID,
    category: found.category,
    word,
    quiz: word.quiz,
    order: FIRST_VISIT_OPTION_ORDER,
  };
}
