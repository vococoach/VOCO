import { TRADEMARK_FOOTER } from "@/lib/legal";

// The College Board notice for the foot of a page that shows "SAT" and has no footer of its own.
// The home screen, the first-visit screen, /unlock and the Terms keep their own, which say more.
//
// Small and quiet on purpose: 12px, centred, in the page's muted colour, and the LAST thing in the
// page's content column, in the normal flow. It is never fixed, sticky or absolute, so it cannot
// cover anything and nothing above it moves; it only makes the page a little longer at its end.
// See "The College Board notice" in CLAUDE.md.
//
// `color` is for a page that paints its own palette instead of the --vc-* variables: the strategy
// guides and the privacy page pass #9B97C4, and the sample question page and the practice test pass
// their theme's `subtextAA`, which reads on both the night and the dawn page. Left out, the notice
// takes `.vc-muted` and follows night and dawn by itself.
export default function TrademarkNotice({ color }) {
  return (
    <footer
      data-trademark-notice
      className={`mt-5 text-center text-xs leading-snug${color ? "" : " vc-muted"}`}
      style={color ? { color } : undefined}
    >
      {TRADEMARK_FOOTER}
    </footer>
  );
}
