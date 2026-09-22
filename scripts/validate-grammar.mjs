// Validates lib/satGrammar.js. Run with `npm run validate:grammar` after
// adding or editing any grammar question, before shipping.
//
// This checks structure and mechanical rules only — same philosophy as
// scripts/validate-passages.mjs, built the same way for the same reason: a
// script can confirm the DATA declares exactly one correct answer among 4
// genuinely distinct options, that no explanation refers to a choice by its
// on-screen position, and that a level or category isn't accidentally
// lopsided or duplicated. It CANNOT tell whether the designated answer is
// actually the only grammatically defensible one, or whether a "wrong"
// option is a real mistake people make rather than nonsense — that's the
// manual close-read (see CLAUDE.md, "SAT Vocab has three sections" and
// "Grammar & Standard English Conventions"), and this script does not
// replace it.

import { satGrammarCategories } from "../lib/satGrammar.js";

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`);
};

// Same pattern as scripts/validate-passages.mjs: catches an explanation that
// names a choice by its on-screen position ("the first choice", "option B")
// instead of by content. Options are shuffled on screen, so a positional
// reference is either meaningless or points at the wrong answer.
const POSITIONAL_LANGUAGE = new RegExp(
  "\\b(first|second|third|fourth|fifth|last|final)\\s+(choices?|options?|answers?)\\b" +
    "|\\b(choices?|options?|answers?)\\s+(one|two|three|four|five|[A-D])\\b",
  "i"
);

ok("at least 2 categories", satGrammarCategories.length >= 2, String(satGrammarCategories.length));
ok(
  "unique category ids",
  new Set(satGrammarCategories.map((c) => c.id)).size === satGrammarCategories.length
);
ok("category ids are url-safe slugs", satGrammarCategories.every((c) => /^[a-z0-9-]+$/.test(c.id)));

const allLevelIds = satGrammarCategories.flatMap((c) => c.levels.map((l) => l.id));
ok("unique level ids across the whole file", new Set(allLevelIds).size === allLevelIds.length);

const allQuestions = [];
for (const cat of satGrammarCategories) {
  ok(`${cat.id}: same 3-tier structure as vocabulary`, cat.levels.length === 3, String(cat.levels.length));
  ok(
    `${cat.id}: level ids are "<category>-<n>"`,
    cat.levels.every((l, i) => l.id === `${cat.id}-${i + 1}`)
  );

  const typesInCategory = new Set();
  for (const level of cat.levels) {
    ok(
      `${level.id}: a reasonable question count (3–8, quality over a fixed target)`,
      level.questions.length >= 3 && level.questions.length <= 8,
      String(level.questions.length)
    );

    for (const [i, q] of level.questions.entries()) {
      const w = `${level.id} Q${i + 1} (${q.type})`;
      allQuestions.push({ id: w, ...q });
      typesInCategory.add(q.type);

      ok(
        `${w}: 4 distinct options — exactly one designated correct answer`,
        q.options.length === 4 &&
          new Set(q.options.map((o) => o.toLowerCase().trim())).size === 4 &&
          q.correctIndex === 0
      );
      ok(
        `${w}: each option reads like a real sentence, not a stray word`,
        q.options.every((o) => o.trim().split(/\s+/).length >= 4)
      );
      ok(`${w}: prompt present`, typeof q.prompt === "string" && q.prompt.length > 10);
      ok(`${w}: explanation present and substantial`, q.explanation.length > 120);
      ok(`${w}: explanation never refers to a choice by position`, !POSITIONAL_LANGUAGE.test(q.explanation));
      ok(`${w}: explanation names the actual rule, not just "this one is correct"`, q.explanation.length > 0 && !/^(this|the correct answer) (choice|option|one) is correct\.?$/i.test(q.explanation.trim()));
    }
  }
  ok(
    `${cat.id}: real variety of rules tested (at least 3 distinct types across its levels)`,
    typesInCategory.size >= 3,
    [...typesInCategory].join(", ")
  );
}

const correctSentences = allQuestions.map((q) => q.options[0].toLowerCase().trim());
ok(
  "no two questions share the same correct sentence (catches accidental duplication)",
  new Set(correctSentences).size === correctSentences.length
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
