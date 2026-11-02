// Legal wording that appears on more than one screen, written once.
// SAT® is a trademark Voco does not own; the SAT Vocab course and its practice
// material are independent. Shown in the footers of the home screen, the
// first-visit screen and /unlock, and in Terms §2.
export const TRADEMARK_NOTICE =
  "SAT® is a registered trademark of the College Board, which is not affiliated with and does not endorse Voco.";

// The shorter notice at the foot of every other page that shows "SAT": the course pages
// (all tabs), the strategy guides, the sample question page, the practice test (intro and
// results) and the privacy page. components/TrademarkNotice.js is the one place that shows it,
// so a page adds the notice by rendering that component and never by typing the words.
export const TRADEMARK_FOOTER = "SAT® is a registered trademark of the College Board, which does not endorse Voco.";
