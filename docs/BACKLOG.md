# Voco backlog

The order is the priority. Every item ends with one line that says when it is done.
Last updated 2 November 2026, against `main` at `60deb65`.

## Item 3 findings: the SAT mark, the College Board notice and borrowed wording

This was a read-only audit. Nothing in the app changed. I built `main` and opened every route in
a browser: first as a new visitor with no subscription, then with a fake local subscription to
reach the paid pages. I searched the source for the whole word "SAT", the ® sign and "College
Board", and listed the question stems in every SAT content file. The rules being checked are the
ones in "Working rules" in `CLAUDE.md`: the College Board notice on every page that shows the
mark, and "SAT" only as an adjective.

### Where the app shows "SAT"

The ® sign appears in one place only: inside the notice (`TRADEMARK_NOTICE` in `lib/legal.js`).
So "yes" in the last column means the notice and the ® are both on that page.

| Where | What it shows | Notice and ® |
|---|---|---|
| Home, first visit (`/`) | The promise "SAT vocabulary you study before bed and get quizzed on the next day." The card title "SAT Vocab". The card text "...matched to the Digital SAT's Words in Context questions..." | Yes |
| Home, returning visitor | "SAT Vocab" and the tagline "Words in context for the Digital SAT." | Yes |
| `/unlock` | "Unlock SAT Vocab" and "full access to SAT Vocab" twice | Yes |
| `/terms` | The notice in section 2, then "SAT Vocab" five times and "any specific SAT administration" | Yes |
| Course page (`/courses/sat-vocab`), all five tabs | The title "SAT Vocab", the tagline, "Full access to SAT Vocab" in the paywall card, and "Not a predicted SAT score." on the practice test tab | **No** |
| Strategy guides (4 pages) | The header "SAT Vocab · Strategy". The pacing guide also says "the Digital SAT's Reading and Writing section". Two guides (words in context, unknown word) add a plain sentence that Voco is not affiliated with the College Board | **No** (that sentence is not the notice) |
| Sample question page (`/preview/<category>`) | "One real question from SAT Vocab", "full access to SAT Vocab" and "unlocks all of SAT Vocab" | **No** |
| `/practice-test` | "isn't a predicted SAT score" in the intro. The results notes repeat it (read in the code, not rendered) | **No** |
| `/privacy` | "includes SAT vocabulary" | **No** |
| Share image and share text for a mastery milestone | Read in the code, not drawn. The image says "SAT VOCAB MASTERY", "Every SAT Vocab category mastered." and "That's all of SAT Vocab." The share text says "N of 6 SAT Vocab categories mastered on Voco." | **No** |
| Every page head, `public/manifest.webmanifest` and `public/og.jpg` | The promise line, in the description, in the link preview text and alt text, and drawn in the preview picture | **No** (these cannot carry a footer) |

No "SAT" shows on how it works, review, study, quiz, passage, cross-text or grammar level pages.

Two more places are in the code but on no screen today:

- `lib/firstVisit.js` builds a line like "Two courses: SAT · Everyday" once a second course is
  live. That would show "SAT" alone, as a noun.
- The grammar category descriptions in `lib/satGrammar.js` say "Digital SAT domain". Nothing
  renders them.

### Gaps against the rules

1. **No notice and no ®** on the course page, the strategy guides, the sample question page, the
   practice test, the privacy page, and the share image and text.
2. **Link previews and search.** The page head, the manifest and `public/og.jpg` show "SAT" and
   cannot carry a footer. Decide: reword the line so it does not use the mark, or accept it there.
3. **"SAT" as a noun.** The tagline "Words in context for the Digital SAT." (`lib/wordbanks.js`,
   shown on the returning home and the course page). The card text "...the Digital SAT's Words in
   Context questions..." (`lib/wordbanks.js`, shown on the first-visit home). The pacing guide
   line "the Digital SAT's Reading and Writing section." (`lib/satStrategy.js`). Everything else
   uses it as an adjective: "SAT Vocab", "SAT vocabulary", "SAT score", "SAT administration".
4. **The "not affiliated" sentence** in two strategy guides is weaker than the notice. It has no
   ®, and it does not say the College Board does not endorse Voco.

### Content that may be borrowed

I could check wording, named sources and whether the content is invented. I could not compare it
with the official questions, because I had no copy and did not look any up. The comparisons below
with the College Board's wording are from memory of its public sample questions, so treat them as
flags to check, not as findings.

**Stems.** Every question of a type shares one stem, and several match the College Board's
standard stem for that type, or are one word away from it.

| Voco stem | Questions |
|---|---|
| "Which choice completes the text with the most logical transition?" | 15 (Transitions) |
| "Which choice most effectively uses relevant information from the notes to accomplish this goal?" | 15 (Rhetorical Synthesis) |
| "Which choice is written in a way that conforms to the conventions of Standard English?" | 30 (Boundaries, and Form, Structure, and Sense) |
| "Which choice best states the main idea of the text?" | 7 (passages) |
| "Which choice best describes the overall structure of the text?" | 2 (passages) |
| "Which choice completes the text with the most logical and precise word?" | 4 (passages) |

The sentence-function questions, the "Which quotation from the text most effectively illustrates
the claim" questions and the cross-text "Based on the texts, how would ... most likely respond"
questions follow the same pattern. The Rhetorical Synthesis goals read "The writer wants to ..."
above four short notes, which is the layout the real test uses. The vocabulary stem, "Which word
best completes the sentence?", is Voco's own wording.

A stem is formula wording, not question content. It is still the closest thing to copied text in
the app, so the owner should decide: keep the stems, or reword them in Voco's own words.

**Question bodies.** 16 passages (42 questions), 4 cross-text pairs (4 questions) and 60 grammar
questions. I found no sign of copying. I skimmed all 29 names in the passage text and none is a
famous person or a real publication. There is no "adapted from" line, no quoted source and no web
address, and nothing mentions Bluebook or the PSAT. The strategy guides send learners to the
official College Board site, which is fine. The repo's own rule is that all content is original
writing.

That is not proof. One person with the Official Digital SAT Study Guide should compare the
passages and the grammar questions with it, once.

**Names.** The four grammar categories ("Boundaries", "Form, Structure, and Sense",
"Transitions", "Rhetorical Synthesis") are the College Board's published skill names. Using them
to say what a question practices is descriptive, but it is its wording.

**Layout facts.** The practice test and the strategy guides say 54 questions, two modules of 27,
32 minutes each. That is the published structure of the test, stated as of when it was written.
It is not copied text.

### Not checked

- Stripe's checkout page, the Stripe product name and description, and receipt emails. They live
  in Stripe, not in the repo, and the rules say not to touch Stripe.
- The GitHub repo description and the Vercel project name.
- The vocabulary quiz sentences (hundreds of them). They were not compared with any source.
- The practice test results screen and the share image. I read them in the code and did not
  render them.
- A real phone. I used one desktop browser.

## The list

1. **Check the top bar on a real iPhone.** If the logo sits under the status bar, set
   `viewportFit: "cover"` in the `viewport` export of `app/layout.js` and add safe-area padding on
   every page. Today there is no `viewportFit`, the manifest sets no display mode, and `.vc-page`
   already pads with `env(safe-area-inset-*)`, so I expect the page to sit below the status bar
   already. Nobody has checked on a phone.
   *Done when:* the logo clears the status bar on a real iPhone, in Safari and from the home
   screen, and every page pads for the safe areas if `viewportFit` was needed.

2. **Commit `brand-assets/` (profile picture and clean mark SVG).** Already done. Both files have
   been on `main` since commit `2469b60` (21 October 2026), and a test in
   `scripts/test-first-visit.mjs` keeps the app from importing or serving them.
   *Done when:* `git ls-files brand-assets` lists `voco-mark-clean.svg` and
   `voco-profile-picture.png`. It does today, so cross this off unless there is newer artwork.

3. **Audit the "SAT" marks and disclaimer placement.** The audit is the section at the top of this
   file. Acting on it is the work that is left.
   *Done when:* every screen and image that shows "SAT" carries the College Board notice or no
   longer shows the mark, "SAT" is only an adjective, and the owner has decided what to do about
   the stems.

4. **Delete the unused science-card component.** `components/ScienceNote.js` is not imported
   anywhere. Its data (`SCIENCE_FACTS` and `pickScienceFact` in `lib/sleepScience.js`) is read only
   by a lint in `scripts/test-first-visit.mjs`, and `scripts/test-pages.mjs` asserts the home
   screen does not use them. Decide in the PR whether the data goes too.
   *Done when:* `components/ScienceNote.js` is gone, nothing references it, and `npm test` and
   `npm run build` pass.

5. **Upgrade Next.js as its own PR.** Installed is 14.2.35, with the range `^14.2.5` in
   `package.json`. Nothing else changes in that PR.
   *Done when:* the PR changes only Next.js, the lockfile and what the upgrade itself needs,
   `npm test` and `npm run build` pass, and the home screen, a quiz, the paywall card and
   `/unlock` were checked in a browser.

6. **Fix the remaining em dashes in the night-theme explainer and the science facts.** On
   2 November 2026 `components/NightThemeExplainer.js` has none. `lib/sleepScience.js` has one, on
   line 74, in `SCIENCE_FACTS` (the testing effect fact). Its only reader is the unused card from
   item 4, so doing item 4 first may remove it. A wider scan finds about 150 more lines with an
   em dash, whether typed as the character or written as an escape code. Most are question content: `lib/greVocabulary.js` (54, a
   hidden course), `lib/wordbanks.js` (23), the passages, the grammar and the cross-text files.
   Some are screen copy: the privacy, terms, unlock and practice test pages, `lib/milestones.js`,
   `components/ShareButton.js` and the first-visit course card text in `lib/wordbanks.js`. Say
   whether the rule covers question content as well as screen copy.
   *Done when:* a search for the em dash in `components/NightThemeExplainer.js` and
   `lib/sleepScience.js` finds nothing and `npm test` passes.

7. **Write the refund policy wording before any ads.** Today nothing in the app says whether a
   payment can be refunded. Terms section 5 says cancelling stops future billing and keeps access
   to the end of the paid period.
   *Done when:* the Terms and the unlock page state the refund policy in plain words, the wording
   matches what the owner will actually do in Stripe, and the owner has approved it. No ad runs
   before that.

8. **Later: Speed Insights and a "remind me tomorrow" retention feature.**
   - Speed Insights. `@vercel/analytics` is installed and `<Analytics />` is in `app/layout.js`.
     Speed Insights is not installed.
     *Done when:* `@vercel/speed-insights` is installed, `<SpeedInsights />` is in the root layout,
     the Privacy page still says what is collected, and a preview deploy shows data in Vercel.
   - Remind me tomorrow. The mechanism is not decided.
     *Done when:* a learner can ask to be reminded tomorrow, it works on an iPhone, it needs no
     account, and it stores no personal data.

9. **How to bring a hidden course back.** The hidden courses are `everyday-vocabulary`,
   `professional-vocabulary` and `gre-vocab`. The steps:
   1. Add the course id to `LIVE_COURSES` in `lib/liveCourses.js`. That one line is the switch.
   2. Run `npm run test:launch`, `npm test` and `npm run build`. The launch test builds a scratch
      copy with the course switched on and checks it.
   3. Look at the home screen, the course page, the paywall card, `/unlock` and the Terms in a
      browser. Their wording follows the number of live courses on its own, through
      `lib/courseScope.js`.
   4. The owner edits what the code cannot reach: the Stripe product description, the Terms
      "Last updated" date, and the price.
   5. Open a PR from a branch. Do not merge it.

   More detail is in "Launching and hiding courses" in `CLAUDE.md`.
   *Done when:* the course shows on the home screen, its old links stop redirecting, and
   `npm run test:launch`, `npm test` and `npm run build` pass.
