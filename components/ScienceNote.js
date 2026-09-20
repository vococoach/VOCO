import { Moon, Sunrise } from "lucide-react";

// The small, permanent science note on the home screen: one short fact from
// lib/sleepScience.js (pickScienceFact — sleep in the evening, retrieval
// practice in the morning), always shown, with its hedge.
//
// Deliberately a quiet footnote, not a card: no fill, no button, nothing to tap
// or dismiss, small muted text. The daily-habit cards above and below it are
// what should draw the eye; the "why the night theme?" dialog (opened from the
// icon by the logo) is the deeper, opt-in explanation. Moon / sunrise are the
// app's own study-at-night / quiz-in-the-morning pair.
export default function ScienceNote({ fact }) {
  const Icon = fact.kind === "retrieval" ? Sunrise : Moon;
  return (
    <aside
      aria-label="A note on how memory works"
      className="mb-6 flex items-start gap-2.5 rounded-xl border border-[#ffffff0f] px-3.5 py-2.5"
    >
      <Icon size={14} color="#6E699B" aria-hidden="true" className="mt-0.5 shrink-0" />
      <p className="text-xs leading-snug text-[#8E8AB5]">
        {fact.text} {fact.hedge}
      </p>
    </aside>
  );
}
