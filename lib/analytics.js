// Custom Vercel Web Analytics events — the three that measure the first-visit
// funnel (see CLAUDE.md "Analytics events"). Strictly anonymous, like the page
// views: no cookies, no user or customer ids, nothing derived from progress, and
// no event properties except the one fixed, non-personal `placement` label on
// trial_cta_clicked. Custom events need a Vercel plan that includes them and
// Web Analytics enabled for the project; in development track() only logs to
// the console, and if it's ever unavailable it fails silently — analytics must
// never break a page. (They also don't count toward Vercel's bounce rate, which
// is a single-page-session measure; that's why the first screen has to earn
// real engagement instead of relying on them.)
import { track } from "@vercel/analytics";

export const EVENTS = {
  firstQuestionAnswered: "first_question_answered",
  keepGoingClicked: "keep_going_clicked",
  trialCtaClicked: "trial_cta_clicked",
};

export function trackEvent(name, props) {
  try {
    track(name, props);
  } catch (e) {
    // never let analytics break the page
  }
}
