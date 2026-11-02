import { TRADEMARK_NOTICE } from "@/lib/legal";

// The College Board notice for the foot of a page that shows "SAT" and does not print the notice
// itself. The home screen, the first-visit screen, /unlock and the Terms print the same words
// (TRADEMARK_NOTICE in lib/legal.js) in their own layouts.
//
// Small and quiet on purpose: 12px, centred, in the page's muted colour, and the LAST thing in the
// page's content column, in the normal flow. It is never fixed, sticky or absolute, so it cannot
// cover anything and nothing above it moves; it only makes the page a little longer at its end.
// The sentence is about a hundred characters, so it is two lines from 360 to 390px wide and three
// at 320px. `text-balance` evens the lines out: without it the break fell between "College" and
// "Board" at 320px and left "endorse Voco." alone on the last line. It never adds a line, so it
// changes no height. See "The College Board notice" in CLAUDE.md.
//
// `color` is for a page that paints its own palette instead of the --vc-* variables: the strategy
// guides and the privacy page pass #9B97C4, and the sample question page and the practice test pass
// their theme's `subtextAA`, which reads on both the night and the dawn page. Left out, the notice
// takes `.vc-muted` and follows night and dawn by itself.
export default function TrademarkNotice({ color }) {
  return (
    <footer
      data-trademark-notice
      className={`mt-5 text-center text-xs leading-snug text-balance${color ? "" : " vc-muted"}`}
      style={color ? { color } : undefined}
    >
      {TRADEMARK_NOTICE}
    </footer>
  );
}
