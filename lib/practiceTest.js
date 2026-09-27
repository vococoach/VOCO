// Timed full-practice-test mode for SAT Vocab: a simulated Reading & Writing
// section built from EXISTING content (vocabulary, passages, grammar) — no
// new content is written here, only a selection algorithm over what already
// exists in lib/wordbanks.js.
//
// Real-format target (verified 2026-09-22, not assumed — see CLAUDE.md
// "Practice test mode" for the source): the Digital SAT's Reading & Writing
// section is 54 questions across two 32-minute modules, 27 questions each.
// Re-check this if the real test's format ever changes.
//
// Mix per test (~54 questions): ~18 vocabulary (words-in-context), ~15
// passage-based (kept together by passage/pair — a passage's or cross-text
// pair's questions never split across modules, so a learner reads its text
// once), ~21 grammar & usage. Passage question count varies slightly by
// which whole passages get selected, so vocabulary absorbs the remainder to
// keep the total exactly 54. This isn't a claim about the real test's own
// type ratio (Voco's three content pools don't map cleanly onto the real
// subdomains) — it's a reasonable, genuinely mixed composition of what this
// app actually has. As of 2026-09-27, vocabulary is no longer deliberately
// kept the single largest pool — see the reasoning below, where that
// tradeoff is made explicitly and on purpose, not by accident.
//
// Every question is normalized to one shape for the practice-test UI:
//   { id, poolType: "vocab" | "passage" | "grammar", prompt,
//     sentence?: string (vocab only — the blank-fill sentence),
//     passageTitle?, passageSubject?, passageText?: string[] (passage only),
//     passageTitle2?, passageSubject2?, passageText2?: string[] (cross-text
//       pairs only, since 2026-09-27 — a second text card renders whenever
//       these are set, otherwise the UI is identical to a single passage),
//     chart?: { kind: "table" | "bar", … } (command-of-evidence-quantitative
//       passage questions only, since 2026-09-27 — components/PassageChart.js),
//     notes?: string[], goal?: string (rhetorical-synthesis grammar
//       questions only, since 2026-09-27 — rendered the same way the
//       Grammar & Usage tab itself renders them),
//     sourceLabel: string (category/passage title, for the results review),
//     options: [4, correct first], correctIndex: 0, explanation }
// Every one of those optional fields is undefined for every other question
// type, so passing them through the shared UI is a no-op there. `id` is
// stable across attempts so past-question tracking works: vocab reuses
// wordId() (SRS's own id) prefixed "v:"; passage/cross-text/grammar
// questions get a synthetic "p:<passageId-or-pairId>:<index>" /
// "g:<levelId>:<index>" — a cross-text pair's id is namespaced ("xt-…") so
// it can never collide with a passage id sharing the same "p:" prefix.
//
// Deliberately entirely separate from vocabulary progress — see
// lib/practiceTestProgress.js.

import { wordId } from "./wordbanks";

export const MODULE_QUESTION_COUNT = 27;
export const MODULE_COUNT = 2;
export const TOTAL_QUESTIONS = MODULE_QUESTION_COUNT * MODULE_COUNT;
export const MODULE_DURATION_MS = 32 * 60 * 1000;

// Re-tuned twice. 2026-09-24, after adding Transitions and Command of
// Evidence (Textual), raised 8/12 to 12/18 while deliberately keeping
// vocabulary the single largest pool (rejecting a more aggressive 14/22 for
// that reason — see git history for that reasoning in full). 2026-09-27,
// after adding the last four sub-skills (Text Structure and Purpose, Command
// of Evidence Quantitative, Rhetorical Synthesis, Cross-Text Connections —
// see CLAUDE.md "The last four SAT domains"), the pools grew again, from 29
// passage-pool / 45 grammar-pool questions to 46 / 60 (cross-text pairs now
// count as passage-pool blocks too — see crossTextBlock() below). This time
// the targets were raised further, to 15/21, and vocabulary is NO LONGER
// deliberately kept the single largest pool (grammar's 21 slightly exceeds
// vocabulary's ~18) — a deliberate change from the 2026-09-24 principle, not
// an oversight. Reasoning: hitting genuine, meaningful representation for
// Expression of Ideas and Standard English Conventions requires a large
// enough grammar target that, given the grammar pool is now an even 50/50
// split between them (Boundaries+Form/Structure/Sense vs. Transitions+
// Rhetorical Synthesis), pushes grammar's target past vocabulary's remainder
// — there is no target choice that hits real representation for all four
// domains AND keeps vocabulary strictly largest. Measured via the same
// 200-run simulation technique used for the previous retune: this moved the
// mix from Craft&Structure/Info&Ideas/SEC/EOI 51.2%/15.4%/16.8%/16.5% (with
// targets simply left at 12/18 against the new, larger pools) to roughly
// 42%/19%/20%/19%, against the real 28/26/26/20 split — every previously
// under-target domain now within single digits of its real weight except
// Craft and Structure, which is structurally guaranteed to over-represent as
// long as vocabulary (100% Craft and Structure) is any sizable fraction of
// the test. Pool freshness is comfortably BETTER than the 2026-09-24
// baseline despite the higher targets, since both pools grew faster than
// their targets did (passages: 29/12 = 2.4 attempts-worth before a repeat,
// now 46/15 = 3.1; grammar: 45/18 = 2.5, now 60/21 = 2.9).
const TARGET_PASSAGE_QUESTIONS = 15;
const TARGET_GRAMMAR_QUESTIONS = 21;

// Small seedable PRNG (mulberry32) so the selection algorithm is
// deterministically testable. Production calls omit `seed`, which falls back
// to real entropy — every real attempt is genuinely randomized.
function makeRng(seed) {
  if (seed === undefined) {
    return Math.random;
  }
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const order = arr.slice();
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// One vocab word -> one normalized question block ({ questions: [1] }, so it
// has the same shape as a passage block for the shuffle/split step below).
function vocabBlock(category, level, word) {
  const id = "v:" + wordId(level.id, word.word);
  return {
    id,
    questions: [
      {
        id,
        poolType: "vocab",
        prompt: "Which word best completes the sentence?",
        sentence: word.quiz.sentence,
        sourceLabel: category.title,
        options: word.quiz.options,
        correctIndex: word.quiz.correctIndex,
        explanation: word.quiz.explanation,
      },
    ],
  };
}

// One whole passage -> one block carrying ALL of its questions together, so
// a passage's questions never get separated (each still carries its own copy
// of the passage text, so it renders correctly wherever it lands after the
// block order is shuffled). `chart` (command-of-evidence-quantitative only)
// passes through unset for every other type, so it's a no-op there.
function passageBlock(passage) {
  return {
    id: "passage:" + passage.id,
    questions: passage.questions.map((q, i) => ({
      id: `p:${passage.id}:${i}`,
      poolType: "passage",
      prompt: q.prompt,
      passageTitle: passage.title,
      passageSubject: passage.subject,
      passageText: passage.text,
      chart: q.chart,
      sourceLabel: passage.title,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
  };
}

// A Cross-Text Connections pair -> one block, same "passage" pool as
// passageBlock() (added 2026-09-27 — see CLAUDE.md "The last four SAT
// domains"). `passageText2`/`passageTitle2`/`passageSubject2` carry the
// second text through; every regular passage question leaves them unset, so
// the practice-test UI only renders a second text card when they're present.
function crossTextBlock(pair) {
  return {
    id: "pair:" + pair.id,
    questions: pair.questions.map((q, i) => ({
      id: `p:${pair.id}:${i}`,
      poolType: "passage",
      prompt: q.prompt,
      passageTitle: pair.passageA.title,
      passageSubject: pair.passageA.subject,
      passageText: pair.passageA.text,
      passageTitle2: pair.passageB.title,
      passageSubject2: pair.passageB.subject,
      passageText2: pair.passageB.text,
      sourceLabel: `${pair.passageA.title} & ${pair.passageB.title}`,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
  };
}

// One grammar question -> one block. `notes`/`goal` (rhetorical-synthesis
// only) pass through unset for every other type, so it's a no-op there.
function grammarBlock(category, level, q, i) {
  const id = `g:${level.id}:${i}`;
  return {
    id,
    questions: [
      {
        id,
        poolType: "grammar",
        prompt: q.prompt,
        notes: q.notes,
        goal: q.goal,
        sourceLabel: category.title,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      },
    ],
  };
}

function buildAllBlocks(course) {
  const vocab = course.categories.flatMap((category) =>
    category.levels.flatMap((level) => level.words.map((word) => vocabBlock(category, level, word)))
  );
  const passages = [
    ...(course.passages || []).map(passageBlock),
    ...(course.crossTextPairs || []).map(crossTextBlock),
  ];
  const grammar = (course.grammar || []).flatMap((category) =>
    category.levels.flatMap((level) => level.questions.map((q, i) => grammarBlock(category, level, q, i)))
  );
  return { vocab, passages, grammar };
}

// Picks blocks from `pool`, preferring ones whose id isn't in `usedIds`,
// until `targetQuestionCount` questions are reached (a passage block can
// contain 1-2 questions, so the count may land a little over the target —
// callers that need an exact count, like the vocab pool below, pass
// single-question blocks only, so it lands exactly). Falls back to
// previously-used blocks only once the fresh ones run out, and reports how
// many questions in the result came from a reused block.
function pickBlocks(pool, targetQuestionCount, usedIds, rng) {
  const fresh = shuffle(
    pool.filter((b) => !b.questions.some((q) => usedIds.has(q.id))),
    rng
  );
  const stale = shuffle(
    pool.filter((b) => b.questions.some((q) => usedIds.has(q.id))),
    rng
  );
  const chosen = [];
  let count = 0;
  let reused = 0;
  for (const block of [...fresh, ...stale]) {
    if (count >= targetQuestionCount) break;
    const isStale = block.questions.some((q) => usedIds.has(q.id));
    chosen.push(block);
    count += block.questions.length;
    if (isStale) reused += block.questions.length;
  }
  return { blocks: chosen, questionCount: count, reused };
}

// Builds one full practice test: exactly TOTAL_QUESTIONS questions, split
// into MODULE_COUNT modules of exactly MODULE_QUESTION_COUNT each, with every
// passage's questions kept in the same module. `usedIds` (a Set of question
// ids from past attempts — see lib/practiceTestProgress.js) is preferred
// against; if a pool doesn't have enough fresh content left, previously-used
// questions are reused and `reusedCounts` reports exactly how many per pool,
// so the UI can say so plainly rather than silently repeating content.
export function buildPracticeTest(course, usedIds = new Set(), seed) {
  const rng = makeRng(seed);
  const { vocab, passages, grammar } = buildAllBlocks(course);

  const passagePick = pickBlocks(passages, TARGET_PASSAGE_QUESTIONS, usedIds, rng);
  const grammarPick = pickBlocks(grammar, TARGET_GRAMMAR_QUESTIONS, usedIds, rng);
  const vocabTarget = TOTAL_QUESTIONS - passagePick.questionCount - grammarPick.questionCount;
  const vocabPick = pickBlocks(vocab, vocabTarget, usedIds, rng);

  const allBlocks = shuffle([...passagePick.blocks, ...grammarPick.blocks, ...vocabPick.blocks], rng);

  // Greedily fill module 1 to exactly MODULE_QUESTION_COUNT, keeping every
  // block whole. Only multi-question blocks (passages) can ever cause a
  // shortfall against the exact target; when one would overshoot, pull the
  // next single-question block forward to complete the module instead, and
  // push the multi-question block to start the next module. Single-question
  // blocks (vocab + grammar) always outnumber passage blocks by a wide
  // margin in this mix, so a swap candidate is always available.
  const remaining = allBlocks.slice();
  const module1 = [];
  let module1Count = 0;
  while (module1Count < MODULE_QUESTION_COUNT && remaining.length > 0) {
    const next = remaining[0];
    if (module1Count + next.questions.length <= MODULE_QUESTION_COUNT) {
      module1.push(remaining.shift());
      module1Count += next.questions.length;
    } else {
      const swapIndex = remaining.findIndex((b) => b.questions.length === 1);
      if (swapIndex === -1) break; // shouldn't happen given the mix; fall through with a short module rather than crash
      module1.push(remaining.splice(swapIndex, 1)[0]);
      module1Count += 1;
    }
  }
  const module2 = remaining;

  const flatten = (blocks) => blocks.flatMap((b) => b.questions);
  const module1Questions = flatten(module1);
  const module2Questions = flatten(module2);

  return {
    modules: [module1Questions, module2Questions],
    questions: [...module1Questions, ...module2Questions],
    reusedCounts: { vocab: vocabPick.reused, passages: passagePick.reused, grammar: grammarPick.reused },
    counts: {
      vocab: vocabPick.questionCount,
      passages: passagePick.questionCount,
      grammar: grammarPick.questionCount,
    },
  };
}

// Score + breakdown by pool type. `answers` is { [questionId]: selectedIndex }.
export function scorePracticeTest(questions, answers) {
  const byType = { vocab: { correct: 0, total: 0 }, passages: { correct: 0, total: 0 }, grammar: { correct: 0, total: 0 } };
  const key = { vocab: "vocab", passage: "passages", grammar: "grammar" };
  let correct = 0;
  let answered = 0;
  for (const q of questions) {
    const bucket = byType[key[q.poolType]];
    bucket.total += 1;
    const sel = answers[q.id];
    if (sel !== undefined && sel !== null) answered += 1;
    if (sel === q.correctIndex) {
      correct += 1;
      bucket.correct += 1;
    }
  }
  return { correct, total: questions.length, answered, byType };
}
