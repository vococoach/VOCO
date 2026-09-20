// The single free sample question offered for each locked category, so a
// visitor can see the real words-in-context format before paying.
//
// Deliberately ONE fixed question per category — the first word of the
// first level — not a random draw and not a way into the level: the goal is
// showing format and quality, not gating or metering usage. There is no
// login and no tracking; revisiting just shows the same sample again.
// (Content is bundled client-side either way — the paywall is UI-level, per
// CLAUDE.md — so this leaks nothing new.)

import { categories } from "./wordbanks";
import { FREE_CATEGORY_ID } from "./purchase";

export function getPreviewSample(categoryId) {
  const category = categories.find((c) => c.id === categoryId);
  // Only the paid categories have previews — the free one is just free.
  if (!category || category.id === FREE_CATEGORY_ID || category.levels.length === 0) return null;
  const word = category.levels[0].words[0];
  const totalQuestions = category.levels.reduce((n, level) => n + level.words.length, 0);
  return { category, word, totalQuestions };
}
