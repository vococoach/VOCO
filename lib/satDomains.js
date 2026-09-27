// The Digital SAT Reading & Writing section's 4 official domains, per the
// College Board's own published test specification — the ground truth this
// course is checked against. Verified 2026-09-24 directly from
// https://satsuite.collegeboard.org/k12-educators/about/alignment/reading
// (not a test-prep aggregator); re-check this file if College Board ever
// revises the spec, the same "verify, don't assume" discipline used for the
// module/timing format in lib/practiceTest.js.
//
// 54 questions per full test, 2 modules of 27, 32 minutes per module,
// no guessing penalty (see lib/practiceTest.js, lib/satStrategy.js).
//
// This is pure reference data — nothing in the app imports it at runtime as
// of 2026-09-24. It exists so any future content or practice-test work
// starts from the real domain weights instead of an assumed or arbitrary
// split. See CLAUDE.md "SAT domain accuracy audit" for how the current
// content actually maps onto this (spoiler: unevenly — Craft and Structure
// is heavily over-represented and Expression of Ideas doesn't exist yet).
export const SAT_RW_DOMAINS = [
  {
    id: "craft-and-structure",
    name: "Craft and Structure",
    weight: 0.28,
    skills: ["Words in Context", "Text Structure and Purpose", "Cross-Text Connections"],
  },
  {
    id: "information-and-ideas",
    name: "Information and Ideas",
    weight: 0.26,
    skills: ["Central Ideas and Details", "Command of Evidence (Textual)", "Command of Evidence (Quantitative)", "Inferences"],
  },
  {
    id: "standard-english-conventions",
    name: "Standard English Conventions",
    weight: 0.26,
    skills: ["Boundaries", "Form, Structure, and Sense"],
  },
  {
    id: "expression-of-ideas",
    name: "Expression of Ideas",
    weight: 0.2,
    skills: ["Rhetorical Synthesis", "Transitions"],
  },
];
