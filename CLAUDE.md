# Voco — Project Context

A vocabulary-learning platform. Study before bed, quiz yourself whenever you're ready.
Voco has multiple courses under one subscription — **SAT Vocab** (the original
course, matched to the Digital SAT), **Everyday Vocabulary** (general audience, no
exam) and **Professional Vocabulary** (working adults, set in real workplace
situations) — see "Courses" below. Read this file before making changes — it captures
decisions already made, so they shouldn't be re-litigated or silently changed.

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
- **Vercel Web Analytics only, and it must stay that way.** `<Analytics />`
  from `@vercel/analytics/next` in `app/layout.js` (added 2026-09-22) gives
  aggregate, anonymous page-view counts — no cookies, no per-visitor
  identifiers, nothing that connects a page view to a customer id or any
  other data this app holds. That's a deliberate constraint matching the
  no-accounts architecture above, not an oversight: don't add event
  properties, user ids, or a second analytics tool that would start
  identifying visitors without discussing it first. In dev it logs to the
  console instead of sending anything ("Debug mode is enabled by default in
  development"); it only reports to Vercel on a real deploy, and needs Web
  Analytics turned on for the project in the Vercel dashboard to collect
  there.
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
  night/dawn look is the app's premise made visible (study = night blues,
  quiz = warm dawn), so the home screen follows the learner's **local
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
  **It also auto-opens once per fresh browser session** (added 2026-09-22,
  `lib/nightThemeExplainer.js`, `voco_night_theme_seen_session_v1`,
  `sessionStorage` — not `localStorage`): a new tab/window opening the site
  shows it once, but navigating around (or reloading) within that same tab
  doesn't show it again, because it's marked seen the moment it auto-opens,
  not on dismiss. **Deliberate tradeoff, discussed with the owner:** before
  this it only ever opened by tapping the icon, with no auto-show at all —
  content this useful for framing the app's premise was easy to never
  discover. A once-ever auto-show (mirroring onboarding) was considered and
  rejected: it would only ever help the very first session, and the value of
  "why the night theme?" doesn't expire after one viewing the way a guided
  tour does. Per-session repetition was chosen over that, accepting the
  minor repeat-visit friction as worth it for the explainer actually being
  seen again. The manual tap-to-open icon is unchanged and always available
  regardless of the session flag. On a brand-new visitor's very first
  session, `finishOnboarding()` (`lib/useLearnerState.js`) also marks this
  session as seen, since the onboarding they just finished already covers
  the same rationale — without that, the explainer would auto-pop
  immediately on top of the intro that just closed. Their *next* fresh
  session (a later visit) shows it normally. Not cleared by "Reset progress
  on this device" — `sessionStorage` isn't touched by `resetProgress()`
  (`localStorage`-only) and clears itself when the tab closes regardless.
  **Leave `components/ScienceNote.js` (the permanent, always-on footnote,
  below) out of this — it's a separate feature and wasn't touched.**
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
- **First-visit onboarding: two skippable screens, shown once**
  (`components/Onboarding.js`, gated by the shared `useOnboarding()` hook in
  `lib/useLearnerState.js`, used by both `app/page.js` and
  `app/courses/[courseId]/page.js`). The one-time flag is
  its own localStorage key, `voco_onboarded_v1` (`lib/onboarding.js`) —
  deliberately **not** derived from progress data, and **not** cleared by
  "Reset progress on this device", so resetting or an empty progress store
  never re-triggers it. (Consequence: everyone who used the app before it
  shipped sees it once too.) Those two pages are server-rendered with
  `invisible` on `<main>` until the client has read the flag, so a
  first-timer never glimpses the page first (verified by comparing browser
  first-paint time with the DOM state: nothing but the intro is ever painted).
  If localStorage is blocked it is skipped rather than shown on every visit.
  **A course page can be a visitor's first page** (a shared/bookmarked link),
  so it shows the intro too — and because finishing just re-renders the page in
  place, they then land on the course they came for, not the home screen. An
  unknown course id redirects to `/`, which shows the intro. **Only those two
  pages gate**: a deep link into `/sets/...`, `/preview/...`, `/review`,
  `/unlock`, `/terms` or `/privacy` does not show the intro (same as before
  courses existed). If another page becomes a plausible first landing spot, use
  the same hook rather than copying the logic.
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
  SAT Vocab 1/3/6, Everyday Vocabulary and Professional Vocabulary 1/3; a category is mastered once
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
Precise Description (Everyday Vocabulary) and Meetings & Negotiation (Professional
Vocabulary); each is its course's first category. Everything else, in every course, is
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

**"Tonight's study" has no default course, on purpose.** `getTonight(courses, …)`:
(1) `done` if a level was studied since 18:00, as before; (2) otherwise `suggest`s the
first unstudied *unlocked* level (course order, then category order) in the course
studied **most recently** — so the suggestion follows what the learner is working
through, and a legacy SAT learner keeps getting SAT; (3) if nothing has been started
(or every started course has nothing left unlocked), `choose`: a "pick a course"
prompt listing the unstarted courses, with no course pre-selected — the decision was
explicit that the app must not guess which course a brand-new learner wants. "Started"
means a level was *studied* (a quiz alone doesn't count). Everything unlocked studied →
revisit the level studied longest ago. Locked levels are never suggested, and neither are
`optional` levels (SAT Vocab's Expert tier is something you choose to go for, not
something the app nudges you into) — though studying one still counts as "tonight's study
is done".

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

**Milestones and share cards are course-aware** (see the milestones bullet above);
sample-question previews work per locked category in any course and name the course.

**Adding a course** — what it really takes (the third course tested the claim that this
is "close to a one-line change"; the *code* is generic — nothing indexes into `courses`
or assumes a count — but registration is not literally one line, and three things were
not generic):
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
   script can't catch (a dozen were rewritten for Everyday, three for Professional).
6. **Optional extra sections.** A course may also define `passages` and/or `guides`; if it
   does, `getCourseSections()` gives its page tabs automatically (a course with neither
   gets none). Passages need a free one in `FREE_PASSAGE_BY_COURSE` and their own gating;
   see "SAT Vocab has three sections".
7. **Then test for real:** the course on the home selector, a free-category preview and
   a locked one, a real mastery card and its share image (render the longest category
   title), the daily cards pulling words from every course, and a subscription unlocking
   every locked category across all courses.

## SAT Vocab has five sections — Vocabulary, Passages, Grammar, Practice Test, Strategy (Practice Test added 2026-09-23)

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
- **Reading passages** (`lib/satPassages.js`, route `/passages/[passageId]`): 10 original
  passages (grown from an initial 5 on 2026-09-22), 100–150 words, 1–2 questions each, a
  real mix of types — `central-idea`, `inference` and `words-in-context` (a `______` blank
  drawn from *inside* the passage — the same mechanic as the vocabulary quizzes). No
  passage repeats a question type, and across the library no one type is allowed to
  dominate (each of the 3 must appear at least 3 times and none may exceed 60% of the
  total — a proportional version of the original "none more than 5" check, updated when 5
  passages became 10; re-check this if the library grows again). **Originality is the rule
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
  four need the subscription. Gated exactly like the levels: `/passages/[passageId]` shows
  nothing until subscription status is known (cached, then reconciled), then redirects a
  non-subscriber to `/unlock`; the passage list shows locked cards with the price. As
  everywhere, this is UI-level gating — all content ships in the client bundle.
- **Test-day strategy guides** (`lib/satStrategy.js`, route `/strategy/[guideId]`): four
  short written guides (words-in-context routine, pacing, common traps, unknown words) —
  **free to everyone, no gate, nothing recorded**. Written as `blocks` (heading, paragraph,
  list, steps, example). They state Digital SAT format facts (module length, question
  count, no guessing penalty, the timer/flag tools) *as of when written* and send readers to
  the College Board for current details, plus a "not affiliated with the College Board"
  line — formats change, so re-check those sentences if the test does.
- **Test-day strategy guides** (`lib/satStrategy.js`, route `/strategy/[guideId]`): four
  short written guides (words-in-context routine, pacing, common traps, unknown words) —
  **free to everyone, no gate, nothing recorded**. Written as `blocks` (heading, paragraph,
  list, steps, example). They state Digital SAT format facts (module length, question
  count, no guessing penalty, the timer/flag tools) *as of when written* and send readers to
  the College Board for current details, plus a "not affiliated with the College Board"
  line — formats change, so re-check those sentences if the test does.
- **Grammar & Standard English Conventions** (`lib/satGrammar.js`, route
  `/grammar/[levelId]`, added 2026-09-22): the Digital SAT's *other* major Reading & Writing
  domain, alongside Words in Context — correct sentence construction, not word meaning.
  Organized around the two real College Board subdomains, not invented ones: **Boundaries**
  (punctuation and sentence boundaries — commas, semicolons, colons, run-ons, fragments) and
  **Form, Structure, and Sense** (subject-verb agreement, pronoun agreement and case, verb
  tense/mood, parallel structure, modifier placement). A third plausible category,
  transitions/logical connectors, was deliberately left out — it belongs to the Digital
  SAT's *other* domain, Expression of Ideas, not Standard English Conventions, and adding it
  here would have been miscategorizing rather than organizing around what's real.
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
    lands after shuffling). `pickBlocks()` targets ~8 passage questions and ~12 grammar
    questions, shuffled with a fresh-first/stale-fallback preference; vocabulary absorbs
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
    the full pool is small enough (298 questions: 249 vocab + 19 passage across 10 passages
    + 30 grammar) that repeats are inevitable well before a learner would stop practicing.
    Measured, not guessed: across 8 consecutive attempts, vocabulary stays fresh for roughly
    7 attempts, but passages and grammar — much smaller pools — start recycling from about
    the 3rd–4th attempt on. `usedIds` (every question id from every past attempt, via
    `getUsedQuestionIds()`) is preferred against; when a pool can't supply enough fresh
    content, previously-used questions fill the gap and `reusedCounts` reports exactly how
    many per pool, surfaced honestly on the intro screen ("This attempt reuses N questions
    from earlier practice tests...") rather than silently repeating. `TARGET_PASSAGE_QUESTIONS`
    was deliberately lowered from an initial 10 to 8 after measuring that 10 let a *second*
    attempt already need to reuse a whole passage — 8 buys roughly 2–3 fresh attempts before
    any passage repeats, a real, measured tradeoff, not an arbitrary constant.
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

All 12 categories across all three courses are fully built: 453 words total. Each
category has 3 levels (12 Foundational / 12 Intermediate / 10 Advanced); each SAT Vocab
category also has a 4th, optional **Expert** level.

**SAT Vocab** (`sat-vocab`, `lib/wordbanks.js` + `lib/satExpertTier.js`) — 249 words (204
in the three original tiers + 45 Expert), plus 10 reading passages
(`lib/satPassages.js`), 4 strategy guides (`lib/satStrategy.js`), and 30 grammar questions
across 2 categories (`lib/satGrammar.js`: Boundaries, free — 15 questions; Form, Structure,
and Sense, paid — 15 questions):
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
  GrammarList.js          The Grammar tab: categories and levels, quiz-only
                         (no study mode), locked-category card with price
  StrategyList.js         The Strategy tab: one card per guide
  PracticeTestTab.js      The Practice Test tab: format summary, locked
                         state, past-attempt history with per-type summaries
  CelebrationCard.js      The one celebration-card recipe (disc, label,
                         headline, figure, note) — score tiers AND milestones
  MilestoneCards.js       One-time milestone cards under the score card
  ShareButton.js          Trigger + dialog: share/copy/download the image
  Onboarding.js           First-visit onboarding (2 skippable screens)
  StudyClose.js           Closing screen after "Done studying"
  ScienceNote.js          The permanent, quiet science footnote on the home
                         screen (one fact + its hedge; nothing interactive)
  NightThemeExplainer.js  Info icon by the logo + the dismissible "why the
                         night theme?" dialog (native <dialog>); also
                         auto-opens once per fresh session (lib/
                         nightThemeExplainer.js) — see "The home screen
                         is time-aware" above
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
  onboarding.js           The one-time "seen onboarding" flag
  nightThemeExplainer.js  The "seen the explainer this session?" flag
                         (sessionStorage, not localStorage — resets every
                         fresh tab, unlike onboarding.js above)
  timeOfDay.js            Local-time phases (morning/midday/evening) and the
                         "last night's words" / "tonight's study" selection
                         for the home screen
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
  satPassages.js          SAT reading passages (original writing)
  satStrategy.js          SAT test-day strategy guides + guideReadingMinutes()
  satGrammar.js           SAT Grammar & Standard English Conventions —
                         Boundaries + Form, Structure, and Sense categories,
                         each with its own 3-tier levels (a separate tree from
                         `categories`, not vocabulary levels)
  passageProgress.js      Per-passage results (voco_passages_v1) — separate
                         from vocabulary progress
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
                         lib/satPassages.js, incl. the positional-language
                         check; does not replace the manual close read
  validate-grammar.mjs    `npm run validate:grammar` — the same, for
                         lib/satGrammar.js (built 2026-09-22)
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
(we hold a customer id + subscription status, never card details), no
analytics/tracking of any kind (true as of this writing — if that ever
changes, both pages need updating to match, not just the code). Contact
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
