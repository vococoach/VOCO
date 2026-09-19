// Percentage-based score tiers, shared by the end-of-quiz card
// (components/QuizResults.js) and the home screen's level indicators
// (app/page.js) so the two can never disagree about what counts as what.
// Percentages, not raw counts, because levels (10-12 words), missed-words
// sessions (any size) and review sessions (up to 20) all differ in length.
//
//   100%      perfect — the app's "correct answer" green
//   70-99%    good    — the app's positive/CTA orange
//   below 70% watch   — the app's "incorrect answer" rose, but framed as
//                       useful information, never as a bad grade: those
//                       words are flagged and come back via review /
//                       missed words, which is the point of the feature.
//
// `accent` is used for graphics (disc, border, tint) and for text on the
// dark home screen. `deep` is a darker shade of the same hue for small text
// on the light cream results card, where the accent itself is too pale to
// read (each `deep` clears 4.5:1 against #FFF9F2).

export const GOOD_THRESHOLD_PERCENT = 70;

export const TIERS = {
  perfect: { accent: "#7BC9A0", deep: "#2F7A55", rgb: "123, 201, 160", label: "Perfect score" },
  good: { accent: "#FF9B5C", deep: "#A9501A", rgb: "255, 155, 92", label: "Almost there" },
  watch: { accent: "#E08A9E", deep: "#B24D69", rgb: "224, 138, 158", label: "Worth another look" },
};

export function getScoreTier(score, total) {
  if (!(total > 0)) return "watch";
  if (score === total) return "perfect";
  // Integer math: avoids float edge cases right at the 70% boundary.
  return score * 100 >= total * GOOD_THRESHOLD_PERCENT ? "good" : "watch";
}
