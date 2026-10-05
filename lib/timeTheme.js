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
// `accent`/`onAccent` is each theme's primary-action button color/text. On DAWN
// `onAccent` is dark, not white (see below): never hardcode white on the orange.
// `optionIdle` is an unselected quiz-option button's idle border+background.
// Outcome colors (correct green, wrong rose) are deliberately NOT part of
// this palette — they're already proven to read fine on both a light and a
// dark surface (the practice test's always-dark results screen already uses
// them), so they stay the same two hex values regardless of theme; only the
// SURFACE they sit on changes.
export const NIGHT = {
  isDawn: false,
  page: "bg-[#1A1C3A]",
  // Plain-CSS twins of the values above, for the CSS variables (see
  // THEME_CSS below) the first-visit screen paints from before any JavaScript
  // runs.
  pageCss: "#1A1C3A",
  borderIdle: "#ffffff26",
  subtextAA: "#9B97C4",
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
  pageCss: "linear-gradient(to bottom, #FFD9B0, #FFEFDD)",
  borderIdle: "#00000033",
  // DAWN's `subtext` (#8A6E7D) is only ~3.4–4.0:1 on the dawn background, short
  // of AA for small text; this darker plum is ~5.2:1. First-visit screen only.
  subtextAA: "#6B5262",
  card: "#FFF9F2",
  text: "#3D2B4F",
  subtext: "#8A6E7D",
  muted: "#8A6E7D",
  accent: "#FF9B5C",
  // Dark text on the dawn orange, never white: white on #FF9B5C is only ~2.1:1,
  // below the 4.5:1 minimum for button text. #3D2B4F (the dawn text color) on
  // #FF9B5C is ~5.9:1. Every primary-action button reads its text from here, so
  // a new screen gets this right by using `theme.onAccent` — see CLAUDE.md
  // "Contrast on dawn orange".
  onAccent: "#3D2B4F",
  optionIdle: "border-[#00000014] bg-transparent",
};

export function getActivityTheme(now) {
  return getPhase(now) === "morning" ? DAWN : NIGHT;
}

// The same two palettes as CSS custom properties, so a screen can be painted in
// the right one by the stylesheet alone: NIGHT on :root, DAWN while
// <html data-phase="morning"> (set before first paint by the inline script in
// lib/preHydration.js, which uses the same morning window as getPhase()). The
// first-visit screen is server-rendered and has no JavaScript-chosen theme, so
// this is how a morning visitor gets dawn colors with no dark-then-light flash.
function cssVars(theme) {
  return (
    `--vc-page:${theme.pageCss};--vc-card:${theme.card};--vc-text:${theme.text};` +
    `--vc-subtext:${theme.subtextAA};--vc-accent:${theme.accent};--vc-cta-text:${theme.onAccent};` +
    `--vc-border:${theme.borderIdle};`
  );
}

export const THEME_CSS = `:root{${cssVars(NIGHT)}}html[data-phase="morning"]{${cssVars(DAWN)}}`;
