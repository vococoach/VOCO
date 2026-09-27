// SAT Vocab — Cross-Text Connections (added 2026-09-27): pairs of short,
// related original passages — differing interpretations of similar evidence,
// or a claim and a complicating observation — with one question about how
// the two relate. Existing single passages don't have a natural partner, so
// every pair here is new, purpose-built content, not a repurposed existing
// passage. Both texts are ENTIRELY ORIGINAL, exactly like every other
// passage in this app: invented people, places, data and quotes, never
// derived from or modeled on real SAT material.
//
// This is Craft and Structure's Cross-Text Connections sub-skill — see
// CLAUDE.md "SAT domain accuracy audit" and "The last four SAT domains."
//
// Shape: { id, passageA: { title, subject, text: [paragraph, …] }, passageB:
// { title, subject, text: [paragraph, …] }, questions: [{ type: "cross-text-
// connections", prompt, options: [4, correct FIRST], correctIndex: 0,
// explanation }] }. One question per pair, matching the real format. Like
// every other quiz here, the correct option is listed first and shuffled on
// screen.
//
// Rendered on its own route, /cross-text/[pairId] (app/cross-text/[pairId]/
// page.js), reusing components/PassageCard.js for each text — both texts
// shown at once, stacked, not tabbed — and listed in a dedicated block
// within the SAT course's existing "Passages" tab (components/
// CrossTextList.js), not a new tab. Tracked in the SAME store as single
// passages (lib/passageProgress.js, voco_passages_v1) — a pair id is just
// another id in that store, since the tracking need (completedAt/score/
// attempts per content item) is identical; pair ids are namespaced
// distinctly (see each id below) so they can never collide with a passage
// id. Gated the same way as any non-free passage (lib/purchase.js
// isPassageLocked) — there's no separate free cross-text pair, since the
// existing free passage already samples the Passages tab. Never change a
// pair's id — users' localStorage references it.

export const satCrossTextPairs = [
  {
    id: "xt-stone-ring-alignment",
    passageA: {
      title: "The Highland Stone Ring",
      subject: "Archaeology",
      text: [
        "Archaeologist Renata Silva has spent a decade studying a ring of standing stones in the highlands, each one aligned with a bright star that would have marked the winter solstice for its original builders. Silva argues that the stones' astronomical precision makes their purpose clear: the structure was a solstice calendar, built and used by early farmers to time seasonal planting.",
      ],
    },
    passageB: {
      title: "A Second Stone Ring, Two Hundred Miles South",
      subject: "Archaeology",
      text: [
        "Archaeologist Tomasz Krupa has studied a similar ring of standing stones two hundred miles away, and cautions against reading astronomical alignment as proof of astronomical purpose. Krupa points out that many ceremonial and burial sites happen to align with prominent stars simply because builders favored open, elevated ground — the same terrain that offers unobstructed sightlines to the horizon. An alignment, he argues, can be a byproduct of where a monument was built, not evidence of why it was built.",
      ],
    },
    questions: [
      {
        type: "cross-text-connections",
        prompt: "Based on the texts, how would Krupa most likely respond to Silva's claim that her stone ring's alignment proves it was built as a solstice calendar?",
        options: [
          "He would question whether the alignment shows purpose at all, since it could simply result from choosing elevated, open terrain for unrelated reasons.",
          "He would agree, since his own research also found agricultural stone rings built in similarly elevated locations.",
          "He would argue that Silva's stone ring was actually built for a religious purpose rather than a farming one.",
          "He would dismiss the astronomical alignment as pure coincidence, unrelated in any way to why the stones were built.",
        ],
        correctIndex: 0,
        explanation: "Krupa's own argument is that alignment can follow from terrain choice rather than proving purpose — exactly the doubt he'd raise about Silva's reasoning. He never says his own site was agricultural or agrees with her; he proposes no alternative purpose (religious or otherwise) for Silva's ring, only skepticism about using alignment as proof; and his actual claim is more measured than flat dismissal — he says alignment \"can be\" a byproduct of terrain, not that it's necessarily meaningless.",
      },
    ],
  },
  {
    id: "xt-remote-work-productivity",
    passageA: {
      title: "The Remote Shift's Productivity Gain",
      subject: "Social Science",
      text: [
        "Economist Diego Farrow analyzed productivity data from a mid-sized software company that shifted fully remote in 2021, and found that output per employee rose 12% over the following two years. Farrow attributes the gain to employees reclaiming commute time and working during their own most productive hours, and argues the finding supports wider adoption of remote work.",
      ],
    },
    passageB: {
      title: "Productivity Gains, Unevenly Distributed",
      subject: "Social Science",
      text: [
        "Economist Naomi Oduya studied the same shift toward remote work across a broader set of companies and found that productivity gains varied enormously by role: individual contributors gained, but teams whose work depended on frequent, spontaneous collaboration often saw output fall. Oduya argues that averaging across a whole company, as a single-company study does, can hide a real cost to collaborative work that a companywide productivity number would never reveal.",
      ],
    },
    questions: [
      {
        type: "cross-text-connections",
        prompt: "Which choice best describes how Oduya's findings relate to Farrow's conclusion?",
        options: [
          "They complicate it, suggesting that a companywide average like Farrow's may obscure real losses in roles that depend on collaboration.",
          "They confirm it, since both economists found that remote work increases productivity across every role they studied.",
          "They are unrelated to it, since Oduya studied a completely different question from the one Farrow examined.",
          "They replace it, proving that Farrow's original single-company finding was simply mistaken.",
        ],
        correctIndex: 0,
        explanation: "Oduya's role-by-role variation directly complicates a single companywide average like Farrow's, without saying his number was wrong — it says that number may hide underlying variation. The two studies address the same topic, so they aren't unrelated; Oduya's own findings are mixed (collaborative roles fell), not a confirming across-the-board gain; and she never claims Farrow's finding was simply incorrect, only that it may not tell the whole story.",
      },
    ],
  },
  {
    id: "xt-pedestrian-plaza-sales",
    passageA: {
      title: "The Meridian Plaza's First Year",
      subject: "Social Science",
      text: [
        "City planner Andres Villalobos points to a new pedestrian plaza in downtown Meridian as proof that closing streets to car traffic boosts local business. In the plaza's first year, sales tax revenue from the surrounding shops rose 18%, and Villalobos credits the increase to the foot traffic the car-free space attracted.",
      ],
    },
    passageB: {
      title: "A Bookseller's Second Look",
      subject: "Social Science",
      text: [
        "Shop owner Ines Calloway, who has run a bookstore on the plaza for over a decade, notes that the 18% rise coincided with the opening of a large office building two blocks away, which added roughly 400 new workers to the neighborhood the same year. Calloway doesn't dispute that the plaza is pleasant to walk through, but she isn't convinced the street closure, rather than the new office workers passing through daily, explains the sales increase.",
      ],
    },
    questions: [
      {
        type: "cross-text-connections",
        prompt: "Based on the texts, Calloway's observation about the office building most directly serves to do which of the following?",
        options: [
          "It raises an alternative explanation for the sales increase that Villalobos's plaza-focused account does not address.",
          "It confirms that Villalobos's claim about the pedestrian plaza is accurate.",
          "It shows that the pedestrian plaza actually reduced foot traffic in the surrounding area.",
          "It proves that closing streets to car traffic has no effect on local business anywhere.",
        ],
        correctIndex: 0,
        explanation: "Calloway proposes a second, untested cause for the same sales increase, one Villalobos's account never considers — that's an alternative explanation, not a confirmation. She never says the plaza reduced foot traffic; she says she isn't convinced the plaza, rather than the new office workers, explains the rise. And her observation is about this one plaza's sales, not a general claim about street closures everywhere.",
      },
    ],
  },
  {
    id: "xt-merchant-diary-reliability",
    passageA: {
      title: "A Merchant's Diary as Historical Source",
      subject: "History",
      text: [
        "Historian Beatriz Junqueira has used the diary of an 18th-century merchant, Henrik Voss, as her primary source for reconstructing daily trade practices in a small port town. Junqueira argues the diary is unusually reliable because Voss recorded transactions the same day they occurred, in plain, unembellished language, with none of the self-conscious literary flourishes common in diaries written for eventual publication.",
      ],
    },
    passageB: {
      title: "Reliable, but Whose Story?",
      subject: "History",
      text: [
        "Historian Amara Osei, working with the same diary, cautions that same-day, plain-language entries are not automatically free of bias. Voss recorded only the transactions he personally handled and had every reason to record his own dealings favorably; his diary, Osei notes, says nothing about disputes he lost or deals that fell through. A source can be immediate and plainly written, she argues, and still reflect only its author's own favorable version of events.",
      ],
    },
    questions: [
      {
        type: "cross-text-connections",
        prompt: "Which choice best describes the relationship between Osei's argument and Junqueira's?",
        options: [
          "Osei accepts the same features of the diary that Junqueira cites, but argues those features don't rule out the specific kind of bias she's concerned about.",
          "Osei argues that the diary's same-day entries are a sign that Voss was writing carelessly and made frequent factual errors.",
          "Osei disputes Junqueira's claim that Voss recorded his transactions on the same day they occurred.",
          "Osei argues that Junqueira has misidentified which historical figure actually wrote the diary.",
        ],
        correctIndex: 0,
        explanation: "Osei never contests the diary's immediacy or plain language — she grants both, then argues they don't rule out selective, self-favoring reporting, a different concern from Junqueira's. She never questions Voss's accuracy or care in writing; she doesn't dispute the same-day timing at all, only what it does and doesn't prove; and no question about who wrote the diary appears anywhere in either text.",
      },
    ],
  },
];
