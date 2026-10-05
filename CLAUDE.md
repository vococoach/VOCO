# Voco — Project Context

A vocabulary-learning platform. Study before bed, quiz yourself whenever you're ready.
Voco has multiple courses under one subscription — **SAT Vocab** (the original
course, matched to the Digital SAT), **Everyday Vocabulary** (general audience, no
exam), **Professional Vocabulary** (working adults, set in real workplace
situations) and **GRE Vocab** (graduate-level, organized by connotation instead of
theme, set in academic/scholarly voice) — see "Courses" below. Read this file before
making changes — it captures decisions already made, so they shouldn't be
re-litigated or silently changed.

## Stack & architecture (deliberate choices, not defaults)

- Next.js 14 App Router, plain JavaScript (no TypeScript), Tailwind.
- **No backend, no database, no accounts.** Progress lives in the browser
  via `localStorage` (see `lib/progress.js`). This was a deliberate MVP
  scope decision, not an oversight — don't add auth/Supabase/a database
  without discussing it first.
- **Paid unlock via a Stripe subscription — still no accounts or database.**
  One category in each course is free forever (`FREE_CATEGORY_BY_COURSE` in
  `lib/purchase.js`: Agreement & Support in SAT Vocab, Precise Description in
  Everyday Vocabulary, Meetings & Negotiation in Professional Vocabulary); every
  other category, in every course, requires an
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
  - **One subscription = every paid category in every course, and the copy
    must say so.** Entitlement is a single boolean: `isCategoryLocked(categoryId,
    subscribed)` (`lib/purchase.js`) is `false` for a free category
    (`isFreeCategory()` — one per course) and `!subscribed` for everything
    else — there is no per-category or per-course purchase, and Stripe has
    exactly one product/price. Because each
    locked card on the home screen sits under its own category heading, a
    bare price next to it reads as "$1.99 to unlock *this*." So wherever
    the price appears in the UI it's paired with its scope — "every
    course" now that there are several: locked cards ("$1.99/month for full
    access to every course"), the `/unlock` pitch and error state ("One
    subscription gives you full access to every course", "$1.99/month after
    your trial, for full access to every course"), the sample-question
    prompt, the cancellation banner, and the subscribed footer ("You have
    full access to every course."). If per-category, per-course or tiered
    pricing is ever added, that copy — and this bullet — need to change
    together. Legal text (`/terms` §4, `/privacy` §3) and the Stripe product
    description (updated 2026-09-20 to "Full access to every Voco course,
    with spaced repetition review" — deliberately no hardcoded counts, which
    would drift as the word bank grows) are separate surfaces; keep them
    consistent too.
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
  `lib/wordbanks.js` (SAT Vocab's original three tiers), `lib/satExpertTier.js`
  (SAT Vocab's Expert tier), `lib/satPassages.js` and `lib/satStrategy.js` (SAT
  reading passages and strategy guides), `lib/everydayVocabulary.js` (Everyday
  Vocabulary) and `lib/professionalVocabulary.js` (Professional Vocabulary).
  This is intentional for reliability — an earlier
  version called an AI API live and it was flaky. Content is written once
  (by a human or AI-assisted, then reviewed), then baked in as static data.
- **Vercel Web Analytics only, plus three anonymous funnel events — and it must
  stay that way.** `<Analytics />` from `@vercel/analytics/next` in
  `app/layout.js` (added 2026-09-22) gives aggregate, anonymous page-view counts —
  no cookies, no per-visitor identifiers, nothing that connects a page view to
  a customer id or any other data this app holds. That's a deliberate constraint
  matching the no-accounts architecture above, not an oversight: don't add user
  ids or a second analytics tool that would start identifying visitors without
  discussing it first. On 2026-10-05, with the owner's explicit go-ahead, three
  custom events were added (see "Analytics events" below). In dev it logs to the
  console instead of sending anything; it only reports to Vercel on a real
  deploy, and needs Web Analytics turned on for the project in the Vercel
  dashboard to collect there.
- No quiz-unlock timer — study and quiz are both available anytime. Also
  deliberate, for ease of testing/demoing.
- **Spaced repetition (Leitner system)**, added after MVP launch as the
  first paid-value feature. Every word gets its own box (1–5) tracked in
  `lib/progress.js` under the `voco_word_srs_v1` localStorage key, separate
  from level-level progress. Missing a word resets it to box 1 (due again
  immediately); answering correctly advances it and pushes the next review
  further out (intervals: 0, 1, 3, 7, 16 days). The `/review` route pulls
  every word across every course and category that's currently due — this is the
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
  `components/QuizResults.js` (a thin wrapper over the shared
  `components/CelebrationCard.js`) renders the end-of-quiz card for all three
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
- **The home screen is time-aware — framing only, never gating.** The
  night/dawn look is the app's premise made visible, tied to the **real
  clock**, not to which activity is on screen — see "Screens follow real
  time, not activity type" below for the fuller rule this now follows
  everywhere, not just here. The home screen follows the learner's **local
  device clock** (`lib/timeOfDay.js`, read on the client after mount — the
  page is prerendered, so the server has no meaningful "now"): **evening**
  18:00–04:59 shows a "Tonight's study" card (a suggested next level, a
  "pick a course" prompt when there's nothing to follow yet — see "Courses" —
  or "Tonight's study is done" once one was finished since 18:00 — after
  midnight is still "tonight"); **morning** 05:00–11:59 features "Last
  night's words — quiz yourself now" *above* the due-for-review card if a
  level was studied today or yesterday; **midday** is the plain neutral
  view. **Nothing is ever locked or hidden by the clock** — the quiz stays
  available at any hour (see the README's "No unlock timer"); this only
  changes what's suggested. Rules worth knowing before touching it:
  the morning card skips levels already quizzed since 05:00 (the point is
  the *post-sleep* quiz, so it retires itself once done), skips locked
  categories (a lapsed subscription would just bounce to `/unlock`), and
  picks the most recently studied level. `studiedAt`/`lastQuizAt` are **UTC**
  dates (9pm in California is already "tomorrow" in UTC), so this feature
  uses the exact `studiedTs`/`lastQuizTs` epoch-ms timestamps that
  `markStudied()`/`recordQuizResult()` now also write, and compares in
  local time; records from before the timestamps existed fall back to the
  date strings. The page also re-reads the clock and progress on
  `visibilitychange`/`focus`, so a tab left open overnight shows the
  morning state at breakfast. A small info icon next to the logo opens
  `components/NightThemeExplainer.js` — a native `<dialog>` (Esc, backdrop
  click, X and "Got it" all dismiss it — one tap, no added friction)
  explaining the sleep/memory rationale; keep its claims hedged, since how
  much sleep helps varies by person. Its tap target is 44px on purpose (the
  visible icon is 16px).
  **It no longer opens by itself (removed 2026-10-05).** From 2026-09-22 it
  auto-opened once per fresh browser session (a `sessionStorage` flag,
  `voco_night_theme_seen_session_v1`), a deliberate tradeoff made with the owner
  to keep the sleep rationale from going undiscovered. **That is reversed, and
  so is the two-slide onboarding below**: the goal is the lowest realistic
  bounce for first-time visitors, who arrive mostly on phones from TikTok/
  YouTube links, and an uninvited dialog (or two intro slides) before they have
  touched anything is the opposite of that. The explainer is now tap-only, via
  the info icon (which stays in both headers, with the same 44px target); the
  night/dawn look and the always-on science note carry the premise instead. The
  old flag is no longer read or written; `clearLegacyFlags()` (`lib/visitor.js`)
  tidies it from anyone's `sessionStorage` on the next home-screen load, and a
  leftover `voco_onboarded_v1` is ignored and tidied the same way — an old flag
  can't change which screen anyone sees. **Leave `components/ScienceNote.js`
  (the permanent, always-on footnote, below) out of this — it's a separate
  feature and wasn't touched.** (The 2026-09-23 bug where the explainer mounted
  before onboarding status was known is gone with both features; the lesson
  stands for any future component with a mount-time side effect: gate it on a
  definitively-known state, not merely "not literally `true` yet" — `null` and
  `false` are not the same condition.)
- **All sleep-and-memory wording lives in one file — `lib/sleepScience.js` —
  and has hard accuracy rules.** The closing screen, the onboarding, the
  "why the night theme?" explainer and the home screen's always-on science
  note all import from it, so a claim is checked once and can't drift between
  screens. The rules (they exist because this
  is the app's credibility): (1) say only the well-established general
  finding — sleep, including hippocampus–cortex replay, *helps* stabilize
  and strengthen memories formed while awake; (2) **never name a study,
  researcher, institution or year** — a vague, correct sentence beats a
  precise citation that might be wrong; (3) **never suggest new information
  is absorbed while asleep** (a debunked claim) — sleep works on what was
  already learned, and the copy says "memories formed while you're awake";
  (4) prefer "helps" over "is when / is where" (consolidation also happens
  while awake, so sleep is not the *only* time), and avoid "lock it in"
  (it oversells what sleep or a quiz does — "help it stick" is the house
  phrase); (5) always keep the hedge ("how much it helps varies from
  person to person"). Retrieval practice (quizzing strengthens memory more
  than rereading) is a separate, also well-established effect and is kept
  as its own sentence. The same rules apply to any sleep line written
  outside that file (the home subtitles, the morning/evening cards).
- **A permanent, quiet science note on the home screen**
  (`components/ScienceNote.js`, under the subtitle, home only). Always
  present on every visit — not a one-time tip, not a modal, nothing to tap or
  dismiss; the "why the night theme?" dialog stays the deeper, opt-in
  explanation. It is deliberately a *footnote, not a card*: `text-xs`, a faint
  outline and no fill, so the daily-habit cards keep the attention (three lines
  on desktop, worst case four on a 375px phone). Its **color follows the fact's
  kind**, the same night/day split as its icon: night indigo `#8B85FF` + moon for
  a sleep fact, dawn orange `#FF9B5C` + sunrise for a retrieval fact (it started
  as one flat muted lavender, which was too easy to miss). Both pass WCAG AA for
  small text on the actual background (`#1A1C3A`, the note has no fill): 5.43:1
  and 7.94:1. Re-check that if either color or the background ever changes —
  never trade readability for a livelier color. The facts are `SCIENCE_FACTS` in
  `lib/sleepScience.js`, in two **separate categories**: `sleep` (memory
  consolidation) and `retrieval` (the testing effect — self-quizzing
  strengthens memory more than rereading). `pickScienceFact(phase, now)` ties
  it to the time-of-day system: **evening → a sleep fact** (why you're
  studying now), **morning → a retrieval fact** (why you're being quizzed
  now), **midday → the two interleaved**, alternating day to day. It is a
  function of the phase and the learner's local calendar day — deterministic,
  not random — so it doesn't jump when the tab regains focus and re-reads the
  clock; it advances to the next fact each day. Rules for adding a fact, on
  top of the five above: one or two short sentences (well under ~170
  characters); it must say something the others don't; **no digits, years or
  names** ("researchers found" counts); retrieval facts stay to the
  well-replicated general findings about self-testing — no effect sizes, no
  claim that this app's quiz format is optimal — and use "tends to" /
  "usually" / "is thought to" instead of "always" / "never" / "proves". **The
  hedge is never written into a fact by hand:** `pickScienceFact()` always
  attaches the category's hedge (`SCIENCE_HEDGES`, named for what it hedges —
  "How much sleep helps…" / "How much self-testing helps…"), so a new fact can't
  ship without one. Read every new line for accuracy before it ships (a lint
  over these rules — no digits, no attribution, no absorb-while-asleep, no
  oversell phrasing, sentence count, near-duplicate overlap — was run when they
  were written). Don't add a sleep fact that merely restates the app's own
  study-then-sleep premise ("studying before bed keeps it fresh") — that is
  the premise, not a finding; an earlier fact like that was replaced. Mind the
  direction of the interference fact: the evidence is that memories are more
  resistant to interference from things learned *after* a period of sleep — not
  that sleep shields them from what you learn between studying and going to
  bed, which can still disrupt them. It is also worded neutrally about
  mechanism ("tend to be more resistant"), because researchers still debate
  whether sleep actively strengthens memories or mainly protects them from new
  input; don't rewrite it to take a side.
- **Finishing a study session ends on a brief closing screen, not an
  instant redirect** (`components/StudyClose.js`, shown by
  `sets/[setId]/study` when "Done studying" is clicked; `markStudied()` still
  runs first). It says why to stop here — "Sleep helps your brain make it
  last" plus the shared consolidation/replay lines and the short hedge — and
  its wording follows the clock ("come back in the morning" in the evening
  phase, "after tonight's sleep, come back tomorrow morning" otherwise). It
  is **only a suggestion**: "Back home" is one tap, it never auto-advances,
  and the quiz is still available immediately (the "no unlock timer"
  decision stands). It also appears after missed-words and due-for-review
  study sessions, since they share the study page.
- **First-visit screen instead of onboarding (2026-10-05).** The two-slide
  onboarding (`voco_onboarded_v1`, `useOnboarding()`, the check on the course
  page too) was **removed**, along with the auto-opening explainer above —
  see that bullet for the why: a first-time visitor on a phone should land on
  something they can *use*, not something to dismiss. A first-time visitor is
  one whose device has **no saved progress and no cached subscription**
  (`isReturningVisitor()`, `lib/visitor.js`, over `SAVED_PROGRESS_KEYS` +
  the customer id; derived, not a flag — so "Reset progress on this device"
  really does start the device over, and an old onboarding flag changes
  nothing). They see `components/FirstVisit.js` on the home screen: headline
  "Study tonight. Quiz tomorrow.", the subline "SAT vocab, built around how
  sleep helps memory settle." (checked against the `lib/sleepScience.js` rules
  by `scripts/test-first-visit.mjs`), and one real free question; after
  answering (right or wrong) there is instant feedback with the explanation, a
  primary **Keep going** (a real next page: `/sets/agreement-support-1/quiz`,
  the free level the question came from) and a quieter **Start free trial**
  link with "7 days free, then $1.99/month. Cancel anytime." beside it (the
  line is `TRIAL_TERMS` in `lib/purchase.js`, and every start-trial link
  anywhere goes through `components/TrialLink.js`, which counts it and is
  required by the test to sit next to that line). Below the first screen is the
  list of the four courses, so the other three stay discoverable. A returning
  device skips all of it and gets the normal home (review, tonight's study).
  **The question** is `lib/firstVisit.js`: "Uphold" (Agreement & Support ·
  Foundational) — short enough to fit with all four options on a 375×667
  phone, easy to get right but with a real pull toward "Overturn", and its
  explanation teaches the contextual-cue skill in one line. Its options show in
  a fixed order (correct answer third) because the question is the same for
  everyone and a post-mount shuffle would move options under a thumb; real
  quizzes still shuffle every time. The first screen fits 375×667 with and
  without an answer showing (measured: content ends at y=431 before answering,
  599 after, of 667); options are a 2×2 grid of 48px targets.
  **Speed and no-flash design.** The server renders the first-visit view and it
  is usable the moment the HTML arrives — no `invisible` gate, nothing waiting
  on localStorage. After hydration, `app/page.js` swaps to the returning view
  only if `isReturningVisitor()` says so. Two things stop the swap and the
  clock from flashing: an inline `<head>` script (`lib/preHydration.js`) runs
  before first paint and sets `data-phase="morning"` (same hours as
  `getPhase()`) and `data-returning="1"` on `<html>`; the first-visit screen
  paints from CSS variables (`THEME_CSS` in `lib/timeTheme.js`, NIGHT on
  `:root`, DAWN under `html[data-phase="morning"]`) instead of a
  JavaScript-chosen theme, and `html[data-returning] .vc-first {display:none}`
  hides it for a returning device. Measured in a real browser: a morning visit
  is painted in dawn colors on the first frame; a returning device never has
  the first-visit view visible; a returning device sees a brief empty dark
  screen (the body color) until hydration puts the home on it — the one
  remaining "gap", unavoidable without a server-side signal, and no first-visit
  content shows in it. The only layout shift is 0.01 CLS, from the web font
  arriving. `/courses/[courseId]` shows its course immediately for a first
  visitor — it is a plausible landing page and has no gate any more.
  **Palette:** it follows the real time of day (dawn in the morning, night
  otherwise), like every learning screen. It adds one thing to the palettes:
  `subtextAA` (DAWN's subtext is ~3.4–4.0:1 on the dawn background; the darker plum
  is ~5.2:1), used by this screen only. Button text is `onAccent`, like everywhere —
  see "Contrast on dawn orange" below.
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
- **The night-to-morning streak is a second, separate counter** (header,
  sunrise icon, "N day night-to-morning streak"; the flame "N day streak"
  is unchanged and counts any quiz on any day). One *cycle* = a level
  studied last night, quizzed the next morning. Detection is **not
  duplicated**: the quiz page calls the same `findLastNightsLevel()` the
  "Last night's words" card uses, when the quiz opens (it must be then —
  once the result is recorded the level counts as "already quizzed this
  morning" and stops being featured), and if the level being quizzed is the
  one the card would feature it counts, whichever button opened it. Not for
  missed-words sessions or midday/evening quizzes. The results screen says
  "Night-to-morning complete — N days in a row." The name is deliberate:
  "sleep cycle" is also the sleep-science term for the ~90-minute loop of
  sleep stages, which this is not.
  `recordNightToMorning()` / `getNightToMorningStreak()` (`lib/progress.js`,
  key `voco_night_to_morning_v1`, cleared by Reset) and the daily
  `getStreak()` both count through one shared `consecutiveDayStreak()`:
  consecutive days, today may still be pending, a missed day resets to 0.
- **Every date in `lib/progress.js` is the learner's LOCAL calendar day —
  keep it that way.** `todayStr()` used to be UTC (`toISOString()`), and
  `addDays()` parsed local but formatted UTC. That made a 9pm quiz in
  California count as "tomorrow" (skewing the daily streak) and, worse,
  scheduled spaced-repetition reviews on the wrong day — for zones east of
  UTC *every* review date was wrong. It was fixed at the root (streak,
  `studiedAt`/`lastQuizAt` and `nextReviewDate` all local now) and verified
  against an independent oracle over hundreds of randomized histories in five
  time zones (old code: 20–57% wrong in the Americas, ~100% wrong for review
  dates in Tokyo/Auckland; new code: 0 wrong). Streaks step by `setDate()`,
  not by subtracting 24h, so daylight-saving days (23/25h) can't skip or
  repeat a day. Any date written under the old UTC convention is off by at
  most a day, once — there were no real users when this was fixed, so no
  migration was written. (`lib/purchase.js` keeps its own UTC `todayStr()`
  for the once-a-day subscription recheck; that's a cadence, not a
  learner-facing date, so it was left alone.)
- **One-time milestones, shown once ever, on the results screen**
  (`lib/milestones.js`, `components/MilestoneCards.js`). Three kinds, each
  with fixed thresholds: **streak** — the *night-to-morning* streak (never the
  daily one) reaching 3 / 7 / 30 days; **mastery** — categories mastered *per
  course*, at that course's 1st / 3rd / whole-course (`masteryThresholds(n)`:
  SAT Vocab 1/3/6, Everyday Vocabulary, Professional Vocabulary and GRE Vocab 1/3; a category is mastered once
  *every required level* in it has been completed at 100% at least once — SAT
  Vocab's Expert tier is `optional` and doesn't count, see "SAT Vocab has three
  sections" below); **words** —
  distinct words, across every course, that have ever reached
  spaced-repetition box 3+ (`LEARNED_BOX`; i.e. answered correctly twice in a
  row, not merely seen), at 25 / 50 / 100 / 200. A mastery id names its course
  (`mastery-<courseId>-<N>`) and the card says which course was mastered.
  **Legacy ids are migrated, not dropped:** before courses existed the ids
  were `mastery-N`; `readShown()` maps those to `mastery-sat-vocab-N` (SAT was
  the only course), so a learner who already saw "first category mastered"
  isn't shown it again.
  Two sticky fields exist purely for this, because the old records only kept
  the latest state: `perfectAt` on a level record (set on the first 100%;
  `lastScore` alone forgets it after a worse retake) and `maxBox` on a word
  record (`box` drops to 1 on a miss). Legacy records fall back to their
  latest score / current box. "Words learned" is therefore monotonic — a
  later miss never un-learns a word — so a milestone can't be un-crossed.
  `checkNewMilestones()` runs at the end of a level quiz, missed-words session
  or review session (after everything else is recorded), marks what it returns
  as shown in `voco_milestones_shown_v1`, and returns only the **highest**
  newly crossed threshold per kind (a jump from 0 to 7 days shows one card,
  not 3 then 7; the skipped 3 never surfaces later). Up to three cards can
  appear at once (one per kind), rendered *under* the score card as inline
  cards — never a modal or popup. Reset progress clears the shown-list (it is
  progress); the onboarding flag is separate and survives. The cards are the
  same `CelebrationCard` recipe as the score tiers (`QuizResults` renders
  through it too); colors reuse the palette (streak dawn-orange, mastery
  green, words lavender) and mastery deliberately has its own award glyph,
  because it can only fire on a perfect quiz and would otherwise sit under a
  green "Perfect score" card with the identical check.
- **Shareable image cards, generated client-side** (`lib/shareCard.js`,
  `components/ShareButton.js`). A canvas draws the same celebration card on
  the night background with the Voco wordmark, the tagline and a
  `voco.courses` watermark — 1080×1350 PNG, from a descriptor
  (`describeMilestone()` / `streakCard()` in `lib/milestones.js`, the single
  source of copy for both the in-app card and the image), so it always shows
  real numbers. A mastery card names its course in the image's label line
  ("EVERYDAY VOCABULARY MASTERY") and in the in-app card's `figure`; its `unit`
  stays short ("of 3 categories mastered") because the image draws it on a
  single unforgiving line. **The text under the figure is laid out before the
  card is drawn** (`layoutText()` in `lib/shareCard.js`): a long headline — a
  category like "Leadership & Workplace Dynamics" — wraps onto extra lines, and
  the original fixed-height card let the note spill out of its bottom edge (it
  did so for existing titles too, e.g. "Agreement & Support"; it only went
  unnoticed because nobody had rendered one). Preference order: keep the
  standard sizes; else shrink the headline (54→48→44→40px); else the note
  (30→27px); only then grow the card (up to 966px tall, with the tagline and
  watermark following its bottom edge). A card whose text already fits takes the
  exact old path — verified byte-identical for every streak, words and short-title
  card. Render any new long title before shipping a course. The dialog offers what the device supports: **Share** (Web
  Share API with the PNG file, most phones), else **Copy image**
  (`navigator.clipboard.write`), and always **Download image**. Entry points:
  "Share this" on every milestone card, a "Share" link beside
  "Night-to-morning complete…" on results, and the **header streaks
  themselves** (tap the flame or sunrise streak) so it's reachable any time.
  Gotchas already hit: the big figure is drawn at a small font size and
  scaled up, because at 200px+ Fraunces switches to a hairline display cut in
  which a "4" is barely legible; glyphs use lucide's own path data so they
  match the app; font loading is capped at 2.5s so slow/blocked fonts fall
  back to system fonts instead of hanging the dialog; and the dialog ignores
  a stale native `close` event if it was reopened in the meantime. Native
  share can't be exercised in desktop/headless browsers — it was verified by
  stubbing `navigator.share` and checking the file, name, type and text it is
  handed; copy and download were verified for real.
- **Try one real question in a locked category before paying**
  (`/preview/[categoryId]`, `lib/preview.js`; a "Try a sample question" link
  on each locked card *beside* the price, which stays and still links to
  `/unlock`). It is one **fixed** question per locked category (in any course) — the
  first word of the first level — in the real words-in-context format, not a
  mockup (the page names the course it's from), and
  deliberately **unmetered**: no login, no tracking, no limit; revisiting shows
  the same question. It records nothing (no progress, no spaced-repetition
  history) and grants nothing: the category stays locked and
  `/sets/[setId]/study|quiz` still redirect to `/unlock`. After answering, a
  "$1.99/month for full access" prompt links straight to the Stripe Payment
  Link (plus "See what's included" → `/unlock`). Unknown ids, a course's
  free category, and already-subscribed visitors are redirected home. (All content
  ships in the client bundle regardless — the paywall is UI-level, per the
  notes above — so previews reveal nothing new.)
- **The due-for-review card also has a Study option**, not just Review.
  `DUE_FOR_REVIEW_ID = "due-for-review"` (`lib/wordbanks.js`) special-cases
  `/sets/[setId]/study` the same way the per-category courses do, via
  `getDueForReviewLevel(dueWordIds)` — but pooled globally across every
  course and category (not per-category) and using the same priority order + cap as
  `/review`, so studying previews exactly what that quiz session will
  cover. `/review` itself is untouched — the home screen's "Review" button
  still links there directly; "Study" is the only new path.
- **Each category has its own "still learning" course — dynamic, not a
  real level.** `missedWordsId(categoryId)` (`lib/wordbanks.js`) builds a
  reserved id like `"agreement-support-missed-words"` (real level ids
  always end in `-1` to `-4`, so this suffix can't collide); the inverse,
  `missedWordsCategoryId(setId)`, is what `/sets/[setId]/study` and
  `/sets/[setId]/quiz` use to special-case it. Built at request time from
  whichever of *that category's* words are currently in box 1
  (`getStruggleWordIds()` in `lib/progress.js`, filtered to the category),
  via `getMissedWordsLevel(categoryId, struggleIds)`. Deliberately
  per-category rather than one global list pooled from everywhere — lets a
  learner drill the specific area they're weak in. Not listed in
  `categories`, so each shows up as its own "N words you're still
  learning" card at the bottom of that category's level list on its course
  page (visible only when count > 0), not as a regular level card. The home
  screen's top layer ALSO gathers these across every course into one
  "words you're still learning" card — one Study/Quiz row per category that
  has any, each naming its course — so the daily loop doesn't require picking
  a course first. That card links to the same per-category ids; there is
  deliberately still no single mixed-bag global set.
  Answering a question here updates the word's *real* box (each entry
  carries its true source id as `srsId`, used instead of recomputing
  `wordId(level.id, word)` — the level id here is the synthetic
  `"<category>-missed-words"`, which wouldn't resolve to anything real).
  Both this and the review page read `localStorage` in a `useEffect`
  rather than during render, since the server-rendered pass always sees
  empty progress data — reading it synchronously during render caused a
  hydration mismatch.

## Courses — Voco is a multi-course platform

Voco began as SAT-vocab-only. It is now a vocabulary-learning platform with
**SAT Vocab** as one course among others, all under the one subscription.

**Why Everyday Vocabulary exists.** SAT Vocab is exam-shaped: its content and its
organization exist to match the real Digital SAT. That's a narrow audience. Everyday
Vocabulary is the same loop (study at night → quiz in the morning → spaced
repetition) for anyone — evergreen words for reading, writing and conversation, with
no exam behind them — so the app doesn't only make sense to someone with a test date.

**Why it is organized differently.** SAT Vocab is organized by *argumentative
function* (Agreement & Support, Tone & Attitude…) because that's what the SAT's Words
in Context questions actually test — that structure was justified by matching the real
exam's format, and doesn't apply where there is no exam. Everyday Vocabulary is
organized by *theme* (Precise Description, Emotional Nuance, Persuasion & Influence),
in groupings a curious general reader would recognize. The quiz format is kept
(sentence with a blank, 4 options, one precisely correct) but for a different
reason: it teaches how a word is *used*, not just what it means, which is worth doing
with or without an exam. Same 3 levels, distractor difficulty escalating with level.

**Data model** (`lib/wordbanks.js`): `courses = [{ id, title, description, categories,
passages?, guides? }]` above the unchanged category > level > word shape (`passages` and
`guides` are optional extra sections — only the SAT course defines them). `categories` is still exported as
the flat list across every course, so anything that only cares about categories
(paywall, preview, milestones' word totals, time-of-day) didn't need to know courses
exist. `findLevel()` returns `{ course, category, level }`; `getAllWordsFlat()` returns
every word of every course (with `courseId`/`courseTitle` added) because spaced
repetition and review deliberately see everything; `getCategoryCourse(categoryId)` maps
back. **The restructure was a wrapping, not a regeneration**: the SAT data literal is
untouched (the array was only renamed and nested — proven byte-identical by hash), and
**no level id or word id may ever change** — `voco_progress_v1`, `voco_word_srs_v1` and
the milestone list key on them directly, and changing one silently orphans that data.
Ids must stay unique across courses (level `<category>-<1|2|3>`, plus `-4` for SAT
Vocab's Expert tier; word `<levelId>::<slug>`), and a word may appear in only one course.
Adding the Expert tier was the same kind of wrapping: the SAT data literal is still
untouched (its array is `satVocabCoreCategories`) and the Expert level is appended from a
separate file — the original three tiers were proven byte-identical by hash
(`f65f7e793d183d8a`, Expert stripped).

**Entitlement: one free category per course** (a decision made when the second course
was added, so each course can be genuinely tried before paying):
`FREE_CATEGORY_BY_COURSE` in `lib/purchase.js` — Agreement & Support (SAT Vocab),
Precise Description (Everyday Vocabulary), Meetings & Negotiation (Professional
Vocabulary) and Positive Charge (GRE Vocab); each is its course's first category. Everything else, in every course, is
one subscription. When adding a course, give it a free category there and update the
terms free-category sentence; when adding a category, nothing else changes. A category's
Expert tier follows the category: Agreement & Support's Expert level is free, the other
five need the subscription (the gate is per category, so nothing extra was needed). SAT
reading passages have their own small gate — see "SAT Vocab has three sections".

**The home screen has two layers.** *Top, unscoped to any course:* the daily habit loop
— last night's words (morning), tonight's study (evening), due for review, words
you're still learning (one drill row per category, across courses), the streaks. These
pull from every course's words together so nobody has to pick a course first just to
see what's due. *Below:* a card per course with its own progress summary
(`CourseProgress` / `getCourseProgress()`: "X of N categories mastered · Y of M levels
completed", where a level is completed once it has ever been perfect — the same rule
as the mastery milestone), leading to `/courses/[courseId]`, which shows that course's
category list (the old home screen, scoped). "Back" from a level's study/quiz page
returns to its course page; the due-for-review set spans courses, so it goes home.

**"Tonight's study" has no default course, on purpose — and, since 2026-09-23,
prioritizes finishing what's in progress over jumping around, then rotates across
courses rather than tunneling into one.** `getTonight(courses, sets, now, isLocked)`
(`lib/timeOfDay.js`): (1) `done` if a level was studied since 18:00, unchanged — this
answers "did I already do tonight's study," which is about activity, not about what's
next. Otherwise, two priorities, checked in order, across **every unlocked course
equally** (never locked to whichever course was touched last):
- **Priority 1 — finish an in-progress category.** A category is "in progress" if
  some (not all) of its required levels have been perfected at least once
  (`isPerfectOnce`, `lib/milestones.js` — the exact same "completed" the course-progress
  summary already uses, so this doesn't invent a second definition). If any exist,
  anywhere, the **most recently touched** one wins — so momentum on what the learner
  just started isn't interrupted by a fresher-looking category elsewhere — and the
  suggestion is its first not-yet-perfected required level, in level order.
- **Priority 2 — only once nothing is in progress, start a fresh category** (zero
  required levels ever studied). The **least recently touched course** wins — the
  opposite tie-break from priority 1, deliberately: priority 1 rewards recency
  (finish what you're doing), priority 2 penalizes it (don't neglect the other three
  courses) — so a learner isn't kept grinding one course's categories start to finish
  while the rest sit untouched; within that course, its first fresh category in
  category order.
- `choose` — a "pick a course" prompt listing every course, no course pre-selected —
  fires **only** when *nothing anywhere* has ever been studied: the one moment the app
  still refuses to guess. It does not recur once anything anywhere has been touched,
  even after every started course is later fully mastered — priority 2 takes over
  from then on instead.
- **Never suggests a level that's already been perfected once, full stop** — the
  selection is built entirely from *not-yet-mastered* levels, so this holds
  structurally, not as an afterthought. If literally every required level in every
  unlocked course has been perfected, `getTonight()` returns `null` (no card at all)
  rather than re-suggesting something already mastered — replacing the old "revisit
  whatever was studied longest ago" fallback, which didn't check mastery and could
  easily have re-suggested a perfected level while a genuinely unfinished one sat
  elsewhere.

Locked levels are never suggested, and neither are `optional` levels (SAT Vocab's
Expert tier is something you choose to go for, not something the app nudges you
into) — though studying one still counts toward "tonight's study is done" (unchanged).
**Why the previous version needed this:** it always followed the single
most-recently-studied *course*, taking its first unstudied level in fixed
category/level array order — which happened to look like "finish what's in progress"
in the common case of studying straight through in order, but wasn't actually that
rule: a learner who studied categories out of order could be pointed at a **fresh**
category while an **in-progress** one still had levels left (nothing about "first
unstudied in array order" prefers "has some progress" over "hasn't been touched"),
and once a course was picked it was the *only* course suggested from until entirely
exhausted, real tunnel vision. Verified with a from-scratch Node simulation
(`tonight_simulation.mjs` in the scratchpad pattern) that plays 45 consecutive
perfect evenings across all 4 courses and asserts the exact properties above (no
duplicate suggestion, `choose` exactly once, every course visited, momentum
preserved when interrupted by an out-of-order manual study session, imperfect
quizzes still re-suggested), plus confirmed live in the browser: mastering SAT
Vocab's first category correctly rotates the very next suggestion to Everyday
Vocabulary, not deeper into SAT Vocab.

**Professional Vocabulary** (the third course) is for working adults — a different
audience from exam prep (SAT Vocab) and from general reading and conversation
(Everyday Vocabulary). It is organized by *theme / context of use* (Meetings &
Negotiation, Strategy & Decision-Making, Leadership & Workplace Dynamics), not by
function, for the same reason as Everyday: there is no exam whose format the
structure has to match. What makes it distinct is its **setting, not its format**:
the quiz mechanic, the 3 levels and the escalating distractors are the same, but every
example and quiz sentence is set in a real workplace situation (emails, meetings,
negotiations, performance reviews, reports, budgets), so the words are learned where
they are used. A fourth category, Professional Writing & Tone, was deliberately left
for later (it would overlap SAT Vocab's Tone & Attitude, so it needs care).

**GRE Vocab** (the fourth course, added 2026-09-23) targets graduate-level vocabulary —
a different, harder audience from all three courses before it. It is organized by
**connotation, not theme or function**: Positive Charge, Negative Charge, and Neutral &
Academic. This is deliberately different from every course so far, decided with the
owner rather than defaulting to the theme-based pattern Everyday and Professional
already established: recognizing whether a word is favorable, unfavorable, or
charge-neutral is a well-established, genuinely useful GRE technique, one that works
even before a learner knows a word's exact definition — organizing around it, rather
than around theme, teaches the technique directly instead of leaving it implicit. The
Neutral & Academic category exists for the other half of that technique: practice with
words that carry no charge at all, so a learner doesn't over-apply "must be good or
bad" to a word that's simply descriptive or analytical (`empirical`, `discrete`,
`paradigm`). **Difficulty is calibrated above the other three courses at every tier** —
GRE Vocab's Foundational sits roughly where SAT Vocab's Advanced does, and its own
Advanced tier is deliberately obscure, graduate-register vocabulary
(`pusillanimous`, `perfidious`, `recondite`). Its **voice** is the fourth distinct one
in the app: academic and scholarly — essays, research, literary and historical
criticism — where Everyday is general-life and Professional is workplace. See "Content
status" below for the word-count and content-quality details.

**Registering GRE Vocab needed exactly the checklist below and nothing more** — a real
test of the claim that adding a course is "close to a one-line change" for the third
time, and this time even the three non-generic fixes Professional Vocabulary needed
(see step 3) required no further changes: `joinList()` on `/unlock` already handled a
4th free category correctly ("A, B, C, and D"), `masteryThresholds(totalCategories)`
already worked off a category count rather than a hardcoded per-course list, and the
share card's dynamic height already handled a category title shorter than
Professional Vocabulary's own "Leadership & Workplace Dynamics." The only genuinely
manual step was terms §4, which — same as every time before — names free categories
by name because a legal list should be specific, not generic.

**Milestones and share cards are course-aware** (see the milestones bullet above);
sample-question previews work per locked category in any course and name the course.

**Adding a course** — what it really takes (the third course tested the claim that this
is "close to a one-line change"; the *code* is generic — nothing indexes into `courses`
or assumes a count — but registration is not literally one line, and three things were
not generic. The fourth course, GRE Vocab, confirmed all three fixes held: it needed
only steps 1, 2, 4 and 5 below — nothing in step 3 needed touching again):
1. **Content:** new `lib/<name>.js` exporting its categories (every id unique across
   the library, every word new to it).
2. **Register:** one import + one entry (id, title, description) in `courses` in
   `lib/wordbanks.js`, and **one line in `FREE_CATEGORY_BY_COURSE`** in
   `lib/purchase.js` — forget the second and the course has no free category.
3. **Things that were NOT generic, fixed while adding Professional Vocabulary:** the
   `/unlock` page joined free-category titles with " and " ("A and B and C stay free") —
   now `joinList()`; the share image assumed a one-line headline (see the share-card
   bullet above); and copy that *enumerated* course names went stale (site metadata,
   terms §2 and §4) — metadata and terms §2 no longer name courses at all, terms §4
   names each course's free category because a legal list should be specific.
4. **Copy to re-check:** terms §4's free-category list (and its date), the README and
   this file's counts. The Stripe product description needs no change as long as it
   names no course or count ("Full access to every Voco course…").
5. **Validate** like the others: 4 distinct options, one `______`, `correctIndex` 0–3,
   no duplicate words anywhere in the library, no `a`/`an` before the blank that gives
   the answer away — and **read every sentence for a defensible second answer**, which a
   script can't catch (a dozen were rewritten for Everyday, three for Professional, and
   six `a`/`an` giveaways were caught by an automated check and fixed for GRE Vocab —
   see the option set's vowel/consonant mix, not just whether `a`/`an` appears at all).
6. **Optional extra sections.** A course may also define `passages` and/or `guides`; if it
   does, `getCourseSections()` gives its page tabs automatically (a course with neither
   gets none). Passages need a free one in `FREE_PASSAGE_BY_COURSE` and their own gating;
   see "SAT Vocab has three sections".
7. **Then test for real:** the course on the home selector, a free-category preview and
   a locked one, a real mastery card and its share image (render the longest category
   title), the daily cards pulling words from every course, and a subscription unlocking
   every locked category across all courses.

## Screens follow real time, not activity type (fixed 2026-09-23)

**The rule, stated plainly, for any screen added from here on: a full-screen learning
activity's palette is decided by `lib/timeTheme.js`'s `getActivityTheme(now)`, driven by
the real local clock (`lib/timeOfDay.js`'s `getPhase()`) — never by what kind of screen
it is.** Don't write `bg-[#14152B]` (night) or `bg-gradient-to-b from-[#FFD9B0]
to-[#FFEFDD]` (dawn) directly into a new page because "this one feels like a study
screen" or "this one feels quiz-shaped." It doesn't matter what the screen *is* — it
matters what time it *is*. This is the second time this exact instinct produced a bug
(see below); treat any hardcoded palette on a new screen as a bug on sight, not a style
choice.

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

**The fix — one shared module, not a per-page `if`.** `lib/timeTheme.js` exports two
palettes, `NIGHT` and `DAWN` (page background, card surface, primary/secondary/muted
text, the accent button color + its own text color, and an unselected quiz-option
border/background), and `getActivityTheme(now)`, which returns `DAWN` only during the
morning phase and `NIGHT` otherwise. Every page above now computes
`getActivityTheme(new Date())` once on mount (client-only, matching the established
"read the clock after mount, not during SSR" pattern) and renders entirely from that
object — no page hardcodes a hex value for its background, card, or text color anymore.
**Midday defaults to NIGHT, not DAWN, on purpose:** there's no reason to warm a screen up
at 2pm, and it matches the home screen's own long-standing precedent (its neutral,
non-morning, non-evening state is already just its dark shell). The one hard requirement
this exists to satisfy: **nothing bright and warm shows up on a screen late at night**,
regardless of whether the activity is "study," "quiz," or anything added later.

**Two color families deliberately stayed OUTSIDE this system, unchanged:** (1) outcome
colors — the correct-answer green (`#7BC9A0`) and wrong-answer rose (`#E08A9E`) — because
they're already proven to read fine on both a light and a dark surface (the always-dark
practice test already used them successfully before this fix even existed), and they
mean something about the *answer*, not the *time*; (2) score-tier colors
(`lib/scoreTier.js`) and milestone-card colors (`lib/milestones.js`'s `CARD_STYLES`) —
these describe *how well the learner did* or *what was achieved*, a completely different
axis from time-of-day, and recoloring them by clock would make them meaningless.

**The results screen is still a screen — this was the part most likely to be missed.**
`components/CelebrationCard.js` (the shared recipe behind `QuizResults` and
`MilestoneCards`, so every quiz's end screen and every milestone celebration) used to
hardcode a light cream card (`#FFF9F2`) unconditionally, regardless of what page it was
rendered on — meaning even after fixing every page's own background, the results card
sitting in the middle of it would still have been a bright cream rectangle at 9pm. It now
takes a `theme` prop (threaded through `QuizResults`/`MilestoneCards` from the same
`getActivityTheme(now)` the calling page already computed) and renders its surface and
text from it. One subtlety that needed a real fix, not just a find-and-replace:
`lib/scoreTier.js`'s `deep` color (a darkened tier hue) was calibrated specifically to
read at 4.5:1 against the light DAWN card — reusing it as-is on a dark NIGHT card would
have been nearly invisible. `CelebrationCard` now picks `deep` on a DAWN card and
`accent` (the tier's brighter hue, already proven to read on dark surfaces — see
`lib/scoreTier.js`'s own comment) on a NIGHT card, rather than always using `deep`.
`MilestoneCards`' inline "Share this" text/icon needed the identical swap.

**The practice test's theme is fixed once, when the session opens — not
live-updated.** Every other page computes its theme once on mount too, but a practice
test can run up to ~64 real minutes across two timed modules; re-coloring the screen out
from under someone mid-question because a phase boundary (e.g. 05:00) was crossed during
the session would be far more disorienting than it staying exactly as it was when they
started, unlike a quick single-question quiz or the home screen's tab-refocus refresh.
Deliberate, not an oversight.

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

## Contrast on dawn orange (fixed 2026-10-05) — dark text, never white

**Rule: text on the dawn orange (`#FF9B5C`) is dark, never white.** White on that orange is
only ~2.1:1, under the 4.5:1 minimum for button text. `DAWN.onAccent` in `lib/timeTheme.js`
is now `#3D2B4F` (the dawn text color) — **6.09:1** on the orange — and every primary-action
button already reads its text from `theme.onAccent`, so quiz, study (and its closing screen),
review, reading passages, cross-text, grammar, the practice test (intro, module nav, submit,
transition, results), the sample-question page, the first-visit screen and every results
screen picked it up from that one value. **A new screen must use `theme.onAccent`; hardcoding
a text color on `theme.accent` is the bug.** NIGHT is unchanged: `#14152B` on `#8B85FF` is
**5.89:1** (midday and evening both use NIGHT; morning is the only dawn phase).
Measured, not assumed: every accent-colored button on every screen above was swept in a real
browser with the clock override at 08:00, 14:00 and 21:00 and its computed text vs. background
ratio taken — minimum **6.09 (morning), 5.89 (midday), 5.89 (evening)**, none under 4.5.
Known and *not* changed (outside "orange buttons"): the unanswered practice-test question
numbers on dawn are `#8A6E7D` on `#FFF9F2`, **4.36:1** (just under), and orange used as *text*
(links like "Back home", small notes) on the light dawn card is roughly 2:1; both want a darker
dawn subtext / a darker orange for text, which would change the look of every dawn screen.

## SAT Vocab has five sections — Vocabulary, Passages, Grammar & Usage, Practice Test, Strategy (Practice Test added 2026-09-23; Grammar renamed "Grammar & Usage" 2026-09-24 — see "Transitions + Command of Evidence" below)

The SAT course was **deepened, not turned into a fourth course**, with harder vocabulary,
real SAT-style reading passages and test-day strategy. Everything that existed kept
working unchanged; these are the decisions made with the owner (don't re-litigate them):

- **The course page is tabs, defaulting to Vocabulary.** `getCourseSections(course)`
  (`lib/wordbanks.js`) returns `Vocabulary | Passages | Strategy` for a course that defines
  `passages`/`guides`, and `null` for one that doesn't — Everyday and Professional show no
  tabs and are the old page exactly. It opens on Vocabulary so `/courses/sat-vocab` looks as
  it always did. The tab lives in the URL (`?section=passages|strategy`, written with
  `history.replaceState`, read with `useSearchParams`), so it can be linked and the Back
  links from a passage or guide return to the right tab. `CourseProgress` sits under the
  Vocabulary tab only. Before this, a course page had no sections — just a category list.
- **Expert tier: a 4th level in each of the 6 SAT categories, an *extra* — mastery is
  unchanged.** `lib/satExpertTier.js` (ids `<category>-4`, label "Expert", 45 words as of
  2026-09-22: agreement 8, disagreement 8, degree 8, change 6, certainty 6, tone 9),
  appended to the categories in `wordbanks.js`. Grown once already (from an initial 32):
  the batch that shipped 15 new words was cut to 13 after a close read caught two that
  were too close to an existing distractor to have one defensible answer (`Champion` vs.
  `Advocate`, `Incredulous` vs. `Skeptical`) — dropped rather than shipped, same standard
  as everything else here. **Category sizes are deliberately uneven and will likely stay
  that way** — each category grows only as far as genuinely distinct, unambiguous words
  allow; don't pad a smaller category to match a larger one. Each level carries `optional: true`. Mastery, the course
  summary ("N of 6 categories mastered · Y of 18 levels") and Tonight's-study suggestions
  count only the **required** levels (`requiredLevels()` in `lib/milestones.js`; `core` in
  `getTonight`), so an existing learner's "1 of 6 mastered" doesn't drop and no earned or
  pending milestone moves. Expert **does** feed everything else: spaced repetition, missed
  words, words learned, last night's words, and the "tonight's study is done" check.
  **Any new code that decides whether a category/course is *complete* must use
  `requiredLevels()`, not `category.levels`.** Agreement & Support's Expert level is free
  (it follows its category); the others follow the subscription.
- **Reading passages** (`lib/satPassages.js`, route `/passages/[passageId]`): 16 original
  passages (grown from an initial 5 on 2026-09-22, then 10, then 11 on 2026-09-24, then 16
  on 2026-09-27), 1–4 questions each (100–150 words for a normal passage; 25–90 for a
  command-of-evidence-quantitative one, deliberately shorter since its chart carries the
  evidentiary weight — see "The last four SAT domains" below), a real mix of types —
  `central-idea`, `inference`, `words-in-context` (a `______` blank drawn from *inside* the
  passage), `command-of-evidence` (added 2026-09-24), and, since 2026-09-27,
  `text-structure-purpose` and `command-of-evidence-quantitative` (the latter carrying a
  `chart`, rendered by `components/PassageChart.js` — see "The last four SAT domains" for
  both). No passage repeats a question type, and across the library no one type is allowed
  to dominate (each of the 6 must appear at least 3 times and none may exceed 60% of the
  total — a proportional version of the original "none more than 5" check; re-check this if
  the library grows again). **Originality is the rule
  that matters most here**: invented people, places, data and quotes; nothing derived from,
  modeled on or paraphrased from any real SAT or test-prep passage. Options are
  correct-first (`correctIndex: 0`) and shuffled on screen, so **an explanation must never
  refer to a choice by position** ("the first choice") — it names the choice by content.
  This shipped wrong not once but twice (the original 5, then 4 of the first draft of the
  next 5) before being caught by reading the rendered page — the mechanical part of that
  is now an automated, committed check: `npm run validate:passages`
  (`scripts/validate-passages.mjs`) runs a regex over every explanation
  (`POSITIONAL_LANGUAGE` in that file) and fails the build-adjacent check if a choice is
  referenced by position or letter, alongside its other structural checks (word/question
  counts, the blank-count match, 4 distinct options, no passage repeating a question type,
  the type-mix balance). **This script does not replace the close read** — it only catches
  the mechanical half of the bug (a positional phrase existing at all), not whether an
  explanation is actually *correct*, or whether a "correct" answer is genuinely the only
  defensible one. **Run both, every time passage content changes:** `npm run
  validate:passages`, then read every new passage against its actual shuffled options on
  screen. The same close-reading pass also cut two questions whose correct answer was
  defensible but not uniquely so (a `central-idea` question with two `inference` siblings
  in one passage, and an "incredulous vs. skeptical"-style distractor pair with no textual
  tiebreaker) — rewritten or retyped rather than shipped; no script catches that class of
  bug. The page reuses the quiz option/feedback pattern and `QuizResults`. Passage ids,
  like every id here, never change.
- **Decision — passages are tracked completely separately.** `lib/passageProgress.js`
  (`voco_passages_v1`, `PASSAGES_KEY` in `lib/progress.js`; cleared by Reset) keeps one record
  per passage — `{completedAt, lastScore, lastTotal, bestScore, attempts}` — and the course
  page shows its own "N of M passages completed". Passages do **not** touch spaced
  repetition, missed words, milestones, or either streak. Reason: a passage tests
  reading, not word retention, and forcing it into the SRS would have polluted the review
  queue. Known trade-off: a day with only a passage does not extend the daily streak.
- **Decision — one free passage.** `FREE_PASSAGE_BY_COURSE` / `isPassageLocked()`
  (`lib/purchase.js`): *The Tide Pool Census* is free to everyone (mirroring "one free
  category per course", and it doubles as the free sample of the passage layout); the other
  15 need the subscription. Gated exactly like the levels: `/passages/[passageId]` shows
  nothing until subscription status is known (cached, then reconciled), then redirects a
  non-subscriber to `/unlock`; the passage list shows locked cards with the price. As
  everywhere, this is UI-level gating — all content ships in the client bundle. Since
  2026-09-27, **Cross-Text Connections pairs** (`lib/satCrossText.js`, route
  `/cross-text/[pairId]`) reuse this exact same gating function and the exact same
  `voco_passages_v1` progress store — see "The last four SAT domains" below for why a pair
  isn't its own separate system. They have no free sample of their own.
- **Test-day strategy guides** (`lib/satStrategy.js`, route `/strategy/[guideId]`): four
  short written guides (words-in-context routine, pacing, common traps, unknown words) —
  **free to everyone, no gate, nothing recorded**. Written as `blocks` (heading, paragraph,
  list, steps, example). They state Digital SAT format facts (module length, question
  count, no guessing penalty, the timer/flag tools) *as of when written* and send readers to
  the College Board for current details, plus a "not affiliated with the College Board"
  line — formats change, so re-check those sentences if the test does.
- **Grammar & Usage** (`lib/satGrammar.js`, route `/grammar/[levelId]`, added 2026-09-22,
  3rd category and tab rename added 2026-09-24, 4th category added 2026-09-27): correct
  sentence construction, not word meaning — organized around real College Board subdomains,
  not invented ones, but spanning **two different real domains under one tab** because they
  read naturally as one thing to a learner. **Boundaries** and **Form, Structure, and
  Sense** (punctuation and sentence boundaries; subject-verb agreement, pronoun agreement
  and case, verb tense/mood, parallel structure, modifier placement) are Standard English
  Conventions. **Transitions** (choosing the transition word/phrase matching the actual
  logical relationship between two ideas) and **Rhetorical Synthesis** (given bulleted
  notes and a stated goal, choosing the sentence that best accomplishes it) are Expression
  of Ideas — originally left out for exactly that reason (see the domain audit above), then
  added once a specific need (moving the practice test's measured domain skew) justified
  building them, with the tab renamed from "Grammar" to "Grammar & Usage" rather than
  mislabeling either as Standard English Conventions. Full reasoning, the navigation-
  placement decisions, and the content itself: see "Transitions + Command of Evidence" and
  "The last four SAT domains" below. Each category's own
  `description` names its real domain honestly, even though the tab groups them
  together.
  - **Same 3-tier structure as vocabulary, but its own separate tree.** `course.grammar =
    [{ id, title, description, levels: [{ id, level, label, questions }] }]`, a sibling of
    `course.categories`/`passages`/`guides` on the course object, **not** nested inside
    `categories` — grammar has no `word`/no SRS identity, so keeping it structurally outside
    `categories` is what keeps it invisible to `getAllWordsFlat()`, mastery, missed-words and
    milestones without any special-casing. `findGrammarLevel(levelId)` mirrors `findLevel()`
    but walks `course.grammar`; level and category ids are a disjoint namespace from
    vocabulary ids (verified by test, not just by convention) so there is no collision risk
    even though ids look similar (`boundaries-1` vs. a vocabulary level like
    `agreement-support-1`).
  - **The question format reuses the vocab quiz shape, not vocab's blank-and-word-options
    shape.** Each question is `{ type, prompt, options: [4 FULL sentences, correct first],
    correctIndex: 0, explanation }` — 4 complete versions of a sentence (or the relevant
    portion), not 4 words filling a blank, since this tests construction, not meaning. The
    `/grammar/[levelId]` page clones `/sets/[setId]/quiz`'s multi-question step-through flow
    (not `/passages/[passageId]`'s 1–2-question shape) but renders each option as full-width
    wrapped text like passages do, since grammar options are sentences, not single words.
    `type` tags the specific rule each question tests (e.g. `"comma-splice"`,
    `"subject-verb-agreement"`) — used by the validator to check for real variety within a
    category, and useful for anyone auditing coverage later.
  - **Every wrong option is a real, common mistake, and every explanation names the actual
    rule for every option, not just "this one is correct."** Same discipline as everywhere
    else: original invented sentences, nothing derived from or modeled closely on real SAT
    material. Same positional-language rule as passages, for the same reason (options are
    shuffled on screen) — **and it recurred here even though the rule was already
    documented**: all 30 explanations were first drafted using "the second choice," "the
    third," etc., caught only by the (also new) automated check, not by drafting carefully in
    the first place. Lesson: write explanations content-first from the start ("the choice
    that does X"), don't draft positionally and fix later.
  - **Decision — tracked completely separately, like passages, not fed into spaced
    repetition.** `lib/grammarProgress.js` (`voco_grammar_v1`, `GRAMMAR_KEY` in
    `lib/progress.js`; cleared by Reset) keeps one record per grammar *level* (not per
    question) — `{completedAt, lastScore, lastTotal, bestScore, attempts}` — mirroring
    `passageProgress.js` exactly, keyed by level id instead of passage id since grammar has
    levels the way passages don't. Reason, as discussed with the owner: a grammar rule
    doesn't degrade the way a forgotten word does, so forcing it into the Leitner box model
    would have been a conceptual stretch with no real benefit, the same reasoning that kept
    passages out of the SRS. Grammar results never touch `voco_progress_v1`,
    `voco_word_srs_v1`, streaks, or milestones — verified by test (isolation is asserted, not
    assumed) and confirmed live in the browser (only `voco_grammar_v1` appears in storage
    after finishing a level).
  - **Decision — one free category, mirroring the passage and vocabulary-category
    precedent.** `FREE_GRAMMAR_CATEGORY_BY_COURSE` / `isGrammarCategoryLocked()`
    (`lib/purchase.js`): Boundaries is free to everyone (all 3 tiers); Form, Structure, and
    Sense requires the subscription. Gated exactly like vocabulary categories: the
    `/grammar/[levelId]` page shows nothing until subscription status is known (cached, then
    reconciled), then redirects a non-subscriber to `/unlock`; the grammar list on the course
    page shows a locked card with the price for the paid category. UI-level gating, same as
    everywhere else — all content ships in the client bundle.
  - **Decision — a new 4th tab, not nested under Vocabulary.** `getCourseSections()` already
    generalized to N optional sections when Passages and Strategy were added, so Grammar is
    one more `if ((course.grammar || []).length > 0)` line, no new architecture. Nesting it as
    a 7th vocabulary "category" was the alternative and was rejected: everywhere else in the
    code, "a category" specifically means "a set of vocabulary levels with words," and
    grammar levels have no words — nesting it in would have meant special-casing mastery
    counting, missed-words and SRS to *exclude* the fake category, which is more invasive
    than one more tab. Tab order: Vocabulary | Passages | Grammar | Strategy (quiz-based
    content grouped together, free read-only Strategy last).
  - **Quiz-only — no separate study/flashcard mode.** A grammar level is graded questions to
    answer, not words to review first, the same reasoning that gave passages no study mode.
  - **`scripts/validate-grammar.mjs`** (`npm run validate:grammar`), built the same way as
    `scripts/validate-passages.mjs` and for the same reason: catches what's mechanical
    (4 distinct options with exactly one designated correct answer, options that read like
    real sentences not stray words, the positional-language check, at least 3 distinct
    `type`s per category so it isn't 15 questions about the same rule, no two questions
    sharing a correct sentence). **It cannot tell whether the designated answer is actually
    the only grammatically defensible one** — that's the manual close-read, and it is not
    optional. That close-read found and fixed real issues the validator structurally cannot
    catch: one explanation calling a missing-comma-before-a-conjunction error a "run-on"
    (imprecise — a true run-on has no connector at all; fixed to name the error precisely
    instead).
- **Copy that changed with it:** `/unlock` lists "Reading passages (9)" and "Form, Structure,
  and Sense (15 questions)" under SAT Vocab; terms §4 names the free passage, the free
  grammar category, and the free guides; privacy §2 lists reading-passage and grammar-quiz
  results among what stays on the device. (Passages count updated and grammar added
  2026-09-22 — see "Reading passages" above for why the passage count moved from 5 to 10.)
- **Practice Test** (`lib/practiceTest.js`, `lib/practiceTestProgress.js`, route
  `/practice-test`, tab component `components/PracticeTestTab.js`, added 2026-09-23): a
  timed, simulated Reading & Writing section built entirely from the vocabulary/passage/
  grammar content that already exists — no new content was written for this feature, only a
  selection algorithm over the existing pools.
  - **Real format, verified before building, not assumed.** The Digital SAT's Reading &
    Writing section is 54 questions across two separately-timed 32-minute modules, 27
    questions each, no time transfer between modules (checked against the College Board's
    own spec and a current test-prep guide — re-verify this if the real test's format ever
    changes; adaptive per-module difficulty is real on the SAT but is **not** replicated
    here, this is a fixed-difficulty simulation of the shape, not the adaptivity).
  - **Selection is block-based, not question-based, so a passage's questions never split
    across modules.** A vocab word and a grammar question are each a 1-question block; a
    whole passage is one block carrying all of its questions together (each question still
    carries its own copy of the passage text, so it renders correctly wherever the block
    lands after shuffling). `pickBlocks()` targets ~12 passage questions and ~18 grammar
    questions (raised from ~8/~12 on 2026-09-24 — see "Transitions + Command of Evidence"),
    shuffled with a fresh-first/stale-fallback preference; vocabulary absorbs
    whatever's left so the total is always exactly 54 — this isn't a claim about the real
    test's own subdomain ratio (Voco's three pools don't map cleanly onto the SAT's), just a
    genuinely mixed composition of what this app actually has. All chosen blocks are
    shuffled together, then greedily packed into Module 1 up to exactly 27 questions; when a
    2-question passage block would overshoot the 27th slot, a single-question block is
    pulled forward to fill the gap instead and the passage block rolls into Module 2 — this
    guarantees an exact 27/27 split every time, verified by test across many seeds, not just
    typical-case checked.
  - **Decision — repeats are allowed once the pool is exhausted, and the UI says so.**
    Discussed with the owner, chosen over silently repeating or refusing to build a test:
    the full pool (355 questions as of 2026-09-27: 249 vocab + 46 passage-pool questions
    across 16 passages and 4 cross-text pairs + 60 grammar) is small enough that repeats
    are inevitable well before a learner would
    stop practicing. Measured, not guessed: across several consecutive attempts, vocabulary
    stays fresh the longest, but passages and grammar — much smaller pools — start recycling
    sooner. `usedIds` (every question id from every past attempt, via
    `getUsedQuestionIds()`) is preferred against; when a pool can't supply enough fresh
    content, previously-used questions fill the gap and `reusedCounts` reports exactly how
    many per pool, surfaced honestly on the intro screen ("This attempt reuses N questions
    from earlier practice tests...") rather than silently repeating. `TARGET_PASSAGE_QUESTIONS`
    was deliberately lowered from an initial 10 to 8 after measuring that 10 let a *second*
    attempt already need to reuse a whole passage — 8 bought roughly 2–3 fresh attempts before
    any passage repeats, a real, measured tradeoff, not an arbitrary constant. Raised to 12/18
    on 2026-09-24 (pools grew to 29/45) to preserve that same freshness ratio — see
    "Transitions + Command of Evidence." Raised again to 15/21 on 2026-09-27 (pools grew to
    46/60), this time NOT simply to preserve the ratio but chosen directly for domain balance,
    deliberately ending vocabulary's run as the single largest pool — see "The last four SAT
    domains" for that reasoning in full.
  - **Decision — entirely paid, no free attempt.** Unlike every other section here (one free
    category, one free passage, one free grammar category), Practice Test has no free
    sample. Reason: a genuinely mixed 54-question test needs the full pool; a free-only
    version would either have to leak paid category/passage/grammar content to non-subscribers
    or be built only from the free pool (about 59 questions total), which would be too thin
    to reuse-avoid for even one attempt and too vocab-skewed to be a real mixed test. Gated
    exactly like every other paid route: `/practice-test` shows nothing until subscription
    status is known (cached, then reconciled with Stripe), then redirects a non-subscriber to
    `/unlock`.
  - **Decision — a 5th tab, not folded into an existing one.** `getCourseSections()` already
    generalized to N optional sections; Practice Test is one more conditional entry (shown
    only when a course has both `passages` and `grammar`, since it draws from both). Tab
    order: Vocabulary | Passages | Grammar | Practice Test | Strategy — the four
    quiz/practice modes together, free read-only Strategy last.
  - **Per-module countdown, not one combined session timer**, matching the real test's own
    separately-timed modules and the "time doesn't transfer" mechanic. The end time is an
    absolute timestamp (`Date.now() + MODULE_DURATION_MS`) set once when a module begins and
    recomputed against `Date.now()` on every tick, rather than decremented — a background tab
    (where `setInterval` throttles) can't cause the displayed time to drift from the real
    deadline; when the real clock crosses it, the module submits automatically with whatever
    was answered, blanks included, no crash.
  - **Deliberate departure from the app's universal instant-feedback pattern: no
    correct/wrong marking during the test at all, revealed only at the results screen.**
    Every other quiz in this app marks each answer right or wrong immediately; Practice Test
    withholds that entirely while a module is in progress, matching the real test's blind
    answering experience, and only shows per-question correctness in the results screen's
    "Review your answers" list (correct answer, the learner's answer if wrong, explanation).
  - **Never implies a predicted SAT score** — same discipline as the sleep-science content
    elsewhere in this app. The results screen shows a raw score and a by-question-type
    breakdown only, with an explicit line ("A raw score, not a predicted SAT score.") on
    every tier of result copy, and the intro screen states the same thing before the test
    starts.
  - **Decision — tracked completely separately, like passages and grammar.**
    `lib/practiceTestProgress.js` (`voco_practice_tests_v1`, `PRACTICE_TESTS_KEY` in
    `lib/progress.js`; cleared by Reset) appends one record per completed attempt —
    `{completedAt, score, total, byType, questionIds, reused}` — never overwrites, so
    `getUsedQuestionIds()` can see every past attempt's questions. Doesn't touch spaced
    repetition, missed words, streaks, or milestones — verified by test (95 assertions in
    the selection/scoring/storage logic alone) and confirmed live: a fresh browser profile
    that completed two full attempts showed only `voco_practice_tests_v1` plus the
    subscription-cache keys in storage, nothing vocab-related created.
  - **A real bug, found live, not by any test — the same lesson as the passages/grammar
    positional-language issue, a different shape.** The first draft rendered
    `question.options` directly in their stored, correct-first order, so the correct answer
    was always the first button on screen — no unit test caught this because the selection
    and scoring logic were correct; only *looking at the rendered page* revealed the
    correct answer was suspiciously always in the same spot. Fixed with the same
    `shuffledIndices(4)` pattern every other quiz in this app already uses: a per-question
    `order` array re-shuffled on every question change, rendered via `order.map(idx => ...)`
    while `onSelect` still stores the underlying data index. **Lesson, worth repeating: a
    green test suite proves the data is right, not that the screen is right — anything that
    touches what's rendered in what order needs an actual look at the live page, every time.**
  - **Verified for real, not just in code**, per the owner's explicit request that auto-submit
    specifically not be faked by a manual submit standing in for a real clock expiry:
    `MODULE_DURATION_MS` was temporarily shrunk (first to 12s, then to 60s for a slower pass)
    to make genuine wall-clock expiry practical to observe, and reverted to the real
    `32 * 60 * 1000` immediately after, confirmed both in a clean `rm -rf .next && npm run
    build` and in the regression suite (`PASS 32-minute module timer`). With the shrunk
    timer: let Module 1's real clock hit zero twice with zero manual clicks (once fully
    blank, once with 3 of 27 answered) — both times it auto-submitted straight to the
    "Module 1 complete" transition screen, no crash on the unanswered questions; then did the
    same for Module 2 twice, reaching the real results screen both times purely from the
    clock, once so fast the tooling couldn't click before it fired. Deliberately answered 5
    questions across both modules with independently-reasoned right/wrong guesses (not
    reading any answer key) — the app's own score (3/54; vocab 2/34, grammar 1/12) and the
    "Review your answers" list matched every single prediction exactly, including which
    specific wrong answer was recorded for each miss. Also confirmed live: the option
    shuffle fix (correct answer lands in varying positions, not always first), a fresh
    profile's storage stays isolated after full attempts, and a second/third attempt's intro
    screen correctly says "Start a new practice test," lists prior attempts with accurate
    per-type breakdowns, and honestly discloses reused questions once the pool needs them.

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

## Analytics events (added 2026-10-05, with the owner's go-ahead)

Three custom Vercel Web Analytics events, all through `trackEvent()` in
`lib/analytics.js` (the only place `track()` is called — `test-first-visit` enforces it):

| Event | Fires when | Properties |
|---|---|---|
| `first_question_answered` | a first-time visitor answers the first-visit question (once per answer; right or wrong) | none |
| `keep_going_clicked` | they tap **Keep going** after answering | none |
| `trial_cta_clicked` | any start-trial link is tapped (all go through `components/TrialLink.js`) | `placement`: `first-visit`, `preview`, `unlock` or `unlock-error` — a fixed screen label, nothing about the person |

No cookies, no user or customer ids, nothing derived from progress. `placement` is the
one property, added so the three trial buttons can be compared; it is not personal data
and is easy to drop (delete the argument in `TrialLink`). Privacy §4 names these events;
if one is added, removed or given a property, Privacy has to change with it.
**Plan caveat — not confirmed:** Vercel documents custom events as available on Pro and
Enterprise plans (not Hobby), and Web Analytics must be enabled for the project. This could
not be checked from the build environment (no Vercel access), so confirm in the Vercel
dashboard before relying on the numbers; on a plan without custom events the calls are
harmless no-ops. In dev, `track()` only logs to the console. Custom events do not count
toward Vercel's bounce rate (a single-page-session measure), so they measure engagement but
cannot move that number — only a real second page view can.

## Content rules — these matter a lot, please follow them exactly

1. **Categories are organized per course's own logic — don't mix them.**
   **SAT Vocab is organized by function, not topic.** The real Digital
   SAT tests vocab through "Words in Context" questions that hinge on
   argumentative function (does this word support, refute, intensify,
   soften, describe tone, etc.) — not by theme like "science words" or
   "people words." Keep new SAT categories function-based, matching the
   existing pattern (Agreement & Support, Disagreement & Refutation, etc).
   **Everyday Vocabulary and Professional Vocabulary are organized by theme**
   (Everyday: Precise Description, Emotional Nuance, Persuasion & Influence;
   Professional: Meetings & Negotiation, Strategy & Decision-Making,
   Leadership & Workplace Dynamics) — the function-based structure was
   justified specifically by matching the real SAT's test format, which
   doesn't apply to a course with no exam behind it. Keep new Everyday
   categories theme-based, in groupings a curious general reader would
   recognize, and new Professional categories theme- and context-based, in
   groupings a working adult would recognize — neither an exam-prep
   structure. **Professional Vocabulary has one extra rule: every example and
   quiz sentence is set in a real workplace situation** (an email, a meeting,
   a negotiation, a review, a report), not in a generic voice — that setting
   is what distinguishes it from Everyday Vocabulary. (Rules 2–6 apply to every
   course.)

2. **Quiz format = fill-in-the-blank sentence, not "define this word."**
   Each `quiz` object has a `sentence` (a full sentence with `______` where
   the word goes), 4 `options`, a `correctIndex`, and an `explanation`. All
   4 options should be plausible at a glance — the correct one should be
   the only one that precisely fits the sentence's specific tone and logic,
   not just the only one that's a real English word.

3. **Distractor difficulty should escalate with level.** Foundational
   levels: distractors are clearly wrong (opposites/unrelated words) — easy
   to build confidence. Advanced levels: distractors are close, plausible
   near-synonyms — genuinely hard, matching real hard-tier SAT questions. SAT Vocab's
   Expert tier goes one step further: every option is a real near-synonym and the
   sentence must turn on one specific shade (strength, praise vs. criticism, how specific
   the word is). Expert words were cut whenever a second option was defensible — which is
   why its categories have 4–6 words rather than a fixed count.

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
   contains `______`, `correctIndex` is 0–3. For reading passages specifically,
   `npm run validate:passages` (`scripts/validate-passages.mjs`) is a real,
   committed script — run it, then still do the close read (see "SAT Vocab has
   three sections" above for why both are required).

## Content status

All 15 categories across all four courses are fully built: 537 words total. Most
categories have 3 levels of 12 Foundational / 12 Intermediate / 10 Advanced words; each
SAT Vocab category also has a 4th, optional **Expert** level. GRE Vocab's categories are
smaller (10/10/8) — see its entry below for why.

**SAT Vocab** (`sat-vocab`, `lib/wordbanks.js` + `lib/satExpertTier.js`) — 249 words (204
in the three original tiers + 45 Expert), plus 16 reading passages (`lib/satPassages.js`,
46 questions — `central-idea`/`inference`/`words-in-context` from the start,
`command-of-evidence` since 2026-09-24, `text-structure-purpose` and
`command-of-evidence-quantitative` since 2026-09-27), 4 cross-text pairs
(`lib/satCrossText.js`, added 2026-09-27, listed inside the same "Passages" tab), 4
strategy guides (`lib/satStrategy.js`), and 60 grammar questions across 4 categories
(`lib/satGrammar.js`: Boundaries, free — 15 questions; Form, Structure, and Sense, paid —
15 questions; Transitions, paid, added 2026-09-24 — 15 questions; Rhetorical Synthesis,
paid, added 2026-09-27 — 15 questions), shown together in the "Grammar & Usage" tab:
- ✅ `agreement-support` (free)
- ✅ `disagreement-refutation`
- ✅ `degree-intensity`
- ✅ `change-consequence`
- ✅ `certainty-doubt`
- ✅ `tone-attitude`

**Everyday Vocabulary** (`everyday-vocabulary`, `lib/everydayVocabulary.js`) —
102 words, started with 3 categories (more can be added once this batch has
proven itself, the same way the SAT course was built up):
- ✅ `precise-description` (free)
- ✅ `emotional-nuance`
- ✅ `persuasion-influence`

**Professional Vocabulary** (`professional-vocabulary`, `lib/professionalVocabulary.js`)
— 102 words, started with 3 categories the same way; every sentence set in a workplace
context:
- ✅ `meetings-negotiation` (free)
- ✅ `strategy-decisions`
- ✅ `leadership-workplace`

**GRE Vocab** (`gre-vocab`, `lib/greVocabulary.js`, added 2026-09-23) — 84 words, 3
categories of 28 (10 Foundational / 10 Intermediate / 8 Advanced each), every sentence
set in an academic/scholarly voice — essays, research, literary and historical
criticism:
- ✅ `positive-charge` (free)
- ✅ `negative-charge`
- ✅ `neutral-academic`

Smaller than the other courses' 102-word, 12/12/10 shape, deliberately: GRE-level
vocabulary has a much smaller pool of words that are simultaneously (a) genuinely
GRE-caliber, (b) distinct enough from every other word already in the 453-word library
at the time (SAT Vocab, Everyday and Professional between them already claim most of
the common upper-register words — `prudent`, `sanguine`, `laconic`, `cursory`,
`meticulous`, `ubiquitous` and dozens more were ruled out this way), and (c) not
near-duplicate roots of a word already used elsewhere (e.g. `laudable` was skipped
because `laud` was already a tracked SAT word). 28 well-chosen, cleanly-differentiated
words per category was the honest number at this difficulty; the same "quality over
hitting an exact word count" rule that gives SAT Vocab's categories their uneven Expert
tiers. Every candidate word was checked programmatically against the full existing
word list before being drafted, not just by memory.

Validated: no duplicate words anywhere in the library (within a category,
across categories, or across courses — a word appearing in two courses would
give it two spaced-repetition identities), every quiz has exactly 4 distinct
options with a `______` blank and a `correctIndex` of 0–3, one correct answer
that no distractor could also fill, and no `a`/`an` before the blank that
would give the answer away. An unbuilt category would have an empty
`levels: []` array, which makes its course page show it as "Coming soon" —
there are none of those left.

## File structure

```
app/
  layout.js              Root layout + metadata + Vercel Web Analytics
                         (@vercel/analytics/next — anonymous page views only,
                         no cookies, no identifying data; added 2026-09-22)
  page.js                Home screen, two layers: the unscoped daily-habit
                         cards (last night's words, tonight's study,
                         due-for-review, "still learning" across courses,
                         streaks), then a card per course
  courses/[courseId]/     One course's category list (locked cards, levels,
                         each category's own "still learning" card); for a
                         course with passages/guides, tabs above it
  passages/[passageId]/   One reading passage + its questions (SAT Vocab)
  cross-text/[pairId]/    Two related passages, stacked, + one or more
                         questions about how they relate (SAT Vocab, added
                         2026-09-27) — nearly identical to passages/
                         [passageId]/ otherwise; see "The last four SAT
                         domains"
  grammar/[levelId]/      One grammar level's questions (SAT Vocab) — same
                         multi-question flow as sets/[setId]/quiz, full-
                         sentence options rendered like passages'
  strategy/[guideId]/     One written strategy guide (free, ungated)
  practice-test/           Timed, simulated 54-question Reading & Writing
                         section (SAT Vocab) — mixes vocab/passage/grammar
                         content already in the app; paid only
  globals.css             Fonts + Tailwind + the results card's one-time
                         entrance animation
  review/                 Spaced-repetition review session (capped at 20)
  preview/[categoryId]/   One sample question from a locked category, with the
                         "$1.99/month for full access" prompt after answering
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
  CategoryList.js         A course's categories: levels, locked cards with the
                         sample-question link, per-category "still learning"
  CourseProgress.js       The per-course "X of N categories mastered · Y of M
                         levels completed" line (home cards + course page)
  PassageList.js          The Passages tab: cards, free/locked state, results,
                         "N of M passages completed"
  CrossTextList.js        A second block inside the same Passages tab, below
                         PassageList — Cross-Text Connections pairs, added
                         2026-09-27, mirroring PassageList's card layout and
                         gating exactly (same progress store)
  PassageCard.js          The passage title/subject/text card, extracted
                         2026-09-27 from passages/[passageId]/ so cross-text/
                         [pairId]/ can render two of them without duplicating
                         markup; also exports PassageText (the ______-blank
                         renderer)
  PassageChart.js         The table/bar-chart renderer for a command-of-
                         evidence-quantitative question (added 2026-09-27) —
                         plain HTML table or hand-rolled inline-SVG bars, no
                         charting library; dispatches on chart.kind
  GrammarList.js          The Grammar tab: categories and levels, quiz-only
                         (no study mode), locked-category card with price
  StrategyList.js         The Strategy tab: one card per guide
  PracticeTestTab.js      The Practice Test tab: format summary, locked
                         state, past-attempt history with per-type summaries
  CelebrationCard.js      The one celebration-card recipe (disc, label,
                         headline, figure, note) — score tiers AND milestones
  MilestoneCards.js       One-time milestone cards under the score card
  ShareButton.js          Trigger + dialog: share/copy/download the image
  FirstVisit.js           The first-visit home screen (headline, one real free
                         question, Keep going / trial link) + the course list
                         below it — see "First-visit screen instead of onboarding"
  TrialLink.js            The one component every start-trial link uses (counts
                         trial_cta_clicked); must sit beside TRIAL_TERMS
  StudyClose.js           Closing screen after "Done studying"
  ScienceNote.js          The permanent, quiet science footnote on the home
                         screen (one fact + its hedge; nothing interactive)
  NightThemeExplainer.js  Info icon by the logo + the dismissible "why the
                         night theme?" dialog (native <dialog>); tap-only —
                         it no longer opens by itself (removed 2026-10-05)
  QuizResults.js          End-of-quiz card shared by level quizzes,
                         missed-words sessions and review sessions —
                         one structure, recolored by score tier
lib/
  milestones.js           Milestone thresholds (mastery is per course),
                         once-only bookkeeping with legacy-id migration,
                         getCourseProgress(), and the card copy shared by the
                         in-app card and the image
  useLearnerState.js      Shared client hooks/helpers: subscription state
                         (cached, then reconciled), the first-visit onboarding
                         gate (useOnboarding), and per-category struggle counts
  shareCard.js            Canvas renderer for the shareable PNG
  preview.js              The one sample question per locked category
  sleepScience.js         The ONLY place sleep/memory claims are written
                         (see the accuracy rules in "Project context"):
                         the long-form SLEEP_SCIENCE sentences, the short
                         SCIENCE_FACTS (sleep + retrieval) and hedges, and
                         pickScienceFact() for the home note
  visitor.js              isReturningVisitor() (saved progress or cached
                         subscription on this device => returning) and
                         clearLegacyFlags() (tidies the removed onboarding /
                         explainer flags)
  preHydration.js         The inline <head> script: data-phase + data-returning
                         on <html> before first paint
  firstVisit.js           The first-visit question (Uphold) and its fixed
                         on-screen option order
  analytics.js            The three custom events + trackEvent() (the only
                         place track() is called)
  timeOfDay.js            Local-time phases (morning/midday/evening),
                         "last night's words", and "tonight's study" —
                         priority 1 finish an in-progress category
                         (momentum), priority 2 rotate to the least
                         recently touched course, never re-suggest an
                         already-mastered level
  timeTheme.js            NIGHT/DAWN palettes (+ THEME_CSS, the same palettes as
                         CSS variables for the first-visit screen) for every full-screen
                         learning activity (study, quiz, passages,
                         grammar, practice test, review) + getActivityTheme
                         (now) — see "Screens follow real time, not
                         activity type"; the ONLY place these hex values
                         should live
  scoreTier.js            Tier thresholds (100 / 70 / below) + colors,
                         shared by QuizResults and the home screen
  wordbanks.js            The `courses` layer (courses > categories > levels >
                         words), the SAT Vocab content, and the helpers that
                         work across every course (findLevel(),
                         getAllWordsFlat(), getCategoryCourse()), plus
                         getMissedWordsLevel() / getDueForReviewLevel() for
                         the dynamic study sets and getSetCategoryId() for
                         paywall gating
  satExpertTier.js        SAT Vocab's Expert level for each category (optional)
  satPassages.js          SAT reading passages (original writing): incl.
                         command-of-evidence questions since 2026-09-24, and
                         text-structure-purpose + command-of-evidence-
                         quantitative (the latter carrying `chart` data)
                         since 2026-09-27
  satCrossText.js         Cross-Text Connections pairs (added 2026-09-27) — a
                         different shape from satPassages.js (two texts, not
                         one), gated and tracked the same way regardless
  satStrategy.js          SAT test-day strategy guides + guideReadingMinutes()
  satGrammar.js           SAT Grammar & Usage tab — Boundaries + Form,
                         Structure, and Sense (Standard English Conventions)
                         plus Transitions (added 2026-09-24) and Rhetorical
                         Synthesis (added 2026-09-27, carries `notes`/`goal`)
                         (Expression of Ideas), each with its own 3-tier
                         levels (a separate tree from `categories`, not
                         vocabulary levels)
  satDomains.js           Reference only, not imported at runtime: the real
                         Digital SAT R&W's 4 official domains + weights,
                         verified against the College Board's own spec — see
                         "SAT domain accuracy audit"
  passageProgress.js      Per-passage results (voco_passages_v1) — separate
                         from vocabulary progress; since 2026-09-27, also
                         used as-is for Cross-Text Connections pairs
  grammarProgress.js      Per-grammar-level results (voco_grammar_v1) —
                         separate from vocabulary progress, mirrors
                         passageProgress.js
  practiceTest.js         Practice-test selection algorithm (block-based,
                         exact 27/27 module split) + scorePracticeTest()
  practiceTestProgress.js Per-attempt history (voco_practice_tests_v1) —
                         append-only, feeds repeat-avoidance across attempts
  everydayVocabulary.js   The Everyday Vocabulary course's categories
  professionalVocabulary.js The Professional Vocabulary course's categories
  progress.js             localStorage helpers: streaks, scores, and the
                         Leitner-system spaced repetition tracker
                         (REVIEW_SESSION_CAP lives here; PASSAGES_KEY,
                         GRAMMAR_KEY, PRACTICE_TESTS_KEY too)
  purchase.js              Subscription constants (incl. the free category,
                         free passage, and free grammar category in each
                         course) + localStorage helpers (voco_customer_id_v1,
                         voco_subscription_status_v1) — per-device only, see
                         "Paid unlock" above
scripts/
  validate-passages.mjs   `npm run validate:passages` — structural checks on
                         lib/satPassages.js AND lib/satCrossText.js (added
                         2026-09-27), incl. the positional-language check and
                         (since 2026-09-24) verbatim-quote and chart-shape
                         checks; does not replace the manual close read
  validate-grammar.mjs    `npm run validate:grammar` — the same, for
                         lib/satGrammar.js (built 2026-09-22)
  test-first-visit.mjs    `npm run test:first-visit` — the first-visit question,
                         visitor detection, the pre-paint script's agreement
                         with it, the copy lint, onboarding really gone,
                         analytics wiring (added 2026-10-05)
  loader-hooks.mjs / register-loader.mjs  Let plain Node import the app's own
                         extensionless/"@/" modules for that script
                         (`npm test` runs it with the two validators)
```

## Paid unlock — built and verified end-to-end on production, both in Stripe test mode and live

**Going live (Stripe live mode activated 2026-09-21).** Three things move together, and
getting only some of them is the failure that matters: (1) the live secret key in Vercel as
`STRIPE_SECRET_KEY`, **Production only** (Sensitive on) — Preview and Development keep a
`sk_test_` key, as does the gitignored `.env.local`; (2) `PAYMENT_LINK_URL` in
`lib/purchase.js`; (3) `EXPECTED_PAYMENT_LINK_ID` in `app/api/verify-subscription/route.js`.
`/api/verify-subscription` only unlocks a session whose `payment_link` equals that id, so a
live key with the old test id would take payment and never unlock. **Live** ids: Payment Link
`plink_1UIAT8HSW53IY9shBH3iARzX` (`buy.stripe.com/8x2cN57lk66C7zyf1scAo00`), price
`price_1UIAT4HSW53IY9shUejehPNY`, $1.99/month, 7-day trial, redirect
`https://voco.courses/unlock?session_id={CHECKOUT_SESSION_ID}` (all read back from the live
API, not assumed). The **test** ids described below are kept for history; the code no longer
points at them, so local/preview "Start free trial" now opens the live checkout — exercise
the subscription flow locally with the test key against the Stripe API instead. Live
Billing Portal settings are saved (per mode, separate from test).

**Verified live end-to-end on production (2026-09-22):** subscribed on `voco.courses` with a
real card via the live Payment Link — $0 charged (7-day trial), confirmed `trialing` in the
live Dashboard, every paid category unlocked. "Manage subscription" opened the real live
Billing Portal (not test); cancelling there left the subscription active with `cancelAt` set,
and the site showed the "ends on [date], you'll keep access until then" banner with access
still working, matching the test-mode behavior verified earlier.

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

The Stripe product's description was updated on 2026-09-20, when Everyday
Vocabulary became a second course, from "Full access to every SAT vocab
category, with spaced repetition review" to "Full access to every Voco course,
with spaced repetition review" (via the Stripe API; the price, Payment Link and
their ids are unchanged — there is still exactly one product and one price).

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
(we hold a customer id + subscription status, never card details), and
**cookieless Vercel Web Analytics plus the three anonymous events** (Privacy §1, §4, §5 — it
said "no analytics" from 2026-09-22 until 2026-10-05, which was wrong, and was corrected on
2026-10-05; if analytics changes again, Privacy needs updating to match, not just the code). Contact
email on both: `itsowentodd@icloud.com`. If the subscription price,
trial length, or free/paid category split ever changes, update the
Terms' "Subscription & Billing" section to match — don't let it drift
from `lib/purchase.js`. (Both pages were updated on 2026-09-20 for the
second course: one free category per course, and "the paid categories"
instead of a hardcoded count. Terms §2 and §4 were updated again for the third
course: §2 no longer names the courses, §4 lists each course's free category. On
2026-09-21, for SAT Vocab's passages and guides: §4 says the first reading passage and the
strategy guides are free and the remaining passages need the subscription; privacy §2 lists
reading-passage results among what is stored on the device.)
