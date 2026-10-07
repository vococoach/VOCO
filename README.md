# Voco — MVP

A vocabulary-learning platform. Study before bed, quiz yourself whenever you're ready.

Voco has multiple courses, all under one subscription: **SAT Vocab** (matched to the
Digital SAT's Words in Context questions), **Everyday Vocabulary** (evergreen words
for reading, writing and conversation, organized by theme — no exam required),
**Professional Vocabulary** (words for meetings, decisions, and leading people, set in
real workplace situations), and **GRE Vocab** (graduate-level vocabulary organized by
connotation — a word's positive or negative charge — in an academic voice).

## What's in this version (and what isn't)

To keep this MVP simple and reliable, based on what we decided:

- **No accounts.** Progress is saved in the browser (`localStorage`) on whatever
  device you're using. It won't sync between your phone and laptop — that's a
  deliberate tradeoff for v1, not a bug.
- **No backend, no database.** All content is hard-coded in `lib/wordbanks.js`
  (plus `lib/satExpertTier.js`, `lib/satPassages.js`, `lib/satStrategy.js`,
  `lib/satGrammar.js`, `lib/everydayVocabulary.js`, `lib/professionalVocabulary.js`
  and `lib/greVocabulary.js`), organized as courses > categories > difficulty levels >
  words. Nothing calls an AI API at runtime, so there's nothing that can go down or
  return a bad response while someone's using the app.
- **Quiz format is words in context, in every course.** A sentence with a
  blank, and several plausible-looking words where only one is precisely
  correct — not plain "define this word" questions. For SAT Vocab this matches
  the real Digital SAT's "Words in Context" questions; the other courses keep it
  because it teaches how a word is actually used, each in its own setting
  (Professional in real workplace situations, GRE in academic/scholarly writing).
- **Content status:** 537 words in 15 categories; most have 3 levels of 12/12/10
  words, SAT Vocab categories also have a 4th, optional Expert level, and GRE Vocab's
  are smaller (10/10/8 — see below).
  - **SAT Vocab** (249 words): organized by function — Agreement & Support,
    Disagreement & Refutation, Degree & Intensity, Change & Consequence,
    Certainty & Doubt, and Tone & Attitude. The course page has five tabs:
    **Vocabulary** (the categories, including the Expert level, whose
    distractors are extremely close near-synonyms), **Passages** (16 original
    reading passages and 4 cross-text pairs, all with the
    subscription; tracked separately from vocabulary progress), **Grammar & Usage**
    (Standard English Conventions and Expression of Ideas questions across four
    categories, all with the subscription — also tracked separately), **Practice
    Test** (a timed, simulated 54-question Reading & Writing section drawn from
    the vocabulary/passage/grammar content above — paid only, its own tracking),
    and **Strategy** (4 short test-day guides, free for everyone).
  - **Everyday Vocabulary** (102 words): organized by theme — Precise
    Description, Emotional Nuance, and Persuasion & Influence.
  - **Professional Vocabulary** (102 words): organized by theme and setting —
    Meetings & Negotiation, Strategy & Decision-Making, and Leadership &
    Workplace Dynamics.
  - **GRE Vocab** (84 words): organized by connotation, not theme — Positive
    Charge, Negative Charge, and Neutral & Academic — since recognizing a
    word's charge is a real GRE vocabulary technique. Harder than the other
    courses at every tier, in an academic/scholarly voice.
- **No unlock timer.** The quiz is available any time, even right after
  studying. That's intentional for now, so it's easy to test and demo.
  The home screen does adapt to the time of day (evenings suggest tonight's
  study, mornings surface last night's words), but that's only a suggestion —
  nothing is ever locked by the clock.
- **One subscription, no ads.** In each course, one category's Foundational and Intermediate levels are free forever (its Advanced level, SAT's Expert level and everything else need the subscription); a
  single $1.99/month subscription (7-day free trial, via Stripe) unlocks every
  category in every course. Still no accounts — see `CLAUDE.md`.

There's no database, but it isn't purely static: three small server routes
(`app/api/*`) talk to Stripe to start, verify and manage a subscription, so
deploying needs a `STRIPE_SECRET_KEY` (see below). It is hosted on Vercel (check Vercel's current plan
limits and pricing — Web Analytics custom events may need a paid plan).

## Running it locally

You'll need [Node.js](https://nodejs.org) 18.17 or newer (production runs 22.x).

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

To exercise the subscription routes, put a Stripe **test** key in `.env.local`
(`STRIPE_SECRET_KEY=sk_test_...`). Env files are git-ignored (`.env`, `.env.*`);
never commit one. Note that the "Start free trial" link opens the live Payment
Link, so don't complete a purchase while testing.

## Tests

```bash
npm test               # content validators + logic tests (no browser, no network)
npm run test:browser   # real-Chromium suites; needs a running build, see scripts/browser/_env.mjs
```

`npm test` runs `validate:passages`, `validate:grammar`, `validate:vocab`,
`test:first-visit`, `test:access` and `test:practice`. The validators catch
mechanical problems only; new content still needs a close read.

## Continuing the build with Claude Code

Open this folder in Claude Code (desktop app's Code tab, or run `claude` from
a terminal inside this folder) and describe what you want next — e.g. "add a
4th Professional Vocabulary category" or "add a fourth course." Claude Code
can edit these files directly, run the dev server, and catch its own mistakes
as it goes, which this chat can't do.

## Deploying it for real

The easiest path is [Vercel](https://vercel.com) (made by the creators of
Next.js, and it has a free tier that comfortably covers this app):

1. Push this folder to a GitHub repository.
2. Go to vercel.com, sign in, and click "Import Project."
3. Select your repo — Vercel auto-detects Next.js and deploys it with no
   configuration needed.

Reminder from earlier: whoever registers the domain and the Vercel/GitHub
accounts will need to be 18+, so loop a parent in for that step.

## Suggested next steps, roughly in order

1. **Test it yourselves first.** Study a level, take the quiz, see how it
   actually feels day to day — including the spaced-repetition review flow
   at `/review`.
2. **Get it in front of a few real people** (friends, classmates) before
   adding anything else.
3. **Only after that:** consider accounts (so progress syncs across
   devices), custom AI-generated sets, or notifications.
   Each of those adds real complexity — worth adding only once you know
   people actually use the core loop.

## File structure

`CLAUDE.md` has the full, annotated map and the reasons behind it; this is the short version.

```
app/          Routes: home, courses/, sets/[setId]/study + quiz, review/, passages/,
              cross-text/, grammar/, strategy/, practice-test/, preview/, unlock/,
              terms/, privacy/, and api/ (the three Stripe routes)
components/   Shared UI: first-visit screen, category/passage/grammar lists,
              results and milestone cards, share dialog, loading state
lib/          Content (wordbanks.js and the per-course files), progress and spaced
              repetition (progress.js), the free-set / subscription rules
              (purchase.js, access.js), time-of-day logic and themes, sleep-science
              wording (sleepScience.js), analytics, and the Stripe route helpers
scripts/      Validators and tests (npm test); browser/ holds the Chromium suites
CHANGELOG.md  History that no longer describes how the app works today
```
