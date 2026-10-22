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
  // First-visit answer options (components/FirstVisit.js, `.vc-option` in
  // globals.css): a filled surface whose edge is at least 3:1 against the card, plus
  // the colors for the hover / pressed / focus / correct / not-correct states. Every
  // ratio is asserted in scripts/test-first-visit.mjs. Night keeps the app's own
  // outcome colors (#7BC9A0 correct, #E08A9E not correct).
  optionFill: "#2A2C52",
  optionEdge: "#7A75B0",
  optionHover: "#313462",
  optionPress: "#3C407A",
  focus: "#8B85FF",
  ok: "#7BC9A0",
  okFill: "rgba(123,201,160,0.10)",
  no: "#E08A9E",
  noFill: "rgba(224,138,158,0.10)",
  // The raised look of the first-visit question card: a soft shadow under it and, at
  // night, a faint light edge along its top (a dark shadow alone barely shows on the
  // dark page). Decoration only, so there is no contrast to check.
  cardShadow: "0 14px 32px -14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
  // Home screen and course pages: the thin progress bar (track and fill) and the streak
  // icons. The fill and the icon clear 3:1 on the card and on the page in both phases
  // (asserted in scripts/test-pages.mjs).
  barTrack: "rgba(255,255,255,0.14)",
  barFill: "#8B85FF",
  flame: "#FF9B5C",
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
  // First-visit answer options, dawn side (see NIGHT). Two differences from the
  // night values, both for contrast on the cream card: the focus ring and pressed
  // edge are the dark plum (the orange accent is only 2:1 there), and the two
  // outcome colors are deeper tones of the same green and rose (the pale ones
  // used on other dawn screens are 1.9:1 and 2.4:1, below the 3:1 a border or
  // icon needs; these are 3.9:1 and 4.3:1).
  optionFill: "#FFEEDB",
  optionEdge: "#8A6E7D",
  optionHover: "#FFE6CC",
  optionPress: "#FFDAB8",
  focus: "#3D2B4F",
  ok: "#2F8F5B",
  okFill: "rgba(47,143,91,0.12)",
  no: "#C2506B",
  noFill: "rgba(194,80,107,0.12)",
  // The same raised card in daylight: a warm plum shadow rather than a black one.
  cardShadow: "0 14px 30px -14px rgba(61,43,79,0.35), 0 1px 3px rgba(61,43,79,0.08)",
  // The same bar and icons on cream. The accent orange is only 2:1 here, so these use a
  // deeper orange of the same hue (4.49:1 on the card, 3.53 to 4.17:1 on the page).
  barTrack: "rgba(61,43,79,0.14)",
  barFill: "#B65A1F",
  flame: "#B65A1F",
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
    `--vc-border:${theme.borderIdle};` +
    `--vc-option-fill:${theme.optionFill};--vc-option-edge:${theme.optionEdge};--vc-option-hover:${theme.optionHover};` +
    `--vc-option-press:${theme.optionPress};--vc-focus:${theme.focus};` +
    `--vc-ok:${theme.ok};--vc-ok-fill:${theme.okFill};--vc-no:${theme.no};--vc-no-fill:${theme.noFill};` +
    `--vc-card-shadow:${theme.cardShadow};` +
    `--vc-bar-track:${theme.barTrack};--vc-bar-fill:${theme.barFill};--vc-flame:${theme.flame};`
  );
}

export const THEME_CSS = `:root{${cssVars(NIGHT)}}html[data-phase="morning"]{${cssVars(DAWN)}}`;
