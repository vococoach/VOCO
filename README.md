# Voco — MVP

A vocabulary-learning platform. Study before bed, quiz yourself whenever you're ready.

Voco has multiple courses, all under one subscription: **SAT Vocab** (matched to the
Digital SAT's Words in Context questions), **Everyday Vocabulary** (evergreen words
for reading, writing and conversation, organized by theme — no exam required), and
**Professional Vocabulary** (words for meetings, decisions, and leading people, set in
real workplace situations).

## What's in this version (and what isn't)

To keep this MVP simple and reliable, based on what we decided:

- **No accounts.** Progress is saved in the browser (`localStorage`) on whatever
  device you're using. It won't sync between your phone and laptop — that's a
  deliberate tradeoff for v1, not a bug.
- **No backend, no database.** All content is hard-coded in `lib/wordbanks.js`
  (plus `lib/satExpertTier.js`, `lib/satPassages.js`, `lib/satStrategy.js`,
  `lib/everydayVocabulary.js` and `lib/professionalVocabulary.js`), organized as
  courses > categories > difficulty levels > words. Nothing calls an AI API at runtime, so there's
  nothing that can go down or return a bad response while someone's using the
  app.
- **Quiz format is words in context, in every course.** A sentence with a
  blank, and several plausible-looking words where only one is precisely
  correct — not plain "define this word" questions. For SAT Vocab this matches
  the real Digital SAT's "Words in Context" questions; for Everyday and
  Professional Vocabulary it's kept because it teaches how a word is actually
  used (Professional sets every sentence in a real workplace situation).
- **Content status:** 440 words in 12 categories, each with 3 levels
  (12/12/10 words); SAT Vocab categories also have a 4th, optional Expert level.
  - **SAT Vocab** (236 words): organized by function — Agreement & Support,
    Disagreement & Refutation, Degree & Intensity, Change & Consequence,
    Certainty & Doubt, and Tone & Attitude. The course page has three tabs:
    **Vocabulary** (the categories, including the Expert level, whose
    distractors are extremely close near-synonyms), **Passages** (5 original
    reading passages with questions — one free, the rest with the
    subscription; tracked separately from vocabulary progress), and
    **Strategy** (4 short test-day guides, free for everyone).
  - **Everyday Vocabulary** (102 words): organized by theme — Precise
    Description, Emotional Nuance, and Persuasion & Influence.
  - **Professional Vocabulary** (102 words): organized by theme and setting —
    Meetings & Negotiation, Strategy & Decision-Making, and Leadership &
    Workplace Dynamics.
- **No unlock timer.** The quiz is available any time, even right after
  studying. That's intentional for now, so it's easy to test and demo.
  The home screen does adapt to the time of day (evenings suggest tonight's
  study, mornings surface last night's words), but that's only a suggestion —
  nothing is ever locked by the clock.
- **One subscription, no ads.** One category in each course is free forever; a
  single $1.99/month subscription (7-day free trial, via Stripe) unlocks every
  category in every course. Still no accounts — see `CLAUDE.md`.

Because there's no backend, hosting this costs **$0** — it's a fully static
Next.js app.

## Running it locally

You'll need [Node.js](https://nodejs.org) 18 or newer installed.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

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
   devices), custom AI-generated sets, monetization, or notifications.
   Each of those adds real complexity — worth adding only once you know
   people actually use the core loop.

## File structure

```
app/
  layout.js              Root layout + page metadata
  page.js                Home screen — daily-habit cards (due, tonight's study,
                         still learning, streaks) + a card per course
  courses/[courseId]/    One course's category list
  review/page.js         Spaced-repetition review (pulls due words from every course)
  globals.css            Fonts + Tailwind
  sets/[setId]/study/    The "study before bed" flow
  sets/[setId]/quiz/     The "quiz yourself" flow
lib/
  wordbanks.js           Courses, the SAT Vocab content, and the helpers that
                         work across every course
  everydayVocabulary.js  The Everyday Vocabulary course's categories
  professionalVocabulary.js  The Professional Vocabulary course's categories
  progress.js            localStorage helpers: streaks, scores, and the
                         Leitner-system spaced repetition tracker
```
