// The single free sample question offered for each locked item, so a visitor can
// see the real question format before paying. Covers every kind of locked
// thing (see lib/purchase.js for what's free):
//   - a vocabulary category that is wholly locked      → /preview/<categoryId>
//   - a locked tier of a free category (its Advanced,
//     and SAT Vocab's Expert)                           → /preview/<levelId>
//   - a Grammar & Usage category                        → /preview/<categoryId>
//   - a reading passage                                 → /preview/<passageId>
//   - a cross-text pair                                 → /preview/<pairId>
//   (All of these ids are unique across the library — scripts/test-access.mjs
//   checks it — so one route can serve them all.)
//
// Deliberately ONE fixed question per item — the first word of the first level
// (or of the tier itself), the first question of the first grammar level, the
// first question of the passage or pair — not a random draw and not a way into
// the content: the goal is showing format and quality, not metering usage.
// There is no login and no tracking; revisiting just shows the same sample
// again. (Content is bundled client-side either way — the paywall is UI-level,
// per CLAUDE.md — so this leaks nothing new.)
//
// Returns null for anything that isn't locked for a non-subscriber (an unknown
// id, or something free), which is what sends the preview page home.

import { courses, categories, findLevel, getCategoryCourse } from "./wordbanks";
import { isFreeCategory, isLevelLocked, isPassageLocked, isGrammarCategoryLocked } from "./purchase";

function sample(fields) {
  return {
    notes: null,
    goal: null,
    chart: null,
    passages: [],
    ...fields,
  };
}

export function getPreviewSample(id) {
  // A whole vocabulary category (each course's free one is not previewable —
  // it is just free).
  const category = categories.find((c) => c.id === id);
  if (category && !isFreeCategory(category.id) && category.levels.length > 0) {
    const word = category.levels[0].words[0];
    const total = category.levels.reduce((n, level) => n + level.words.length, 0);
    return sample({
      kind: "vocab",
      course: getCategoryCourse(category.id),
      title: category.title,
      countLine: `That was 1 of ${total} questions in ${category.title}.`,
      stem: word.quiz.sentence,
      cue: "Which word best completes the sentence?",
      options: word.quiz.options,
      correctIndex: word.quiz.correctIndex,
      explanation: word.quiz.explanation,
    });
  }

  // One locked tier of a free category.
  const found = findLevel(id);
  if (found && isLevelLocked(found.category.id, found.level.level, false) && isFreeCategory(found.category.id)) {
    const word = found.level.words[0];
    const title = `${found.category.title} · ${found.level.label}`;
    return sample({
      kind: "vocab",
      course: found.course,
      title,
      countLine: `That was 1 of ${found.level.words.length} questions in the ${found.level.label} tier of ${found.category.title}.`,
      stem: word.quiz.sentence,
      cue: "Which word best completes the sentence?",
      options: word.quiz.options,
      correctIndex: word.quiz.correctIndex,
      explanation: word.quiz.explanation,
    });
  }

  for (const course of courses) {
    // A Grammar & Usage category.
    const grammar = (course.grammar || []).find((g) => g.id === id);
    if (grammar && isGrammarCategoryLocked(grammar.id, false)) {
      const q = grammar.levels[0].questions[0];
      const total = grammar.levels.reduce((n, l) => n + l.questions.length, 0);
      return sample({
        kind: "grammar",
        course,
        title: grammar.title,
        countLine: `That was 1 of ${total} questions in ${grammar.title}.`,
        stem: null,
        cue: q.prompt,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        notes: q.notes || null,
        goal: q.goal || null,
      });
    }

    // A reading passage.
    const passage = (course.passages || []).find((p) => p.id === id);
    if (passage && isPassageLocked(passage.id, false)) {
      const q = passage.questions[0];
      return sample({
        kind: "passage",
        course,
        title: passage.title,
        countLine: `That was 1 of ${passage.questions.length} question${passage.questions.length !== 1 ? "s" : ""} on this passage.`,
        stem: q.prompt,
        cue: null,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        chart: q.chart || null,
        passages: [{ title: passage.title, subject: passage.subject, text: passage.text }],
      });
    }

    // A cross-text pair.
    const pair = (course.crossTextPairs || []).find((p) => p.id === id);
    if (pair && isPassageLocked(pair.id, false)) {
      const q = pair.questions[0];
      return sample({
        kind: "cross-text",
        course,
        title: `${pair.passageA.title} & ${pair.passageB.title}`,
        countLine: `That was 1 of ${pair.questions.length} question${pair.questions.length !== 1 ? "s" : ""} on this pair.`,
        stem: q.prompt,
        cue: null,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        passages: [pair.passageA, pair.passageB].map((t) => ({ title: t.title, subject: t.subject, text: t.text })),
      });
    }
  }
  return null;
}
