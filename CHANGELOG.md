# Changelog

History that no longer describes how the app works today, moved out of `CLAUDE.md`
so that file can stay a statement of current rules, current state, and decisions with
their reasons. Nothing here was deleted. Each block is verbatim as it stood when it
was moved (2026-10-05) and is **as of its own date** — where a later change (for
example the 2026-10-05 free-tier cut, which made passages and grammar fully paid)
contradicts a block, `CLAUDE.md` is correct and the block is the record of how it
got there.

Scripts named in these blocks (`validate_courses.mjs`, `grammar_logic_test.mjs`,
`passage_logic_test.mjs`, `practice_test_logic_test.mjs`, `tonight_simulation.mjs`,
`domain_mix_measure.mjs`) were scratch files that were never saved to the repo and no
longer exist; `scripts/` is the real test suite.

## 2026-09-24 → 2026-09-27: SAT domain audit and the content built from it

Three consecutive sections, moved together because each follows from the previous.
The current-state summary is "SAT content coverage" in `CLAUDE.md`.

## SAT domain accuracy audit (2026-09-24) — content is sound, but unevenly mapped

A full content close-read plus a check of every section against the Digital SAT's real
domain structure, done before building any new content — verification only, nothing
added or changed in this pass. **The reference data lives in `lib/satDomains.js`
(`SAT_RW_DOMAINS`)**, verified directly against the College Board's own published spec
(satsuite.collegeboard.org/k12-educators/about/alignment/reading, checked 2026-09-24,
not a test-prep aggregator — the exact same "verify, don't assume" discipline already
used for the module/timing format):

| Domain | Weight | Skills |
|---|---|---|
| Craft and Structure | 28% | Words in Context, Text Structure and Purpose, Cross-Text Connections |
| Information and Ideas | 26% | Central Ideas and Details, Command of Evidence (Textual), Command of Evidence (Quantitative), Inferences |
| Standard English Conventions | 26% | Boundaries, Form, Structure, and Sense |
| Expression of Ideas | 20% | Rhetorical Synthesis, Transitions |

**1. Content accuracy — everything re-read closely, nothing found wrong.** All 249
vocabulary words (204 core + 45 Expert across all 6 categories), all 19 passage
questions across all 10 passages, all 30 grammar questions across both categories, and
all 4 strategy guides were read in full — the same close-read standard used when this
content was first written (checking that the correct answer is the *only* defensible
one, that every distractor is genuinely wrong in that specific sentence, that every
explanation is accurate and doesn't refer to a choice by screen position), not a rerun
of the mechanical validators (`validate:passages`, `validate:grammar`), which only catch
structural issues. Nothing needed fixing. The strategy guides' format claims (2 modules
of 27, 32 minutes each, no guessing penalty) are still current against the verified
spec above. This is a genuinely clean result, not a low-effort one: it confirms the
content hasn't drifted or rotted since it was built, across several sessions and one
content-count change (Expert tier, passages, and grammar were each grown at least once).

**2. Domain mapping — accurate where it exists, confirmed nowhere near complete.**

- **SAT Vocab's 6 categories + passage `words-in-context` questions → Craft and
  Structure > Words in Context.** Accurate: the course's whole premise (`lib/wordbanks.js`
  header, `CLAUDE.md` "Content rules" #1) is matching this exact skill — a sentence with
  a blank, testing how a word functions, not "define this word." Confirmed correct, not
  just asserted.
- **Passage `central-idea` and `inference` questions → Information and Ideas >
  Central Ideas and Details / Inferences respectively.** Accurate and correctly typed
  (verified against every question's own `type` field while reading them).
- **Grammar's two categories → Standard English Conventions, at high fidelity.**
  `Boundaries` and `Form, Structure, and Sense` aren't just similarly-named — they're the
  real domain's own two skills, and the 30 questions' `type` tags (subject-verb agreement,
  pronoun agreement and case, verb tense, parallel structure, modifier placement, plus
  comma splices, fragments, semicolons, colons, restrictive/nonrestrictive clauses,
  appositives, dash pairs, conjunctive adverbs) cover the real domain's actual named
  sub-rules directly, not an approximation of them. This is already documented in
  `lib/satGrammar.js`'s own header; this audit confirms it holds under a fresh, careful
  re-read.
- **Confirmed gaps — nothing currently tests these real skills, at all:**
  - **Expression of Ideas — the entire domain (20% of the real test).** Rhetorical
    Synthesis and Transitions have zero content anywhere in the course. This is
    deliberate, not an oversight: `lib/satGrammar.js` explicitly notes Transitions was
    "deliberately left out rather than miscategorized" when Grammar was built, since it
    belongs to this domain, not Standard English Conventions. This audit's job was to
    confirm that gap plainly, not to fill it.
  - **Text Structure and Purpose and Cross-Text Connections (both under Craft and
    Structure).** Every passage question is one of exactly 3 types (central-idea,
    inference, words-in-context — `lib/satPassages.js`'s own header); none asks what a
    sentence is doing structurally or compares two texts. Cross-Text Connections in
    particular would need an entirely new passage shape (a *pair* of short texts), not
    just new questions on the existing one-passage format.
  - **Command of Evidence, both Textual and Quantitative (under Information and
    Ideas).** No passage question asks a learner to select which quote from the text
    would best support a claim, or to read a chart/table alongside the text — the
    quantitative half in particular would need a genuinely new question shape (this app
    has no data-visualization content anywhere).

**3. The practice test's question mix — measured precisely, confirmed not proportionate,
and this was already known.** `lib/practiceTest.js`'s `TARGET_PASSAGE_QUESTIONS` (8) and
`TARGET_GRAMMAR_QUESTIONS` (12) were sized against **pool freshness** (so repeat questions
stay rare across several attempts — see "Add a timed practice-test mode" above), not
against real domain weights — and its own header comment already said so ("Voco's three
content pools don't map cleanly onto the real subdomains... a reasonable, genuinely mixed
composition of what this app actually has"). This audit turns that acknowledged
limitation into a measured number: simulating 200 practice tests (`domain_mix_measure.mjs`,
the scratchpad pattern) and mapping every question to its real domain by tracing passage
questions back to their own `type` field gives:

| Domain | App's actual mix | Real weight |
|---|---|---|
| Craft and Structure | **65.7%** | 28% |
| Information and Ideas | **12.1%** | 26% |
| Standard English Conventions | **22.2%** | 26% |
| Expression of Ideas | **0.0%** | 20% |

Not proportionate, and not close — Craft and Structure (driven almost entirely by
vocabulary questions, which dominate because the vocab pool is 249 questions against
19 passage questions and 30 grammar questions) is more than **2.3×** its real weight,
Information and Ideas runs at under half its real weight, Standard English Conventions
is the closest of the three that exist at all (85% of its real weight), and Expression
of Ideas is a complete absence. **This is a direct, mechanical consequence of pool size,
not a selection-algorithm bug** — `buildPracticeTest()` is choosing correctly from what
exists; what exists is just heavily vocab-weighted relative to the real test's own
balance. Fixing the proportion requires more passage and grammar content (specifically:
more Command of Evidence / Text Structure / Cross-Text passage questions and the entire
Expression of Ideas domain), not a change to the selection algorithm itself — a genuine
content gap, not a bug in code that already exists.

## Transitions + Command of Evidence (2026-09-24) — closing two of the audit's gaps

Direct follow-up to the domain audit above: two targeted content additions chosen
specifically to move the measured skew, reusing existing question formats rather than
building new UI, plus a re-measurement to confirm the skew actually moved rather than
assuming it did.

**1. Transitions (Expression of Ideas) — new 3rd category in the Grammar & Usage tab.**
15 questions (5 Foundational, 5 Intermediate, 5 Advanced) in `lib/satGrammar.js`,
identical data shape to Boundaries/Form-Structure-Sense (`{ type, prompt, options: [4
full-text versions, correct first], correctIndex: 0, explanation }` — each option is the
complete sentence with a different transition word substituted in, not a word-bank
blank), so `/grammar/[levelId]/page.js` needed zero code changes to render it. Paid,
matching Form, Structure, and Sense (`lib/purchase.js`'s `isGrammarCategoryLocked` locks
anything that isn't `"boundaries"`, so no code change was needed there either).

- **Tab placement was a genuine ambiguity, resolved by asking, not guessing.**
  Transitions is Expression of Ideas, not Standard English Conventions — folding it into
  the existing "Grammar" tab alongside Boundaries and Form/Structure/Sense would
  technically mislabel it, even though it reads naturally as "grammar and usage" to a
  learner. Presented 3 options (rename the tab, add it in with clear internal labeling,
  or give it its own tab); the user picked **same tab, renamed "Grammar & Usage"** — max
  reuse of the existing route/page/progress file, with the category's own `description`
  field naming its real domain honestly rather than blurring it into the tab's label.
  That "each category's own description names its real domain, even when the tab groups
  differently-domained categories together" convention is now written into
  `lib/satGrammar.js`'s header for future additions to follow. The rename touched 4
  spots: `lib/wordbanks.js` (`getCourseSections` tab label), `app/practice-test/page.js`
  (×2 — the pool-type tag and the results breakdown), and `app/terms/page.js` §4 (legal
  text — see below). `components/GrammarList.js` needed no logic changes; it already
  reads category data fully dynamically.
- **Content discipline held under a live close-read.** One question (the engine/fuel
  example, transitions-2) was rewritten mid-draft: the original second clause ("the
  redesigned dashboard added three new safety alerts" replaced an earlier draft about a
  weight-reduction fact) risked a genuine second defensible answer, since an engine
  redesign could plausibly cause both fuel savings and weight reduction, making
  "Consequently" nearly as defensible as the intended "Moreover." Exactly the kind of
  ambiguity the manual close-read catches and the mechanical validator (`validate:
  grammar`) cannot.

**2. Command of Evidence, Textual (Information and Ideas) — new question type within the
existing passage format.** 9 questions added: one each to 8 existing passages (all
except the two literary/narrative ones, `the-ferry-window` and
`the-last-two-on-the-platform`, which don't have a stated claim for a quote to support),
plus a new 11th passage (`the-dimmed-block`, Social Science, purpose-built with an
explicit claim-and-evidence structure) carrying 2 questions (1 Command of Evidence + 1
inference). `type: "command-of-evidence"`, same `{ type, prompt, options: [4, correct
first], correctIndex: 0, explanation }` shape as every other passage question — the 4
options are real quotations from the passage text (never fabricated or paraphrased),
one genuinely supporting the stated claim, the other three true-but-non-supporting (a
different theory, the wrong side of a comparison, background/setup, or a conclusion
drawn from the evidence rather than the evidence itself). `/passages/[passageId]/page.js`
needed zero code changes. Passage question counts are now 1–3 (was 1–2) —
`scripts/validate-passages.mjs` was updated for this, plus a new check that every
command-of-evidence option is a verbatim substring of its passage's text.

- **Two quote-fidelity bugs caught by that new verbatim check, both fixed before
  shipping:** an option on `the-farrow-map` quoted the passage's words-in-context blank
  as if it were already filled in with its answer ("...but of a clerical slip...") —
  text that never actually appears on screen, since the blank renders as `______` for
  every question type sharing that passage, not just the words-in-context one; and an
  option on `the-ants-shortcut` used single curly quotes (‘ ’) around Fenn's quoted
  speech where the source passage uses double (" "), so the substring match legitimately
  failed. Both are exactly the class of bug the "every option must be a real quotation"
  rule in `lib/satPassages.js`'s header now exists to prevent.
- **Two near-miss second-defensible-answer risks caught and redesigned before
  shipping** (same discipline as the Transitions catch above): `the-farrow-map`'s first
  draft claim ("Farrow's own fieldwork wasn't the source of the error") had two
  quotations that both genuinely supported it (the field-notes quote and the
  engraver-transposition quote), which would have left a real ambiguity between two
  options — redesigned around a claim only one quotation addresses ("caused real,
  practical harm"). `the-ants-shortcut`'s first draft had the same problem (the
  narrator's mechanism sentence and Fenn's own quoted words both supported the same
  claim) — resolved by using only Fenn's quoted words as the correct option and choosing
  distractors that don't overlap with it.

**3. Practice-test targets re-tuned — empirically, not guessed, mirroring how the
original 8/12 were chosen.** Adding content to the pools doesn't by itself change the
practice test's in-test ratio, since vocabulary is defined as "whatever's left" to reach
54 — `TARGET_PASSAGE_QUESTIONS` and `TARGET_GRAMMAR_QUESTIONS` (`lib/practiceTest.js`)
had to move too. Pools grew from 19 passage / 30 grammar questions to 29 / 45. Both
targets were raised to **12 / 18** (from 8 / 12) — chosen by 200-run simulation
(`domain_mix_measure.mjs` in the scratchpad, extended to trace grammar questions back to
their category via level id, and passage `command-of-evidence` questions to Information
and Ideas) to preserve the *same pool-freshness ratio* the original values were chosen
for (passages: 19/8 = 2.4 attempts-worth before a repeat, now 29/12 = 2.4; grammar:
30/12 = 2.5, now 45/18 = 2.5), rather than picking round numbers. A more aggressive
target (14/22) measured numerically closer to the real domain weights but was rejected
because it makes vocabulary a minority of the test (31.9%, behind passages+grammar
combined), which conflicts with this being fundamentally a vocabulary app's practice
mode — the same principle the original targets' header comment already stated. 12/18
keeps vocabulary the single largest pool (~43%) while still moving every deficient
domain substantially.

**4. Re-measured result — the skew moved, confirmed by re-running the same simulation,
not assumed:**

| Domain | Before (2026-09-24 audit) | After | Real weight |
|---|---|---|---|
| Craft and Structure | 65.7% | **46.2%** | 28% |
| Information and Ideas | 12.1% | **20.4%** | 26% |
| Standard English Conventions | 22.2% | **22.0%** | 26% |
| Expression of Ideas | 0.0% | **11.3%** | 20% |

Expression of Ideas moved from nonexistent to a real, double-digit share for the first
time. Information and Ideas nearly doubled. Standard English Conventions held steady
(new Transitions content dilutes its share of the grammar pool, but the larger grammar
target offsets it almost exactly). Craft and Structure dropped by 19.5 points but is
still the largest single domain — vocabulary is still Craft and Structure's Words in
Context skill by design, and this was never going to reach exact parity with a vocab
app's practice mode without either much more non-vocab content than "quality over
padding" supports, or making vocabulary a minority of the test (rejected above). Full
regression suite re-run clean after both content and target changes: `validate:passages`
(198/198), `validate:grammar` (293/293), plus the scratchpad's `validate_courses.mjs`,
`grammar_logic_test.mjs`, `passage_logic_test.mjs`, `practice_test_logic_test.mjs`, and
`tonight_simulation.mjs` (all passing; the latter two scripts had stale hardcoded counts
— 2 grammar categories, 10 passages — updated to match). Both new question types were
also verified with real attempts in the live UI (a Transitions quiz, and Command of
Evidence questions on both an existing passage and the new one), and the `/unlock` page's
locked-content listing was confirmed to already reflect the new counts correctly with no
code changes (it computes `lockedPassageCount`/`lockedGrammarQuestionCount` dynamically).

## The last four SAT domains (2026-09-27) — every real Digital SAT R&W sub-skill now has content

Direct follow-up to the two sections above: closes the four gaps the domain audit found and
"Transitions + Command of Evidence" didn't — Text Structure and Purpose, Rhetorical
Synthesis, Cross-Text Connections, and Command of Evidence (Quantitative). Built easiest to
hardest, each validated (mechanically and by close read) before the next started, per the
task's own instruction, with 3 genuine "ask before deciding" checkpoints for the parts that
needed new layout — none of them guessed at.

**1. Text Structure and Purpose (Craft and Structure) — new question type, zero new code.**
8 questions added to 8 existing passages (`lib/satPassages.js`), `type: "text-structure-
purpose"`, same shape as every other passage question. Either "which choice best describes
the function of [a quoted sentence] in the text as a whole" or "...the overall structure of
the text" — the quoted sentence is written directly into the prompt (same trick Command of
Evidence's quotes use), so there's no "underlined sentence" markup to build and
`/passages/[passageId]/page.js` needed no changes. **Mechanical catch:** the first draft of
5 of the 8 questions had a real length-tell (`validate:passages`'s "correct option is not
the longest" check) — nuanced "it establishes X, so Y" correct answers were consistently
much longer than simpler wrong ones; fixed by rebalancing option lengths, not by
suppressing the check.

**2. Rhetorical Synthesis (Expression of Ideas) — new 4th Grammar & Usage category, one
small new UI block.** 15 questions (3 tiers × 5) in `lib/satGrammar.js`. Given short
bulleted notes and a stated goal ("the writer wants to emphasize a contrast..."), choose
the sentence that best accomplishes that specific goal — every wrong option is factually
consistent with the notes, just doesn't match the stated goal (a different goal's answer, a
plain fact with no rhetorical shaping, or the right topic with the wrong emphasis).
- **Layout was a genuine "propose before building" checkpoint.** Two options were
  presented: host it in Grammar & Usage with a small new notes/goal block, or fold it into
  Passages by writing the notes as flowing prose. The user picked the Grammar & Usage
  option. Implementation: two new optional fields, `notes: string[]` and `goal: string`
  (every other grammar question leaves both undefined); `/grammar/[levelId]/page.js` renders
  `notes` as a bulleted list and `goal` as a statement in a card above the (unchanged)
  prompt/options/explanation flow, only when `notes` is present.
- **A real bug this caught, not just a content issue:** `lib/practiceTest.js`'s
  `grammarBlock()` didn't pass `notes`/`goal` through to the practice-test's normalized
  question shape — a Rhetorical Synthesis question pulled into a practice test would have
  shown the generic prompt with no notes or goal at all, making it unanswerable. Fixed
  before it ever shipped (`grammarBlock()` now passes both through; every other question
  type leaves them undefined, so it's a no-op there), then verified live inside an actual
  practice-test run.

**3. Cross-Text Connections (Craft and Structure) — new content shape, new route, one
extracted shared component.** 4 pairs (`lib/satCrossText.js`, new file — the two-text shape
doesn't fit `lib/satPassages.js`'s one-text shape) of short, related original passages
(differing interpretations of similar evidence, or a claim and a complicating
observation), one question per pair about how they relate.
- **Layout was the second "propose before building" checkpoint.** Three options were
  presented for showing two passages together: both visible at once stacked, tabbed, or
  sequential-with-the-first-collapsible. The user picked **both visible at once, stacked**
  — simplest, no new interaction state, and both texts stay referenceable while answering,
  which this question type usually needs. `components/PassageCard.js` was extracted from
  `/passages/[passageId]/page.js`'s previously-inline passage-text card so both the
  single-passage page and the new two-passage page render it identically without
  duplicating markup; `app/cross-text/[pairId]/page.js` is nearly identical to
  `/passages/[passageId]/page.js` otherwise (same option/feedback mechanic, same
  `QuizResults`).
- **Navigation: a new labeled block inside the existing "Passages" tab, not a new tab.**
  `components/CrossTextList.js` mirrors `PassageList.js` (same card layout, same gating),
  rendered directly below it. This didn't need its own "ask before deciding" checkpoint —
  unlike the Grammar & Usage tab rename, there's no domain-mislabeling risk (Cross-Text
  Connections and single passages are both genuinely reading-comprehension content), so
  maximum reuse of the existing tab was a safe, unambiguous call.
- **Tracked in the SAME store as single passages** (`lib/passageProgress.js`,
  `voco_passages_v1`) — a pair id is just another id in that store, since the tracking need
  (completedAt/score/attempts per item) is identical. Pair ids are namespaced (`xt-…`),
  checked by an automated validator rule to never collide with a passage id sharing the
  same store. No free sample of its own — the existing free passage already samples this
  tab.
- **Gap caught in `app/unlock/page.js`:** its locked-content summary and per-course list
  only ever knew about `course.passages`/`course.grammar` — cross-text pairs were entirely
  invisible there (a subscriber would never be told they exist). Fixed: `lockedByCourse`
  now also collects `crossTextPairs`, and the pitch text and per-course list both mention
  them (`"...15 reading passages beyond the free one, 4 cross-text pairs and 45 grammar
  questions..."`, `"Cross-text pairs (4)"`).

**4. Command of Evidence, Quantitative (Information and Ideas) — new question type, new
minimal chart rendering.** 5 new short passages (`lib/satPassages.js` — purpose-built, not
retrofitted onto existing ones, since the whole point is data the text doesn't already
state in prose), `type: "command-of-evidence-quantitative"`, each pairing a short claim or
expectation with a `chart` the learner has to actually read to judge what the data shows.
- **Rendering approach was the third "propose before building" checkpoint**, framed
  explicitly as the one place in the whole task where over-engineering was a real risk.
  Chosen: a plain HTML `<table>` for tabular data, plus a small hand-rolled inline-SVG
  horizontal bar chart for magnitude/trend data — no charting library, matching this app's
  existing minimal-dependency discipline. `components/PassageChart.js` dispatches on
  `chart.kind` ("table" | "bar"); bars are horizontal specifically so labels never need
  rotating or truncating to fit phone width. `chart` lives on the *question* (not the
  passage), since it's that question's specific evidence, rendered above its prompt.
  Verified visually at both desktop and true 375px mobile width — clean at both, no
  overflow.
- **Content discipline:** every chart number is one a specific wrong answer directly
  contradicts (a "steadily improved" distractor next to a table whose last row is the
  worst value; a "no relationship" distractor next to a real, if uneven, pattern) — the
  same "genuinely wrong in this specific case" standard as every other distractor in this
  app, just checked against numbers instead of prose. Stimulus length is deliberately short
  (25–90 words, vs. 100–150 for a full passage) since the chart carries the evidentiary
  weight — a new, separate word-count rule in `validate:passages`, not a relaxation of the
  existing one.
- **A real bug this caught, not just a content issue:** `lib/practiceTest.js`'s
  `passageBlock()` didn't pass `chart` through either — the same class of bug as the
  Rhetorical Synthesis catch above, independently present in the passage path. Fixed the
  same way (pass it through, undefined everywhere else), then verified live: a real
  practice-test run happened to draw one of these questions and rendered its table
  correctly, matching the same chart data and layout as the standalone passage page.

**5. Practice-test targets re-tuned again — and this time, deliberately, vocabulary is no
longer kept the single largest pool.** Cross-text pairs now count as passage-pool blocks
too (`crossTextBlock()` in `lib/practiceTest.js`, same "passage" `poolType`, a second
`passageText2`/`passageTitle2`/`passageSubject2` on the normalized question that the
practice-test UI renders as a second text card when present). Pools grew from 29 passage- /
45 grammar-pool questions to 46 / 60. `TARGET_PASSAGE_QUESTIONS`/`TARGET_GRAMMAR_QUESTIONS`
moved from 12/18 to **15/21** — measured via the same 200-run simulation technique as
before, but this time the simplest freshness-preserving choice (scale both targets up with
their pools, as before) was rejected in favor of directly optimizing for domain balance,
because the grammar pool is now an even 50/50 split between Standard English Conventions
(Boundaries + Form/Structure/Sense) and Expression of Ideas (Transitions + Rhetorical
Synthesis) — getting Expression of Ideas to genuine, meaningful representation needs a
grammar target large enough that it exceeds vocabulary's remainder. There is no target
choice that hits real representation for all four domains AND keeps vocabulary strictly
the largest pool; 15/21 was chosen as the balance that gets every previously-deficient
domain within single digits of its real weight. Pool freshness is comfortably *better* than
the 2026-09-24 baseline despite the higher targets, since both pools grew faster than their
targets did (passages: 2.4 attempts-worth before a repeat → 3.1; grammar: 2.5 → 2.9). Full
reasoning, including the rejected alternative, is in `lib/practiceTest.js`'s own comments —
this is exactly the kind of tradeoff that belongs in code, not just here.

**6. Re-measured result — every real sub-skill covered, and the numbers to prove it moved:**

| Domain | 2026-09-24 (Transitions + CoE) | 2026-09-27, before retune | 2026-09-27, final | Real weight |
|---|---|---|---|---|
| Craft and Structure | 46.2% | 51.2% | **41.8%** | 28% |
| Information and Ideas | 20.4% | 15.4% | **19.3%** | 26% |
| Standard English Conventions | 22.0% | 16.8% | **19.6%** | 26% |
| Expression of Ideas | 11.3% | 16.5% | **19.3%** | 20% |

The "before retune" column is worth keeping: it shows that simply adding this task's
content, at the OLD 12/18 targets, would have made Craft and Structure's over-
representation *worse* (46.2% → 51.2%), not better — Text Structure and Purpose and
Cross-Text Connections are both Craft and Structure, and outnumber the one new Information-
and-Ideas addition (Command of Evidence Quantitative) within the passage pool. Retuning the
targets, not just adding content, is what actually closed the gap. Final result: Expression
of Ideas and Standard English Conventions both land within striking distance of their real
26%/20% weights for the first time, Information and Ideas is close behind, and Craft and
Structure — still the furthest from its real weight — is structurally guaranteed to
over-represent for as long as vocabulary (100% Craft and Structure by design) is a sizable
share of the test, which is the accepted, explained tradeoff from keeping this fundamentally
a vocabulary app's practice mode (see `lib/practiceTest.js` for the full reasoning on why a
target hitting exact parity was rejected).

**7. Verification.** Full regression suite re-run clean after every content and target
change: `validate:passages` (333/333, including new checks for the two new question types'
chart shape and quote/word-count rules), `validate:grammar` (389/389), plus the
scratchpad's `grammar_logic_test.mjs`, `passage_logic_test.mjs` (both extended with cross-
text coverage), `practice_test_logic_test.mjs` (also extended for cross-text-aware pool
exhaustion), and `tonight_simulation.mjs` — all passing. `rm -rf .next && npm run build`
clean, twice (once before the unlock-page fix, once after). Every one of the four new
question types was verified with real attempts in the live UI, both on its own dedicated
page/route AND inside an actual practice-test run (module 1 of a real attempt was scanned
question-by-question specifically to confirm Rhetorical Synthesis's notes/goal block,
Cross-Text Connections' two-passage card, and Command of Evidence Quantitative's table all
render correctly there, not just on their standalone pages — this is exactly how the two
`practiceTest.js` pass-through bugs above were caught, before a learner ever could). No
console errors at any point. Verified at true mobile width (375px) as well as desktop for
both new chart types, specifically because narrow-width chart legibility was the stated
risk for that part.

## 2026-09-22 → 2026-09-27: Stripe unlock — the original test-mode build and its verification

The live ids and the current behavior are in `CLAUDE.md` ("Paid unlock"). This is the test-mode build
and the end-to-end verification record.

The sections below describe the original test-mode build:

The Stripe product already existed in this account before this round of
work (`prod_VG6KhZ3PshOM3Q`, "Voco - Full Access", with price
`price_1UFa7vQbCm1Y6nVSMIdrP1Pj` at $1.99/month) — a recurring Payment
Link (`plink_1UFaEjQbCm1Y6nVS1DOPNCBi`, `PAYMENT_LINK_URL` in
`lib/purchase.js`, `EXPECTED_PAYMENT_LINK_ID` in
`app/api/verify-subscription/route.js`) was created for it, with a 7-day
trial. Its `after_completion` redirect points at the confirmed production
domain, `https://voco.courses/unlock?session_id={CHECKOUT_SESSION_ID}`
— verified via the Vercel API (`verified: true` on the project), not
assumed from the URL's shape. The app itself never hardcodes this domain
anywhere — redirect URLs (e.g. `app/api/create-portal-session/route.js`)
are built from `request.nextUrl.origin`, so nothing in the code needed to
change when the custom domain was connected; only the Stripe Payment
Link's redirect and this doc did. Production was originally verified on
the Vercel-assigned `voco-dusky.vercel.app` domain (still live and
serving the same project) before `voco.courses` was connected — see the
git history around the Payment Link's `after_completion.url` if the
domain ever needs to be traced back.

Verified for real against the **live production deployment**, not just
locally, all in Stripe test mode:
- Completed an actual Checkout with test card `4242 4242 4242 4242` →
  `/unlock` correctly verified the session, cached a real customer id
  (`cus_...`) and `"trialing"` status, and every paid category unlocked —
  both on the home screen and by navigating directly to a paid category's
  URL.
- Cancelled that real subscription via the Stripe API, forced the daily
  recheck, and confirmed access genuinely revoked on production — the
  category re-locked and direct URLs to `/sets/[setId]/study` and
  `/quiz` redirect to `/unlock` again.
- Confirmed the fail-open/fail-closed distinction: a Stripe API error
  keeps prior access (doesn't fabricate a cancellation), while Stripe
  genuinely reporting no active subscription does revoke it.

**Re-verified end-to-end on `voco.courses`** after the custom domain was
connected and the Payment Link's redirect was repointed at it (2026-09-18):
completed a fresh Checkout on `voco.courses`, confirmed `/unlock` redirected
back to `voco.courses` (not the old `voco-dusky.vercel.app` URL) and
unlocked every category; clicked "Manage subscription" and cancelled
through the **real Stripe Billing Portal UI** (not the API) — confirmed the
portal's own "Cancels [date]" and the app's `cancelAt` banner showed the
identical date after the daily recheck was forced; confirmed access was
still genuinely present afterward (direct navigation to a paid category's
quiz URL loaded real content, no redirect to `/unlock`).


## 2026-09-23: Screens follow real time — what was wrong, and how it was verified

The rule is in `CLAUDE.md` ("Screens follow real time, not activity type").

**What was actually wrong.** Every full-screen learning activity — `/sets/[setId]/study`,
`/sets/[setId]/quiz` (also missed-words and due-for-review, which reuse it),
`/passages/[passageId]`, `/grammar/[levelId]`, `/review`, `/practice-test`,
`/preview/[categoryId]` — hardcoded its palette by **what type of screen it was**, not
by the actual time: study was *always* the dark night palette, and quiz/passages/
grammar/review/preview were *always* the warm dawn gradient, regardless of the real
clock. The practice test had no time-awareness at all — always dark, all 64 possible
minutes of it, whatever the real hour. This meant a learner quizzing at 9pm (a completely
normal time to be quizzing — nothing in this app's own rhythm says quizzing only happens
at dawn) got a bright peach-and-cream screen exactly when the app's own stated premise
("deep night blues for studying, warm dawn tones when it's time to quiz" — the
NightThemeExplainer's own words) says they shouldn't. Only the home screen actually did
this correctly, tying its "Last night's words" (dawn) and "Tonight's study" (its own dark
shell) framing to `getPhase()` — every other screen imitated its *look* without adopting
its *rule*.


**Verified systematically, not spot-checked** (the same `window.__setClock` real-`Date`
override pattern used throughout this project, since jumping the real system clock isn't
an option): every one of study, quiz, missed-words (study + quiz), passages, grammar,
review, and the practice test (intro, the actual timed question screen including its
"selected" state, and the results screen) was loaded fresh at all three phases — morning
08:00, midday 14:00, evening 21:00 — confirming dawn only at morning and the calm night
palette at both evening *and* midday. The riskiest single check — a `CelebrationCard`
results screen rendered at night, `deep`-vs-`accent` swap included — was confirmed
visually, not just by computed style, and reads cleanly. `/preview/[categoryId]` (the
locked-category sample question, not explicitly named in the original ask but the same
exact bug) was found during the audit and fixed the same way.

## 2026-10-05: First-visit screen — fonts and speed measurements

The design and the current behavior are in `CLAUDE.md` ("First-visit screen instead of onboarding").

  **Fonts** now load through `next/font` (self-hosted, preloaded, size-matched
  fallback) instead of a render-blocking `@import` of fonts.googleapis.com;
  `lib/shareCard.js` reads the generated family names from the
  `--font-fraunces`/`--font-inter` variables so the share image still uses the
  loaded fonts. Fraunces keeps its optical-size axis.
  **Measured** (Lighthouse, mobile profile, Chromium, local production build,
  3 runs each, medians; with *applied* throttling — what a throttled phone
  really does): first-visit largest contentful paint 2878 ms → 1472 ms; first
  contentful paint 2878 ms → 1472 ms; total blocking time 0 → 97 ms — the TBT
  "increase" is an artifact, not extra work: before, nothing painted until
  after the JavaScript had run (so there was nothing to block), now content
  paints at 1.47 s while hydration is still in flight. With Lighthouse's
  default *simulated* throttling: FCP 1551 → 774 ms, LCP 2814 → 2574 ms (noisy,
  2419–3196), TBT 79 → 69 ms. **Caveat:** in the sandbox these were run in,
  Google Fonts requests from the browser fail, so the "before" includes a
  render-blocking stylesheet that errors out after ~400 ms rather than a real
  font download — the real-world gain from removing it is likely larger.
  **Bounce:** Vercel counts a single-page session as a bounce and custom
  events do not count toward it; the design target is real engagement on the
  first screen (answer a question, "Keep going" into a second page), not
  splitting content across pages to move the number.
