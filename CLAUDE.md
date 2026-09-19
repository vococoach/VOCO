# Voco — Project Context

Vocab Coach for the SAT. Study before bed, quiz yourself whenever you're ready. Read this
file before making changes — it captures decisions already made, so they
shouldn't be re-litigated or silently changed.

## Stack & architecture (deliberate choices, not defaults)

- Next.js 14 App Router, plain JavaScript (no TypeScript), Tailwind.
- **No backend, no database, no accounts.** Progress lives in the browser
  via `localStorage` (see `lib/progress.js`). This was a deliberate MVP
  scope decision, not an oversight — don't add auth/Supabase/a database
  without discussing it first.
- **Paid unlock via a Stripe subscription — still no accounts or database.**
  `Agreement & Support` is free forever; the other 5 categories require an
  active or trialing subscription (`PRICE_LABEL` = "$1.99/month",
  `TRIAL_LABEL` = "7-day free trial", both in `lib/purchase.js`, backed by
  a recurring Payment Link in the Stripe Dashboard). This is deliberately
  **not** a one-time purchase — access has to be able to turn off again,
  which shaped every piece below.
  - **Checkout → customer id.** `/unlock` (`app/unlock/page.js`) is both
    the sales page and the Checkout return destination: the Payment
    Link's `after_completion` redirect (Stripe Dashboard, not this repo)
    sends the buyer back to `/unlock?session_id={CHECKOUT_SESSION_ID}`,
    which POSTs to `/api/verify-subscription`
    (`app/api/verify-subscription/route.js`). That route asks Stripe (via
    `STRIPE_SECRET_KEY` in `.env.local`, never committed) whether the
    Checkout Session's subscription is `trialing`/`active` *and* that the
    session came from the expected Payment Link (`EXPECTED_PAYMENT_LINK_ID`
    — a `plink_...` id, not the public URL — so a session from some
    unrelated Stripe product can't be replayed to unlock it). On success
    the client caches the Stripe **customer id** — not a boolean — via
    `setCustomerId()`.
  - **Re-verified, not trusted forever.** A cached customer id only proves
    someone subscribed *once*. `lib/purchase.js` also caches the last
    known status (`{status, checkedAt}`, `voco_subscription_status_v1`) and
    `shouldRefreshStatus()` says yes once per calendar day per customer.
    When due, `refreshSubscriptionStatus()` POSTs the customer id to
    `/api/subscription-status` (`app/api/subscription-status/route.js`),
    which asks Stripe directly whether that customer currently has a
    `trialing`/`active` subscription — this is what actually revokes
    access on cancellation or a failed payment, not just a check on the
    original purchase. Every gated page shows the **cached** status
    instantly (no loading flash), then reconciles in the background; if
    the fresh answer disagrees (e.g. cancelled), the page re-renders
    locked and, on `/sets/[setId]/study` or `/quiz`, redirects to
    `/unlock` immediately — even mid-session.
  - **Fail open on errors, fail closed on a real answer.** If Stripe
    genuinely reports no active subscription, that's a confirmed
    revocation — access locks. If the *check itself* fails (network
    hiccup, Stripe outage, bad key), the API route returns a non-2xx
    status and the client explicitly keeps the last known status instead
    of caching a false "inactive" — a transient failure should never look
    like a cancellation. Don't collapse this distinction when touching
    `refreshSubscriptionStatus()` or `/api/subscription-status`.
  - **Still per-device, not a real account.** No accounts/database, per
    the point above — `voco_customer_id_v1` and
    `voco_subscription_status_v1` don't sync across browsers or survive a
    cleared one. A repeat subscriber on a new device goes through Checkout
    again (same subscription, new device-level verification) — that's an
    accepted MVP tradeoff, not an oversight.
  - **One subscription = every paid category, and the copy must say so.**
    Entitlement is a single boolean: `isCategoryLocked(categoryId,
    subscribed)` (`lib/purchase.js`) is `false` for the one free category
    and `!subscribed` for everything else — there is no per-category
    purchase, and Stripe has exactly one product/price. Because each
    locked card on the home screen sits under its own category heading, a
    bare price next to it reads as "$1.99 to unlock *this*." So wherever
    the price appears in the UI it's paired with its scope: locked cards
    ("$1.99/month for full access to every category"), the `/unlock` pitch
    and error state ("One subscription gives you full access to every
    category", "$1.99/month after your trial, for full access to every
    category"), and the subscribed footer ("You have full access to every
    category."). If per-category or tiered pricing is ever added, that copy
    — and this bullet — need to change together. Legal text (`/terms` §4,
    `/privacy` §3) and the Stripe product description (currently "Full
    access to every SAT vocab category, with spaced repetition review" —
    deliberately no hardcoded counts, which would drift as the word bank
    grows) are separate surfaces; keep them consistent too.
  - **The actual gate.** `getSetCategoryId(setId)` (`lib/wordbanks.js`)
    resolves any setId (real level, per-category "still learning" id, or
    `null` for `DUE_FOR_REVIEW_ID`) back to its category, and both
    `/sets/[setId]/study` and `/sets/[setId]/quiz` use it plus
    `isCategoryLocked(categoryId, subscribed)` to redirect to `/unlock` if
    that category isn't free and the (cached, then reconciled) subscribed
    state says no — this is the real enforcement; the home screen's lock
    icon + price on locked category cards is just UI on top of it.
    `/review` and the due-for-review study course are deliberately left
    ungated: they only ever surface words the learner already studied
    once, which means that word's category was unlocked at the time, so
    there's nothing new to gate there.
  - **Self-service management via Stripe's Customer Portal — and the
    "active but ending" state that comes with it.** `openBillingPortal()`
    (`lib/purchase.js`) POSTs the stored customer id to
    `/api/create-portal-session`, which creates a Billing Portal session
    and returns its URL; the client redirects there. The portal itself
    handles cancellation and payment-method updates — no custom UI for
    that. **Important, easy to get wrong:** cancelling through the portal
    does **not** flip `status` to `canceled` immediately. Stripe schedules
    it for the end of the current period/trial (`cancel_at`) and the
    subscription stays `trialing`/`active`, with full access, right up
    until then — the portal itself tells the user this
    ("...available until the end of your billing period"). That's
    correct, deliberate behavior — don't build anything that revokes
    access early just because a cancellation is pending. What's *not*
    automatic is the user finding out: `/api/subscription-status` returns
    `cancelAt` (and `cancelAtPeriodEnd`) alongside `status`, cached in
    `voco_subscription_status_v1` next to it, and read back via
    `getCancelAt()` (mirrors `isSubscribedCached()`'s cache-then-reconcile
    pattern). The home screen shows a banner — "Your subscription ends on
    [date] — you'll keep access until then" — whenever `subscribed &&
    cancelAt`, and swaps in the same "Manage subscription" action in place
    of the plain footer link, so a learner who already cancelled isn't
    staring at a subscription link that looks like nothing happened.
    `subscribed` (the access-gating boolean) is intentionally unaffected
    by `cancelAt` — being subscribed and being "ending soon" aren't
    mutually exclusive, and only a genuine non-`trialing`/`active` status
    from Stripe should ever lock a category.
- **No AI calls at runtime.** All vocab content is hard-coded in
  `lib/wordbanks.js`. This is intentional for reliability — an earlier
  version called an AI API live and it was flaky. Content is written once
  (by a human or AI-assisted, then reviewed), then baked in as static data.
- No quiz-unlock timer — study and quiz are both available anytime. Also
  deliberate, for ease of testing/demoing.
- **Spaced repetition (Leitner system)**, added after MVP launch as the
  first paid-value feature. Every word gets its own box (1–5) tracked in
  `lib/progress.js` under the `voco_word_srs_v1` localStorage key, separate
  from level-level progress. Missing a word resets it to box 1 (due again
  immediately); answering correctly advances it and pushes the next review
  further out (intervals: 0, 1, 3, 7, 16 days). The `/review` route pulls
  every word across every category that's currently due — this is the
  feature that's supposed to differentiate Voco from plain flashcard apps,
  so don't remove or weaken it without discussing first.
- **Review sessions are capped at 20 words** (`REVIEW_SESSION_CAP` in
  `lib/progress.js`). `getDueWordIds()` returns due ids pre-sorted by
  priority — lowest box first (most urgent), then oldest `nextReviewDate`
  within a box — so both `/review` and the due-for-review study course
  just take the front of that list. Anything past the cap rolls over to
  the next visit; the `/review` results screen shows "N more due — they'll
  be here next time" instead of forcing a huge session in one sitting.
- **Every quiz result is tiered by percentage — and it's shared, not
  per-page.** `getScoreTier(score, total)` (`lib/scoreTier.js`) is the one
  place thresholds and colors live: **100% perfect** (the app's
  "correct answer" green `#7BC9A0`), **70–99% good** (the positive/CTA
  orange `#FF9B5C`), **below 70% watch** (the "incorrect answer" rose
  `#E08A9E`). Percentages, not counts, because levels, missed-words
  sessions and review sessions all differ in length; the 70% line is
  inclusive and uses integer math (`score * 100 >= total * 70`).
  `components/QuizResults.js` renders the end-of-quiz card for all three
  quiz types (level quizzes and missed-words sessions in
  `sets/[setId]/quiz`, review sessions in `review`) with one structure —
  disc, label, headline, score, note — recolored per tier; each page
  passes `copy: { perfect, good, watch }` (`{headline, note}` each)
  because what's true differs by quiz type. A `note` may be an array to
  put each entry on its own line.
  **The "watch" tier must never read as a bad grade.** This is a study app
  for teens, not a report card: the label is "Worth another look", the
  headline "These are the ones to watch.", and the note says what really
  happens next (missed words are flagged and return via review / "still
  learning"). Keep the copy true per type: a *review* miss lands in box 1
  and is due immediately ("right back in your next review" — not
  "tomorrow"), a *missed-words* miss stays under "still learning", and a
  *level quiz* miss does both. Don't write copy that promises something
  the SRS doesn't do. Small text on the cream card uses each tier's
  darker `deep` shade (the accents are too pale to read at that size).
  Motion is one gentle fade/rise and a soft settle on the disc
  (`.voco-rise` / `.voco-settle` in `globals.css`), disabled under
  `prefers-reduced-motion`; deliberately no confetti or sound.
  **Home screen:** each quizzed level shows a tier disc (check /
  trending-up / bookmark, the same glyphs as the results card) and a
  status line in the tier color with the tier's word — "Perfect score",
  "Almost there", "Worth another look" — plus the score, so color is never
  the only signal. Only the perfect tier also gets the green ring. It
  tracks the **most recent** quiz (like the old "Last score"), not a
  lifetime best, so a later retake can move a level between tiers; a
  sticky "best ever" badge would need a new field in `voco_progress_v1`.
- **The due-for-review card also has a Study option**, not just Review.
  `DUE_FOR_REVIEW_ID = "due-for-review"` (`lib/wordbanks.js`) special-cases
  `/sets/[setId]/study` the same way the per-category courses do, via
  `getDueForReviewLevel(dueWordIds)` — but pooled globally across every
  category (not per-category) and using the same priority order + cap as
  `/review`, so studying previews exactly what that quiz session will
  cover. `/review` itself is untouched — the home screen's "Review" button
  still links there directly; "Study" is the only new path.
- **Each category has its own "still learning" course — dynamic, not a
  real level.** `missedWordsId(categoryId)` (`lib/wordbanks.js`) builds a
  reserved id like `"agreement-support-missed-words"` (real level ids
  always end in `-1`/`-2`/`-3`, so this suffix can't collide); the inverse,
  `missedWordsCategoryId(setId)`, is what `/sets/[setId]/study` and
  `/sets/[setId]/quiz` use to special-case it. Built at request time from
  whichever of *that category's* words are currently in box 1
  (`getStruggleWordIds()` in `lib/progress.js`, filtered to the category),
  via `getMissedWordsLevel(categoryId, struggleIds)`. Deliberately
  per-category rather than one global list pooled from everywhere — lets a
  learner drill the specific area they're weak in. Not listed in
  `categories`, so each shows up as its own "N words you're still
  learning" card at the bottom of that category's level list on the home
  screen (visible only when count > 0), not as a regular level card.
  Answering a question here updates the word's *real* box (each entry
  carries its true source id as `srsId`, used instead of recomputing
  `wordId(level.id, word)` — the level id here is the synthetic
  `"<category>-missed-words"`, which wouldn't resolve to anything real).
  Both this and the review page read `localStorage` in a `useEffect`
  rather than during render, since the server-rendered pass always sees
  empty progress data — reading it synchronously during render caused a
  hydration mismatch.

## Content rules — these matter a lot, please follow them exactly

1. **Categories are organized by function, not topic.** The real Digital
   SAT tests vocab through "Words in Context" questions that hinge on
   argumentative function (does this word support, refute, intensify,
   soften, describe tone, etc.) — not by theme like "science words" or
   "people words." Keep new categories function-based, matching the
   existing pattern (Agreement & Support, Disagreement & Refutation, etc).

2. **Quiz format = fill-in-the-blank sentence, not "define this word."**
   Each `quiz` object has a `sentence` (a full sentence with `______` where
   the word goes), 4 `options`, a `correctIndex`, and an `explanation`. All
   4 options should be plausible at a glance — the correct one should be
   the only one that precisely fits the sentence's specific tone and logic,
   not just the only one that's a real English word.

3. **Distractor difficulty should escalate with level.** Foundational
   levels: distractors are clearly wrong (opposites/unrelated words) — easy
   to build confidence. Advanced levels: distractors are close, plausible
   near-synonyms — genuinely hard, matching real hard-tier SAT questions.

4. **Quality over hitting an exact word count.** Every word in a level
   should be genuinely distinct from every other word in that category —
   no near-duplicate padding just to hit a target number. It's fine for a
   level to have 10 words instead of 15 if that's where genuinely distinct,
   well-chosen words run out. Check for duplicate words across levels
   within a category before finishing.

5. **All content must be original writing** — definitions, example
   sentences, and quiz sentences should be written fresh, not copied from
   any SAT prep company's word list or site. The words themselves (e.g.
   "ambiguous," "corroborate") aren't copyrightable, but don't lift a
   curated list or example sentences from an existing source.

6. **Validate before finishing.** After adding words, run a quick script
   (see the pattern used in past sessions) to check: no duplicate words
   within a category, every quiz has exactly 4 options, every quiz sentence
   contains `______`, `correctIndex` is 0–3.

## Content status

All 6 categories are fully built: 204 words total, each with 3 levels
(12 Foundational / 12 Intermediate / 10 Advanced).

- ✅ `agreement-support`
- ✅ `disagreement-refutation`
- ✅ `degree-intensity`
- ✅ `change-consequence`
- ✅ `certainty-doubt`
- ✅ `tone-attitude`

Validated: no duplicate words within or across categories, every quiz has
exactly 4 options with a `______` blank and a `correctIndex` of 0–3. An
unbuilt category would have an empty `levels: []` array in
`lib/wordbanks.js`, which makes the home screen show it as "Coming soon" —
there are none of those left.

## File structure

```
app/
  layout.js              Root layout + metadata
  page.js                Home screen — categories, due-for-review card
                         (Study + Review), each category's own "still
                         learning" card (Study + Quiz)
  globals.css             Fonts + Tailwind + the results card's one-time
                         entrance animation
  review/                 Spaced-repetition review session (capped at 20)
  sets/[setId]/study/     Study flow — setId is a real level id (e.g.
                         "agreement-support-2"), a per-category "still
                         learning" id (missedWordsId()), or
                         DUE_FOR_REVIEW_ID
  sets/[setId]/quiz/      Quiz flow — real levels and per-category "still
                         learning" ids only (due-for-review's quiz is
                         /review, not this route)
  unlock/                 Sales page + Stripe Checkout return destination
                         for the subscription unlock
  terms/                  Terms of Service — reachable route, linked from
                         the home screen footer
  privacy/                Privacy Policy — same, cross-links to /terms
  api/verify-subscription/   POST route — given a Checkout session_id,
                         confirms it's this product's subscription and
                         trialing/active, returns the Stripe customer id
  api/subscription-status/   POST route — given a cached customer id, asks
                         Stripe whether it's currently trialing/active,
                         plus cancelAt/cancelAtPeriodEnd if a cancellation
                         is already scheduled; this is what makes both a
                         real cancellation revoke access, and a scheduled
                         one visible (see "Paid unlock" above)
  api/create-portal-session/ POST route — given a cached customer id,
                         creates a Stripe Billing Portal session and
                         returns its URL; the portal itself handles
                         cancellation and payment-method updates
components/
  QuizResults.js          End-of-quiz card shared by level quizzes,
                         missed-words sessions and review sessions —
                         one structure, recolored by score tier
lib/
  scoreTier.js            Tier thresholds (100 / 70 / below) + colors,
                         shared by QuizResults and the home screen
  wordbanks.js            All content — categories > levels > words, plus
                         getMissedWordsLevel() and getDueForReviewLevel()
                         for the dynamic study courses, and
                         getSetCategoryId() for paywall gating
  progress.js             localStorage helpers: streaks, scores, and the
                         Leitner-system spaced repetition tracker
                         (REVIEW_SESSION_CAP lives here)
  purchase.js              Subscription constants + localStorage helpers
                         (voco_customer_id_v1, voco_subscription_status_v1)
                         — per-device only, see "Paid unlock" above
```

## Paid unlock — status: built and verified end-to-end on production (test mode)

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

**A real production bug was found and fixed during this verification**,
worth knowing about if subscription verification ever breaks again: the
`STRIPE_SECRET_KEY` value stored in Vercel's env vars had a stray
non-ASCII character (a bullet point, U+2022) embedded in it — almost
certainly a copy-paste artifact from when it was entered in the Vercel
dashboard. That broke every outbound request at the HTTP
header-encoding layer inside the serverless function, but the Stripe
SDK reported it as a generic `StripeConnectionError` rather than the
real `TypeError`, which briefly pointed suspicion at the Node runtime
version and HTTP client instead — both dead ends. If this error shows up
again, check the *literal contents* of the env var value first (e.g. by
having a route do a raw `fetch` to `api.stripe.com` and inspect the
error) before assuming it's a platform/runtime issue. The project's Node
version is currently pinned to `22.x` (down from `24.x`, changed while
chasing this bug) — harmless to leave as is, since 22.x is an LTS
version, but not the actual fix.

## Terms of Service & Privacy Policy

`/terms` and `/privacy` are real routes (`app/terms/page.js`,
`app/privacy/page.js`), linked from the home screen footer — not files
sitting unused. Content is written to match how the app actually works,
not generic boilerplate: no accounts, progress lives only in
`localStorage` on-device (explicitly *not* synced or backed up, and lost
on a cleared browser or new device), billing handled entirely by Stripe
(we hold a customer id + subscription status, never card details), no
analytics/tracking of any kind (true as of this writing — if that ever
changes, both pages need updating to match, not just the code). Contact
email on both: `itsowentodd@icloud.com`. If the subscription price,
trial length, or free/paid category split ever changes, update the
Terms' "Subscription & Billing" section to match — don't let it drift
from `lib/purchase.js`.
