import { Moon, Sunrise } from "lucide-react";

// The small, permanent science note on the home screen: one short fact from
// lib/sleepScience.js (pickScienceFact — sleep in the evening, retrieval
// practice in the morning), always shown, with its hedge.
//
// Still a footnote, not a card: no fill, no button, nothing to tap or dismiss,
// small text. Its color follows the app's own night/dawn split, the same one
// the icon signals: the night indigo (#8B85FF) for a sleep fact, the dawn
// orange (#FF9B5C) for a retrieval fact. Both clear WCAG AA for small text on
// the page background (#1A1C3A) — 5.4:1 and 7.9:1 — so a livelier color never
// costs readability; re-check that if the background or either color changes.
// The "why the night theme?" dialog (opened from the icon by the logo) is the
// deeper, opt-in explanation.
const KINDS = {
  sleep: { Icon: Moon, color: "#8B85FF", textClass: "text-[#8B85FF]" },
  retrieval: { Icon: Sunrise, color: "#FF9B5C", textClass: "text-[#FF9B5C]" },
};

export default function ScienceNote({ fact }) {
  const { Icon, color, textClass } = KINDS[fact.kind] || KINDS.sleep;
  return (
    <aside
      aria-label="A note on how memory works"
      className="mb-6 flex items-start gap-2.5 rounded-xl border border-[#ffffff0f] px-3.5 py-2.5"
    >
      <Icon size={14} color={color} aria-hidden="true" className="mt-0.5 shrink-0" />
      <p className={`text-xs leading-snug ${textClass}`}>
        {fact.text} {fact.hedge}
      </p>
    </aside>
  );
}
