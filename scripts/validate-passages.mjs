// Validates lib/satPassages.js and lib/satCrossText.js. Run with `npm run
// validate:passages` after adding or editing any reading passage or
// cross-text pair, before shipping.
//
// This checks structure and mechanical rules only — options count and
// distinctness, word/question counts, blank-count matching a words-in-context
// question, no passage repeating a question type, a real mix of types across
// the library, every command-of-evidence option being a real quotation found
// verbatim in the passage text (never a fabricated or paraphrased one), and
// (see checkNoPositionalLanguage below) that an explanation never refers to
// an answer choice by its on-screen position. It does NOT replace reading
// every new passage against its actual shuffled options on screen — that
// close read is what has caught every real ambiguity bug so far (see
// CLAUDE.md, "SAT Vocab has three sections"); this script only catches the
// mechanical regressions a human read-through would be slow to re-check by
// hand every time.

import { satPassages } from "../lib/satPassages.js";
import { satCrossTextPairs } from "../lib/satCrossText.js";

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
  // A command-of-evidence-quantitative passage is deliberately a short
  // stimulus, not a full passage — the chart carries the evidentiary
  // weight, matching the real SAT's own quantitative-evidence format.
  const isQuantStimulus = p.questions.some((q) => q.type === "command-of-evidence-quantitative");
  if (isQuantStimulus) {
    ok(`${p.id}: ${n} words (want 25–90, a short chart stimulus)`, n >= 25 && n <= 90);
  } else {
    ok(`${p.id}: ${n} words (want 100–150)`, n >= 100 && n <= 150);
  }
  ok(`${p.id}: 1–4 questions`, p.questions.length >= 1 && p.questions.length <= 4, String(p.questions.length));

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
    ok(
      `${w}: known type`,
      [
        "central-idea",
        "inference",
        "words-in-context",
        "command-of-evidence",
        "text-structure-purpose",
        "command-of-evidence-quantitative",
      ].includes(q.type)
    );
    if (q.type === "command-of-evidence") {
      const fullText = p.text.join(" ");
      ok(
        `${w}: every option is a real quotation taken verbatim from the passage`,
        q.options.every((o) => fullText.includes(o.replace(/^"|"$/g, "")))
      );
    }
    if (q.type === "command-of-evidence-quantitative") {
      ok(`${w}: has a chart`, !!q.chart && (q.chart.kind === "table" || q.chart.kind === "bar"));
      if (q.chart && q.chart.kind === "table") {
        ok(
          `${w}: table columns/rows are consistent and non-empty`,
          Array.isArray(q.chart.columns) &&
            q.chart.columns.length >= 2 &&
            Array.isArray(q.chart.rows) &&
            q.chart.rows.length >= 2 &&
            q.chart.rows.every((row) => row.length === q.chart.columns.length)
        );
      }
      if (q.chart && q.chart.kind === "bar") {
        ok(
          `${w}: bar chart has at least 2 real numeric bars`,
          Array.isArray(q.chart.bars) &&
            q.chart.bars.length >= 2 &&
            q.chart.bars.every((b) => typeof b.label === "string" && typeof b.value === "number")
        );
      }
    }
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
const KNOWN_TYPES = [
  "central-idea",
  "inference",
  "words-in-context",
  "command-of-evidence",
  "text-structure-purpose",
  "command-of-evidence-quantitative",
];
ok(
  "a real mix of question types (every known type used, each at least 3, none over 60% of the total)",
  Object.keys(tally).length === KNOWN_TYPES.length &&
    Object.values(tally).every((n) => n >= 3) &&
    Math.max(...Object.values(tally)) <= types.length * 0.6,
  JSON.stringify(tally)
);

// ---- Cross-Text Connections pairs (lib/satCrossText.js) — a different
// shape (two texts, not one), sharing lib/passageProgress.js's storage with
// single passages, so pair ids must never collide with a passage id.
ok("at least 3 cross-text pairs", satCrossTextPairs.length >= 3, String(satCrossTextPairs.length));
ok("unique cross-text pair ids", new Set(satCrossTextPairs.map((p) => p.id)).size === satCrossTextPairs.length);
ok("pair ids are url-safe slugs", satCrossTextPairs.every((p) => /^[a-z0-9-]+$/.test(p.id)));
ok(
  "no cross-text pair id collides with a single-passage id (they share one progress store)",
  satCrossTextPairs.every((p) => !satPassages.some((sp) => sp.id === p.id))
);

for (const pair of satCrossTextPairs) {
  for (const key of ["passageA", "passageB"]) {
    const text = pair[key];
    const n = countWords(text.text.join(" "));
    ok(`${pair.id} ${key}: ${n} words (want 50–110)`, n >= 50 && n <= 110);
  }
  ok(`${pair.id}: passageA and passageB have different titles`, pair.passageA.title !== pair.passageB.title);
  ok(`${pair.id}: at least 1 question`, pair.questions.length >= 1);

  for (const [i, q] of pair.questions.entries()) {
    const w = `${pair.id} Q${i + 1}`;
    ok(
      `${w}: 4 distinct options, correctIndex 0`,
      q.options.length === 4 && new Set(q.options.map((o) => o.toLowerCase())).size === 4 && q.correctIndex === 0
    );
    ok(`${w}: known type`, q.type === "cross-text-connections");
    ok(`${w}: explanation present and addresses the wrong choices`, q.explanation.length > 120);
    ok(`${w}: explanation never refers to a choice by position`, !POSITIONAL_LANGUAGE.test(q.explanation));
    const lengths = q.options.map((o) => o.length);
    ok(
      `${w}: correct option is not the longest by a wide margin`,
      lengths[0] <= Math.max(...lengths.slice(1)) * 1.35,
      lengths.join("/")
    );
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
