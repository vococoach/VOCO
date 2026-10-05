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
  Each course has one free category, and only that category's **Foundational and
  Intermediate** tiers are free (the free set was narrowed on 2026-10-05 — see
  "The free set" below, which is the one place to read what's free; the
  definition itself lives once, at the top of `lib/purchase.js`). Everything
  else, in every course, requires an
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
    must say so.** Entitlement is a single boolean, `subscribed`; what it
    unlocks is decided per **tier** by `isLevelLocked(categoryId, levelNumber,
    subscribed)` (`lib/purchase.js`, see "The actual gate" below): open if
    subscribed, or if the level is tier 1–2 of a course's one free category
    (`isFreeCategory()`). `isCategoryLocked()` means only "this whole category
    is paid". There is no per-category or per-course purchase, and Stripe has
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
  - **The actual gate — by tier, not by category (changed 2026-10-05).**
    `isLevelLocked(categoryId, levelNumber, subscribed)` (`lib/purchase.js`) is
    the one rule: a level is open if the learner is subscribed, or if it is
    tier 1 or 2 of a free category. `/sets/[setId]/study` and `/quiz` look the
    level up with `findLevel()` and redirect to `/unlock` when it is locked,
    rendering nothing meanwhile (they return `null` until the cached-then-
    reconciled subscription state is known); a missed-words id is gated as a
    whole when its category is entirely paid, and otherwise by which of its
    *words* are open (see below). `isCategoryLocked()` now means only "this
    whole category is paid" (it is what picks the locked card over the level
    list on a course page); a free category is never "locked" at that level —
    two of its tiers are, and the course page shows each as its own locked card.
    This is the real enforcement; lock icons and prices are UI on top of it.
  - **Saved progress outlives the rules, so every list built from it is
    filtered** (`lib/access.js`; reversing the earlier "`/review` is left
    ungated" decision, whose premise — a word was studied, so its category was
    open then — stopped being true once the free set shrank, and was already
    false for lapsed subscribers). `/review`, the due-for-review study set, the
    per-category Missed Words sets, the home screen's due count and "still
    learning" rows, and their counts all go through `accessibleWordIds()` /
    `getAccessibleDueWordIds()`, which drop words from locked tiers
    **before** the 20-word cap (a locked word never takes a slot). Nothing is
    ever deleted: the records stay in `voco_word_srs_v1` and the words come
    back the moment the learner subscribes again. Tonight's study and Last
    night's words judge each level separately (`isLocked(categoryId, level)`),
    skip locked tiers, and `getTonight()` walks past an in-progress category
    whose only remaining levels are locked instead of stopping there. Milestones
    and share cards render numbers and course/category titles, never word or
    question content, so they needed no filtering; mastery milestones are
    untouched and a free learner simply cannot reach one (their Advanced tier is
    locked) — intended. `useSubscription()` now also returns `known`, so a
    screen that builds a list from saved progress waits for the cached state
    rather than briefly serving a subscriber the free-only list.
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
  tiers (a lapsed subscription would just bounce to `/unlock`), and
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
  and has hard accuracy rules.** The closing screen, the first-visit screen, the
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
  the customer id; derived, not a flag, so an old onboarding flag changes
  nothing. "Reset progress on this device" clears the progress keys but **not**
  the customer id or cached subscription, so an unsubscribed device becomes a
  first-time visitor again while a subscribed one stays "returning" — and stays
  unlocked). They see `components/FirstVisit.js` on the home screen: headline
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
  is painted in dawn colors on the first frame, and a returning device never has
  the first-visit view visible. **Returning devices see a loading state, not a
  blank screen (added 2026-10-05):** `components/HomeLoading.js` is in every page
  load's HTML but `display:none`; the same `data-returning` attribute that hides
  the first-visit view shows it (`html[data-returning] .vc-loading`), so it is
  painted from first paint and a new visitor never sees it (no JS-gated swap, so
  no flash). It is deliberately content-free — the Voco wordmark and grey
  placeholder shapes only; no greeting, count, streak, suggestion or course name,
  because every one of those depends on saved progress or the clock and could turn
  out wrong when the real home replaces it (`test-first-visit` enforces "Voco is
  the only text"). Its background is the home's own dark shell `#1A1C3A`, **not**
  the time-of-day palette: the real home is that colour at every hour (dawn only
  appears as a card inside it), so a dawn shell would flip colours at the swap.
  Same padding and widths as the real home so the swap doesn't jump; no info icon
  (inert, it would be a button that does nothing). The pulse animates opacity only
  (compositor-friendly, so it doesn't compete with hydration) and stops under
  `prefers-reduced-motion`. **Measured** (same profile as the speed numbers
  above, iPhone 13 emulation, ~Slow 3G + 6× CPU, 5 runs): a returning device's
  first contentful paint went from ~8.8 s (a blank dark screen from ~1.35 s until
  the home hydrated) to ~1.4 s; the home itself still arrives at ~8.7 s (unchanged
  — this adds a placeholder, it doesn't speed hydration, and it did not slow it);
  a new visitor still sees the question at ~1.35 s and never has the loading state
  visible (checked frame by frame and with a mutation observer).
  **`data-returning` is re-synced after hydration** (`setReturningAttribute()`,
  `lib/visitor.js`, via `syncReturning()` in `app/page.js`): before this, "Reset
  progress on this device" turned a returning device into a new visitor in React
  but left the attribute set, so the first-visit view stayed hidden and the screen
  went blank until a reload — a real bug on `main`, found while building this.
  Whenever React re-decides returning-or-not, the attribute follows.
  The only layout shift is 0.01 CLS, from the web font
  arriving. `/courses/[courseId]` shows its course immediately for a first
  visitor — it is a plausible landing page and has no gate any more.
  **Palette:** it follows the real time of day (dawn in the morning, night
  otherwise), like every learning screen. It adds one thing to the palettes:
  `subtextAA` (DAWN's subtext is ~3.4–4.0:1 on the dawn background; the darker plum
  is ~5.2:1), used by this screen only. Button text is `onAccent`, like everywhere —
  see "Contrast on dawn orange" below.
  **Fonts** load through `next/font` (self-hosted, preloaded, size-matched fallback) instead of a
  render-blocking Google Fonts `@import`; `lib/shareCard.js` reads the generated family names from
  the `--font-fraunces`/`--font-inter` variables so the share image uses the loaded fonts, and
  Fraunces keeps its optical-size axis. **Bounce:** Vercel counts a single-page session as a
  bounce and custom events do not count toward it; the design target is real engagement on the
  first screen (answer, "Keep going" into a second page), not splitting content across pages to
  move the number. The Lighthouse numbers behind these choices are in `CHANGELOG.md`.
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
  progress); the subscription cache is separate and survives. The cards are the
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
- **Try one real question in anything locked before paying**
  (`/preview/[id]`, `lib/preview.js`; a "Try a sample question" link on each
  locked card *beside* the price, which stays and still links to `/unlock`).
  One **fixed** question per locked thing: a wholly-paid vocabulary category
  (first word of its first level), a locked **tier** of a free category (first
  word of that tier — Advanced everywhere, plus SAT's Expert), a Grammar &
  Usage category (first question of its first level, with its notes/goal block
  for Rhetorical Synthesis), a reading passage (the passage and its first
  question, chart included), or a cross-text pair (both texts and the
  question). Since 2026-10-05 nothing in Passages or Grammar is free, so those
  tabs have no free taste of their own — the samples are what stand in for it.
  All ids are unique across the library (checked by `scripts/test-access.mjs`),
  so one route serves them all; the folder is still named `[categoryId]` from
  when it was categories only. In the real format, not a mockup (the page names
  the course), deliberately **unmetered**: no login, no tracking, no limit;
  revisiting shows the same question. It records nothing and grants nothing: the
  item stays locked and its real routes still redirect to `/unlock`. After
  answering, "$1.99/month for full access to every course" (the existing scope
  wording) with the start-trial button and "7 days free, then $1.99/month.
  Cancel anytime." beside it, plus "See what's included" → `/unlock`. Unknown
  ids, anything free, and already-subscribed visitors are redirected home. (All
  content ships in the client bundle regardless — the paywall is UI-level, per
  the notes above — so previews reveal nothing new.) The practice test has no
  sample: it is a test, not a category or tier.
- **The due-for-review card also has a Study option**, not just Review.
  `DUE_FOR_REVIEW_ID = "due-for-review"` (`lib/wordbanks.js`) special-cases
  `/sets/[setId]/study` the same way the per-category courses do, via
  `getDueForReviewLevel(dueWordIds)` — but pooled globally across every
  course and category (not per-category) and using the same priority order + cap as
  `/review`, so studying previews exactly what that quiz session will
  cover. `/review` is a separate route and the home screen's "Review" button
  still links there directly (it draws from the same access-filtered, capped
  list — see "Saved progress outlives the rules"); "Study" is the only new path.
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

**Entitlement: one free category per course — and, since 2026-10-05, only its first two
tiers.** See "The free set" below for the rule and the reason. When adding a course, give
it a free category in `FREE_CATEGORY_BY_COURSE` (`lib/purchase.js`) and the Terms
free-set text updates itself (it is computed); when adding a category, nothing else
changes. A free category's Advanced tier and SAT's Expert tier are locked (the gate is per
tier, `isLevelLocked()`); the other categories are wholly paid. Passages, cross-text pairs
and grammar have no free item at all now — see "SAT Vocab has five sections".

## The free set (narrowed 2026-10-05) — decided with the owner, don't re-litigate

**What a non-subscriber can open:** in each course, its one free category
(Agreement & Support, Precise Description, Meetings & Negotiation, Positive Charge) at
**Foundational and Intermediate only** — 8 levels, 92 words — plus the four SAT strategy
guides. **Everything else needs an active or trialing subscription:** every Advanced tier
(including those of the free categories), SAT's Expert tier, every other category in every
course, every reading passage (including *The Tide Pool Census*, which used to be free),
every cross-text pair, every Grammar & Usage category (including Boundaries, which used to
be free), and the practice test. Subscribers see no change. The definition is written
once, at the top of `lib/purchase.js` (`FREE_CATEGORY_BY_COURSE`, `FREE_TIER_NUMBERS`,
and the empty `FREE_PASSAGE_BY_COURSE` / `FREE_GRAMMAR_CATEGORY_BY_COURSE` that a future
free sample would be added to); tiers are identified by each level's own `level` number
(1 Foundational, 2 Intermediate, 3 Advanced, 4 SAT Expert), never by parsing ids.

**Why:** the old rule (one whole free category) let a learner finish a category's hardest
tier for free, i.e. see the best of what the subscription sells. Two tiers is still a real
taste — 24 words per course, with quizzes and spaced repetition — but leaves a clear next
step, and the point is to push visitors toward the $1.99 trial. Free learners can no
longer reach category mastery (it needs every required tier); that is intended and no
milestone rule changed.

**Where it's enforced** (all of it — a direct URL to anything locked redirects to
`/unlock` without rendering the content; checked in a real browser with a recorder of
every piece of text that ever appeared in the DOM, not just the final screen): the study
and quiz routes by tier; `/passages`, `/cross-text`, `/grammar` and `/practice-test` by
their own gates; the review/Missed Words/due-for-review pools and the home screen by
`lib/access.js` (see "The actual gate"). `scripts/test-access.mjs` (`npm run test:access`)
pins the whole definition level by level, the seeded-progress behavior (including 25
locked + 5 free due words → a 5-word session), the suggestion logic for free and paid
learners, that every locked category/tier/grammar category/passage/pair has a sample and
nothing free does, and the rendered Terms/Privacy text.

**Copy that follows from it, all computed from the data and this definition, never typed
by hand:** `/unlock` (counts, free categories, free tier labels, the locked-tier list per
course) and Terms §4 (the free and paid lists). Privacy and Terms were revised on
2026-10-05 together — see "Terms of Service & Privacy Policy".

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
(a throwaway script that was **not saved to the repo**, so it can't be re-run; it would need rewriting) that plays 45 consecutive
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
   gets none). Passages, cross-text pairs and grammar are gated by their own functions in
   `lib/purchase.js` (`isPassageLocked`, `isGrammarCategoryLocked`); there is no free
   one today (`FREE_PASSAGE_BY_COURSE` and `FREE_GRAMMAR_CATEGORY_BY_COURSE` are
   empty, add to them to give a course a free sample). See "SAT Vocab has five sections".
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

**Why it exists.** Each learning screen used to hardcode its palette by *screen type* (study always night; quiz, passages, grammar, review and preview always dawn; the practice test always dark), so someone quizzing at 9pm got a bright peach-and-cream screen — against the app's own premise. Only the home screen followed the clock. The full account is in `CHANGELOG.md`.

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

**Verification pattern:** load every learning screen fresh at morning 08:00, midday 14:00 and evening 21:00 using the `window.__setClock` real-`Date` override (jumping the system clock isn't an option) and confirm dawn only in the morning. Check a results card at night visually (the `deep`-vs-`accent` swap), not just by computed style. `scripts/browser/` holds the suites that do this.

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

## SAT Vocab has five sections — Vocabulary, Passages, Grammar & Usage, Practice Test, Strategy (Practice Test added 2026-09-23; Grammar renamed "Grammar & Usage" 2026-09-24 — see "SAT content coverage" and `CHANGELOG.md` below)

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
  `requiredLevels()`, not `category.levels`.** Every Expert level needs the subscription (only tiers 1–2 of a free
  category are free — see "The free set").
- **Reading passages** (`lib/satPassages.js`, route `/passages/[passageId]`): 16 original
  passages (grown from an initial 5 on 2026-09-22, then 10, then 11 on 2026-09-24, then 16
  on 2026-09-27), 1–4 questions each (100–150 words for a normal passage; 25–90 for a
  command-of-evidence-quantitative one, deliberately shorter since its chart carries the
  evidentiary weight — see "SAT content coverage" below (history in `CHANGELOG.md`)), a real mix of types —
  `central-idea`, `inference`, `words-in-context` (a `______` blank drawn from *inside* the
  passage), `command-of-evidence` (added 2026-09-24), and, since 2026-09-27,
  `text-structure-purpose` and `command-of-evidence-quantitative` (the latter carrying a
  `chart`, rendered by `components/PassageChart.js` — see "SAT content coverage" (history in `CHANGELOG.md`) for
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
- **Decision — no free passage (changed 2026-10-05; there used to be one).**
  `FREE_PASSAGE_BY_COURSE` is now empty, so `isPassageLocked()` is true for every
  passage for a non-subscriber; *The Tide Pool Census* was the free one and doubled as the
  free sample of the passage layout, so each locked passage now has a "Try a sample
  question" link (see the preview bullet). Gated exactly like the levels:
  `/passages/[passageId]` shows nothing until subscription status is known (cached, then
  reconciled), then redirects a non-subscriber to `/unlock`; the passage list shows locked
  cards with the price. As everywhere, this is UI-level gating — all content ships in the
  client bundle. Since 2026-09-27, **Cross-Text Connections pairs** (`lib/satCrossText.js`,
  route `/cross-text/[pairId]`) reuse this exact same gating function and the exact same
  `voco_passages_v1` progress store — see "SAT content coverage" below (history in `CHANGELOG.md`) for why a pair
  isn't its own separate system.
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
  placement decisions, and the content itself: see "SAT content coverage" and `CHANGELOG.md`. Each category's own
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
  - **Decision — no free grammar category (changed 2026-10-05; Boundaries used to be
    free).** `FREE_GRAMMAR_CATEGORY_BY_COURSE` is now empty, so every grammar category needs
    the subscription. Gated like vocabulary categories: the `/grammar/[levelId]` page
    shows nothing until subscription status is known (cached, then reconciled), then
    redirects a non-subscriber to `/unlock`; the grammar list on the course page shows a
    locked card with the price and a sample-question link for each category. UI-level
    gating, same as everywhere else — all content ships in the client bundle.
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
- **Copy that changed with it:** `/unlock` lists the locked passages, cross-text pairs and
  grammar categories (counts computed from the data, so they track the content), terms §4
  lists the paid ones, privacy §2 lists reading-passage and grammar-quiz results among what
  stays on the device. (Originally written 2026-09-22 when one passage and one grammar
  category were free; both are now paid — see "The free set".)
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
    questions (raised from ~8/~12 on 2026-09-24 — see "SAT content coverage" and `CHANGELOG.md`),
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
    "SAT content coverage" / `CHANGELOG.md`. Raised again to 15/21 on 2026-09-27 (pools grew to
    46/60), this time NOT simply to preserve the ratio but chosen directly for domain balance,
    deliberately ending vocabulary's run as the single largest pool — see "SAT content
    coverage" and `CHANGELOG.md` for that reasoning in full.
  - **Decision — entirely paid, no free attempt.** Practice Test never had a free attempt
    (and since 2026-10-05, with passages and grammar paid too, nothing else in SAT Vocab
    beyond a free category's first two tiers and the guides is free either). Reason: a genuinely mixed 54-question test needs the full pool; a free-only
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

## SAT content coverage — current state, and the rules that came out of building it

The history (the 2026-09-24 audit, then two build rounds, with measurements) is in
`CHANGELOG.md`. What still binds:

**Every real Digital SAT Reading & Writing sub-skill has content.** The reference is
`lib/satDomains.js` (`SAT_RW_DOMAINS`, checked against the College Board's own spec on
2026-09-24 — re-verify if the real test changes). Mapping:

| Real domain (weight) | Where it lives |
|---|---|
| Craft and Structure (28%) | vocab categories and passage `words-in-context` (Words in Context); passage `text-structure-purpose`; the 4 cross-text pairs (Cross-Text Connections) |
| Information and Ideas (26%) | passage `central-idea`, `inference`, `command-of-evidence`, `command-of-evidence-quantitative` |
| Standard English Conventions (26%) | Grammar & Usage: Boundaries; Form, Structure, and Sense |
| Expression of Ideas (20%) | Grammar & Usage: Transitions; Rhetorical Synthesis |

Each Grammar & Usage category's own `description` names its real domain, even though the
tab groups two domains together (the tab was renamed from "Grammar" for exactly that
reason — don't fold a new category in under a label that mislabels it).

**Question shapes and what each needs from code**
- Passage questions: `{ type, prompt, options: [4, correct first], correctIndex: 0, explanation }`.
  A `command-of-evidence` option must be a verbatim quote from the passage
  (`validate:passages` checks it). A `command-of-evidence-quantitative` question carries a
  `chart` on the *question* (rendered by `components/PassageChart.js`: a plain table or a
  hand-rolled SVG bar chart, no charting library; bars are horizontal so labels never rotate
  on a phone), and its passage is deliberately short (25–90 words) because the chart carries
  the evidence.
- Cross-text pairs (`lib/satCrossText.js`, `/cross-text/[pairId]`): two short texts shown
  stacked and both visible while answering (`components/PassageCard.js` renders each), listed
  inside the Passages tab, tracked in the **same** store as passages (`voco_passages_v1`;
  pair ids are namespaced `xt-…` and checked not to collide).
- Rhetorical Synthesis grammar questions add two optional fields, `notes: string[]` and
  `goal: string`; `/grammar/[levelId]` renders them above the prompt when present.
- **Any new question field must be passed through `lib/practiceTest.js`** (`passageBlock()`,
  `grammarBlock()`, `crossTextBlock()`). Twice a field (`notes`/`goal`, `chart`) rendered
  correctly on its own page but vanished inside the practice test, making the question
  unanswerable — found only by looking at a real practice-test run, not by any test.
  `test:practice` checks the selection logic, not field pass-through.

**Practice-test composition.** Targets `TARGET_PASSAGE_QUESTIONS` = 15 and
`TARGET_GRAMMAR_QUESTIONS` = 21 (`lib/practiceTest.js`, with the reasoning in its comments);
vocabulary fills the remaining slots to exactly 54. They were chosen for domain balance, not
pool freshness, and **vocabulary is deliberately not the single largest pool** — there is no
target that gets all four domains near their real weights *and* keeps vocabulary largest.
Craft and Structure will always over-represent while vocabulary (100% Craft and Structure) is
a big share. When a pool grows, re-measure with a simulation of many tests mapped to real
domains rather than guessing. The measured mix after the last retune was Craft and
Structure ~42%, Information and Ideas ~19%, Standard English Conventions ~20%, Expression
of Ideas ~19% (CHANGELOG has the before/after table). The measurement script was never
saved to the repo; `scripts/test-practice-test.mjs` covers the selection invariants (54
questions, exact 27/27 split, passages never split, repeats only when the pool is
exhausted) but not domain balance.

**Validate content two ways, always.** `npm run validate:passages` and
`npm run validate:grammar` catch the mechanical half (structure, positional wording,
verbatim quotes, type variety). They cannot tell whether the designated answer is the *only*
defensible one — the close read of every new item is not optional. Things the close read has
caught that no script can: two quotations that both supported the same claim; a distractor
that was also defensible (`Champion` vs `Advocate`); a transition question whose second clause
made two connectors plausible. Write explanations content-first ("the choice that…"), never by
position — options are shuffled on screen, and this shipped wrong more than once.


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
   five sections" above for why both are required). Vocabulary content has the same:
   `npm run validate:vocab` (`scripts/validate-vocab.mjs`).

## Content status

All 15 categories across all four courses are fully built: 537 words total. Most
categories have 3 levels of 12 Foundational / 12 Intermediate / 10 Advanced words; each
SAT Vocab category also has a 4th, optional **Expert** level. GRE Vocab's categories are
smaller (10/10/8) — see its entry below for why.

**SAT Vocab** (`sat-vocab`, `lib/wordbanks.js` + `lib/satExpertTier.js`) — 249 words (204
in the three original tiers + 45 Expert), plus 16 reading passages (`lib/satPassages.js`,
46 questions in the practice pool counting the 4 cross-text pairs (42 passage questions + 4 pair questions) — `central-idea`/`inference`/`words-in-context` from the start,
`command-of-evidence` since 2026-09-24, `text-structure-purpose` and
`command-of-evidence-quantitative` since 2026-09-27), 4 cross-text pairs
(`lib/satCrossText.js`, added 2026-09-27, listed inside the same "Passages" tab), 4
strategy guides (`lib/satStrategy.js`), and 60 grammar questions across 4 categories
(`lib/satGrammar.js`: Boundaries — 15 questions; Form, Structure, and Sense, 15 questions; Transitions, added 2026-09-24 — 15 questions; Rhetorical Synthesis,
paid, added 2026-09-27 — 15 questions), shown together in the "Grammar & Usage" tab:
- ✅ `agreement-support` (the course's free category: tiers 1–2 only)
- ✅ `disagreement-refutation`
- ✅ `degree-intensity`
- ✅ `change-consequence`
- ✅ `certainty-doubt`
- ✅ `tone-attitude`

**Everyday Vocabulary** (`everyday-vocabulary`, `lib/everydayVocabulary.js`) —
102 words, started with 3 categories (more can be added once this batch has
proven itself, the same way the SAT course was built up):
- ✅ `precise-description` (free category: tiers 1–2 only)
- ✅ `emotional-nuance`
- ✅ `persuasion-influence`

**Professional Vocabulary** (`professional-vocabulary`, `lib/professionalVocabulary.js`)
— 102 words, started with 3 categories the same way; every sentence set in a workplace
context:
- ✅ `meetings-negotiation` (free category: tiers 1–2 only)
- ✅ `strategy-decisions`
- ✅ `leadership-workplace`

**GRE Vocab** (`gre-vocab`, `lib/greVocabulary.js`, added 2026-09-23) — 84 words, 3
categories of 28 (10 Foundational / 10 Intermediate / 8 Advanced each), every sentence
set in an academic/scholarly voice — essays, research, literary and historical
criticism:
- ✅ `positive-charge` (free category: tiers 1–2 only)
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
                         [passageId]/ otherwise; see "SAT content
                         coverage"
  grammar/[levelId]/      One grammar level's questions (SAT Vocab) — same
                         multi-question flow as sets/[setId]/quiz, full-
                         sentence options rendered like passages'
  strategy/[guideId]/     One written strategy guide (free, ungated)
  practice-test/           Timed, simulated 54-question Reading & Writing
                         section (SAT Vocab) — mixes vocab/passage/grammar
                         content already in the app; paid only
  globals.css             Tailwind, the first-visit/loading CSS (.vc-first,
                         .vc-loading) and the results card's one-time
                         entrance animation (fonts come from next/font in layout.js)
  review/                 Spaced-repetition review session (capped at 20)
  preview/[categoryId]/   One sample question from any locked item (category,
                         tier, grammar category, passage or pair), with the
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
                         the home and first-visit screen footers
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
  HomeLoading.js          The content-free loading state a returning device sees
                         from first paint until the home hydrates (CSS-shown by
                         data-returning; never visible to a new visitor)
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
                         (cached, then reconciled, plus `known`), and
                         per-category struggle counts (the onboarding gate
                         is gone — see "First-visit screen")
  shareCard.js            Canvas renderer for the shareable PNG
  preview.js              The one fixed sample question per locked item (category,
                         tier, grammar category, passage, cross-text pair)
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
                         on <html> before first paint (the attribute is kept in
                         step afterwards by setReturningAttribute in visitor.js)
  firstVisit.js           The first-visit question (Uphold) and its fixed
                         on-screen option order
  analytics.js            The three custom events + trackEvent() (the only
                         place track() is called)
  access.js               Subscription-aware views of the due / still-learning
                         word lists (drop words from locked tiers before the
                         review cap); see "The actual gate"
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
                         `CHANGELOG.md` (the 2026-09-24 audit)
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
  purchase.js              Subscription constants and the free-set definition
                         (free category + tiers per course; the free-passage
                         and free-grammar tables, both empty today) + localStorage helpers (voco_customer_id_v1,
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
  test-access.mjs         `npm run test:access` — the free set tier by tier,
                         seeded-progress filtering, suggestions, samples,
                         route wiring, rendered Terms/Privacy (added 2026-10-05)
  validate-vocab.mjs      `npm run validate:vocab` — every word in every course: 4
                         distinct options, one blank, correctIndex, no a/an
                         giveaway, no positional wording, no duplicate words or
                         sentences (does not replace the close read)
  test-practice-test.mjs  `npm run test:practice` — 54 questions, exact 27/27
                         split, passages never split, repeat rules, scoring
  browser/                Real-Chromium suites (verify1–3, contrast) against a
                         running build; need `npm i --no-save playwright-core` and
                         BASE_URL — see browser/_env.mjs. `npm run test:browser`.
                         NOT part of `npm test`.
  loader-hooks.mjs / register-loader.mjs  Let plain Node import the app's own
                         extensionless/"@/" modules (and next/server) for the
                         scripts above (`npm test` runs every non-browser script)
```

## Paid unlock — live ids, what was verified, and the gotchas (test-mode history in CHANGELOG.md)

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

The original test-mode build (test ids, the step-by-step cancellation and Billing Portal verification) is in `CHANGELOG.md`.

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
`app/privacy/page.js`), linked from the home screen footer and the first-visit
screen — not files sitting unused. Content is written to match how the app actually
works, not generic boilerplate: no accounts, progress lives only in
`localStorage` on-device (explicitly *not* synced or backed up, and lost
on a cleared browser or new device), billing handled entirely by Stripe
(we hold a customer id + subscription status, never card details), and
**cookieless Vercel Web Analytics plus the three anonymous events** (Privacy §1, §4, §5 — it
said "no analytics" from 2026-09-22 until 2026-10-05, which was wrong, and was fixed). Contact
email on both: `itsowentodd@icloud.com`. Both were revised on **2026-10-05** ("Last updated
October 5, 2026"):
- **Terms §4** lists what is free and what needs a subscription — **computed from the data and
  `lib/purchase.js`**, so it cannot drift (`test-access` checks the rendered text): the four free
  categories by course, "only the Foundational and Intermediate levels are free", the strategy
  guides, and the paid list (Advanced and Expert tiers of the free categories, every other
  category, all passages and cross-text pairs, the four Grammar & Usage categories, the practice
  test). It also states price and trial, that cancelling before the trial ends means no charge,
  that the trial converts automatically and then **renews monthly until cancelled**, and an **age /
  parental-permission** line (18+, or a parent or guardian subscribes). Privacy §6 points to it.
- **Terms §5** now leads with the in-app **Manage subscription** route (Stripe's Billing Portal)
  on the device that subscribed, then email, and says access continues to the end of the period
  already started.
- **Not decided here — owner's call, flagged rather than invented:** (1) **a refund policy** (neither
  page says anything about refunds; what Stripe is configured to do is outside this repo);
  (2) whether Stripe actually sends the receipt/management email Terms used to promise (a $0
  trial may produce no receipt, so §5 now says such an email "may" include a link instead of
  promising one); (3) the age line is plain-language, not counsel-reviewed, and COPPA/age-of-
  consent questions for a product used by many under-18s are for a lawyer; (4) the exact wording
  about Vercel's analytics should be checked against Vercel's current docs. If the price, trial
  length or free/paid split ever changes, Terms follows the code automatically for the lists but
  the prose around them (trial, renewal, age) is hand-written — keep it matching `lib/purchase.js`.
