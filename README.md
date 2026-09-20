# Voco — MVP

Vocab Coach for the SAT. Study before bed, quiz yourself whenever you're ready.

## What's in this version (and what isn't)

To keep this MVP simple and reliable, based on what we decided:

- **No accounts.** Progress is saved in the browser (`localStorage`) on whatever
  device you're using. It won't sync between your phone and laptop — that's a
  deliberate tradeoff for v1, not a bug.
- **No backend, no database.** All content is hard-coded in
  `lib/wordbanks.js`, organized as categories (by function — Agreement &
  Support, Disagreement & Refutation, etc.) each broken into 3 difficulty
  levels. Nothing calls an AI API at runtime, so there's nothing that can go
  down or return a bad response while someone's using the app.
- **Quiz format matches the real Digital SAT.** The actual test only tests
  vocab through "Words in Context" — a sentence with a blank, and several
  plausible-looking words where only one is precisely correct. Our quizzes
  use that same format, not plain "define this word" questions.
- **Content status:** All 6 categories are fully built — 204 words total
  across Agreement & Support, Disagreement & Refutation, Degree & Intensity,
  Change & Consequence, Certainty & Doubt, and Tone & Attitude, each with
  3 levels (12/12/10 words) — see `lib/wordbanks.js`.
- **No unlock timer.** The quiz is available any time, even right after
  studying. That's intentional for now, so it's easy to test and demo.
  The home screen does adapt to the time of day (evenings suggest tonight's
  study, mornings surface last night's words), but that's only a suggestion —
  nothing is ever locked by the clock.
- **No payments, no ads.** Just the core study → quiz loop.

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
7th word set about literature" or "add a way to add custom sets." Claude Code
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
  page.js                Home screen — categories, plus review CTA
  review/page.js         Spaced-repetition review (pulls due words from anywhere)
  globals.css            Fonts + Tailwind
  sets/[setId]/study/    The "study before bed" flow
  sets/[setId]/quiz/     The "quiz yourself" flow
lib/
  wordbanks.js           All course content (edit this to add sets)
  progress.js            localStorage helpers: streaks, scores, and the
                         Leitner-system spaced repetition tracker
```
