import { getPhase } from "./timeOfDay";

// Two coordinated palettes for a full-screen learning activity — study, quiz,
// reading passages, grammar, the timed practice test, review, missed words.
// Which one applies is driven by the REAL, current time of day (getPhase()),
// NEVER by what TYPE of activity the screen is. See CLAUDE.md "Screens
// follow real time, not activity type" for the reasoning and the rule for
// any new screen. Midday defaults to NIGHT (the calm palette) — there's no
// reason to warm a screen up at 2pm, and it matches the home screen's own
// long-standing "neutral state = the dark shell" precedent; only the
// morning window gets the warm DAWN palette. The one hard requirement this
// exists to satisfy: nothing bright and warm shows up on a screen late at
// night, regardless of whether that screen happens to be "study-shaped" or
// "quiz-shaped."
//
// `accent`/`onAccent` is each theme's primary-action button color/text.
// `optionIdle` is an unselected quiz-option button's idle border+background.
// Outcome colors (correct green, wrong rose) are deliberately NOT part of
// this palette — they're already proven to read fine on both a light and a
// dark surface (the practice test's always-dark results screen already uses
// them), so they stay the same two hex values regardless of theme; only the
// SURFACE they sit on changes.
export const NIGHT = {
  isDawn: false,
  page: "bg-[#1A1C3A]",
  card: "#20223F",
  text: "#EDEBFF",
  subtext: "#9B97C4",
  muted: "#6E699B",
  accent: "#8B85FF",
  onAccent: "#14152B",
  optionIdle: "border-[#ffffff26] bg-transparent",
};

export const DAWN = {
  isDawn: true,
  page: "bg-gradient-to-b from-[#FFD9B0] to-[#FFEFDD]",
  card: "#FFF9F2",
  text: "#3D2B4F",
  subtext: "#8A6E7D",
  muted: "#8A6E7D",
  accent: "#FF9B5C",
  onAccent: "#FFFFFF",
  optionIdle: "border-[#00000014] bg-transparent",
};

export function getActivityTheme(now) {
  return getPhase(now) === "morning" ? DAWN : NIGHT;
}
