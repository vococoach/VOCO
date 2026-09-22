// Validates lib/satPassages.js. Run with `npm run validate:passages` after
// adding or editing any reading passage, before shipping.
//
// This checks structure and mechanical rules only — options count and
// distinctness, word/question counts, blank-count matching a words-in-context
// question, no passage repeating a question type, a real mix of types across
// the library, and (see checkNoPositionalLanguage below) that an explanation
// never refers to an answer choice by its on-screen position. It does NOT
// replace reading every new passage against its actual shuffled options on
// screen — that close read is what has caught every real ambiguity bug so
// far (see CLAUDE.md, "SAT Vocab has three sections"); this script only
// catches the mechanical regressions a human read-through would be slow to
// re-check by hand every time.

import { satPassages } from "../lib/satPassages.js";

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "") => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`);
};

const countWords = (text) => text.replace(/______/g, "BLANK").split(/\s+/).filter(Boolean).length;

// The bug that shipped twice: an explanation says "the first choice" / "the
// second option" / "choice B" instead of naming what the choice actually
// says. Harmless when options are listed in a fixed order, but options here
// are shuffled on screen (correctIndex: 0 in the data is never position 0 on
// screen), so a positional reference is either meaningless or, worse, points
// at the wrong answer. Scoped to two precise patterns — an ordinal/"last"
// immediately next to choice/option/answer, or that noun immediately next to
// a letter or number — rather than bare ordinals, so it doesn't false-positive
// on ordinary prose describing the passage's own content (e.g. "the third
// crate," "a first explanation").
const POSITIONAL_LANGUAGE = new RegExp(
  "\\b(first|second|third|fourth|fifth|last|final)\\s+(choices?|options?|answers?)\\b" +
    "|\\b(choices?|options?|answers?)\\s+(one|two|three|four|five|[A-D])\\b",
  "i"
);

ok("at least 5 passages (a real library)", satPassages.length >= 5, String(satPassages.length));
ok("unique passage ids", new Set(satPassages.map((p) => p.id)).size === satPassages.length);
ok("ids are url-safe slugs", satPassages.every((p) => /^[a-z0-9-]+$/.test(p.id)));

for (const p of satPassages) {
  const n = countWords(p.text.join(" "));
  ok(`${p.id}: ${n} words (want 100–150)`, n >= 100 && n <= 150);
  ok(`${p.id}: 1–2 questions`, p.questions.length >= 1 && p.questions.length <= 2, String(p.questions.length));

  const blanks = (p.text.join(" ").match(/______/g) || []).length;
  const wic = p.questions.filter((q) => q.type === "words-in-context").length;
  ok(
    `${p.id}: a words-in-context question has exactly one blank in the passage (and only then)`,
    wic === blanks,
    `wic=${wic} blanks=${blanks}`
  );
  ok(
    `${p.id}: no passage has two questions of the same type`,
    new Set(p.questions.map((q) => q.type)).size === p.questions.length
  );

  for (const [i, q] of p.questions.entries()) {
    const w = `${p.id} Q${i + 1} (${q.type})`;
    ok(
      `${w}: 4 distinct options, correctIndex 0`,
      q.options.length === 4 && new Set(q.options.map((o) => o.toLowerCase())).size === 4 && q.correctIndex === 0
    );
    ok(`${w}: known type`, ["central-idea", "inference", "words-in-context"].includes(q.type));
    ok(`${w}: explanation present and addresses the wrong choices`, q.explanation.length > 120);
    ok(`${w}: explanation never refers to a choice by position`, !POSITIONAL_LANGUAGE.test(q.explanation));
    if (q.type !== "words-in-context") {
      const lengths = q.options.map((o) => o.length);
      ok(
        `${w}: correct option is not the longest by a wide margin`,
        lengths[0] <= Math.max(...lengths.slice(1)) * 1.35,
        lengths.join("/")
      );
    }
  }
}

const types = satPassages.flatMap((p) => p.questions.map((q) => q.type));
const tally = types.reduce((acc, t) => ((acc[t] = (acc[t] || 0) + 1), acc), {});
ok(
  "a real mix of question types (all three used, each at least 3, none over 60% of the total)",
  Object.keys(tally).length === 3 &&
    Object.values(tally).every((n) => n >= 3) &&
    Math.max(...Object.values(tally)) <= types.length * 0.6,
  JSON.stringify(tally)
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
