// `npm run validate:vocab` — structural checks over ALL vocabulary content in
// every course (lib/wordbanks.js and the files it assembles). Same family as
// validate-passages / validate-grammar. Mechanical only: it cannot tell whether
// the designated answer is the only defensible one — that is the manual close
// read CLAUDE.md requires for any new content.
//
// Checks: exactly 4 distinct options; correctIndex 0–3 (and 0, the data
// convention — the quiz shuffles on screen); exactly one `______` blank; a
// non-empty explanation and fact; the correct option is not made the only
// grammatical one by an "a"/"an" before the blank (and is not itself ruled out
// by it); no explanation that points at a choice by position or letter (options
// are shuffled); no duplicate words anywhere in the library (a word in two
// places would have two spaced-repetition identities); no duplicate quiz
// sentences; level ids unique (word ids are derived from level id + word, so unique words imply unique ids).
import { courses } from "../lib/wordbanks.js";

let checks = 0;
const problems = [];
const check = (cond, msg) => {
  checks++;
  if (!cond) problems.push(msg);
};

const POSITIONAL =
  /\b(first|second|third|fourth|fifth|last|final|top|bottom)\s+(choices?|options?|answers?)\b|\b(choice|option|answer)\s+\(?[A-D]\)?\b|\b(the\s+)?(former|latter)\s+(choice|option|answer)\b/i;
const startsWithVowelSound = (word) => /^[aeiou]/i.test(word.trim());

const seenWords = new Map();
const seenLevels = new Set();
const seenSentences = new Map();
let wordCount = 0;

for (const course of courses) {
  for (const category of course.categories) {
    for (const level of category.levels) {
      check(!seenLevels.has(level.id), `duplicate level id ${level.id}`);
      seenLevels.add(level.id);
      for (const w of level.words) {
        wordCount++;
        const where = `${level.id}/${w.word}`;
        const key = w.word.toLowerCase();
        check(!seenWords.has(key), `duplicate word "${w.word}": ${where} and ${seenWords.get(key)}`);
        seenWords.set(key, where);
        check(Boolean(w.fact && w.fact.trim()), `${where}: missing fact`);

        const q = w.quiz;
        if (!q) {
          check(false, `${where}: no quiz`);
          continue;
        }
        const options = Array.isArray(q.options) ? q.options : [];
        check(options.length === 4, `${where}: needs exactly 4 options, has ${options.length}`);
        check(new Set(options.map((o) => String(o).toLowerCase())).size === options.length, `${where}: duplicate options`);
        check(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3, `${where}: correctIndex ${q.correctIndex} not 0–3`);
        check(q.correctIndex === 0, `${where}: correctIndex ${q.correctIndex} (data convention is correct-first, 0)`);
        check((q.sentence.match(/______/g) || []).length === 1, `${where}: sentence must contain exactly one ______`);
        check(Boolean(q.explanation && q.explanation.trim()), `${where}: missing explanation`);
        check(!POSITIONAL.test(q.explanation || ""), `${where}: explanation refers to a choice by position ("${(q.explanation || "").match(POSITIONAL)?.[0]}")`);

        const article = q.sentence.match(/\b(a|an)\s+______/i);
        if (article && options.length === 4) {
          const wantsVowel = article[1].toLowerCase() === "an";
          const fits = options.map((o) => startsWithVowelSound(o) === wantsVowel);
          check(
            !(fits.filter(Boolean).length === 1 && fits[q.correctIndex]),
            `${where}: "${article[1]} ______" fits only the correct answer "${options[q.correctIndex]}" — reword so no article precedes the blank`
          );
          check(fits[q.correctIndex], `${where}: "${article[1]} ______" is ungrammatical with the correct answer "${options[q.correctIndex]}"`);
        }

        check(!seenSentences.has(q.sentence), `duplicate quiz sentence: ${where} and ${seenSentences.get(q.sentence)}`);
        seenSentences.set(q.sentence, where);
      }
    }
  }
}

if (problems.length) {
  console.log(`FAIL ${problems.length} problem(s) in ${checks} checks:`);
  problems.forEach((p) => console.log("  - " + p));
  process.exit(1);
}
console.log(`${checks} passed, 0 failed (${wordCount} words across ${courses.length} courses)`);
