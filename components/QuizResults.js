import { Check, TrendingUp, Bookmark } from "lucide-react";
import { getScoreTier, TIERS } from "@/lib/scoreTier";

// One glyph per tier, shared with the home screen's level indicators so the
// results card and the list use the same visual language.
export const TIER_ICONS = { perfect: Check, good: TrendingUp, watch: Bookmark };

// End-of-quiz summary shared by level quizzes, missed-words sessions
// (both in app/sets/[setId]/quiz) and review sessions (app/review).
//
// Every result gets a tier by percentage (see lib/scoreTier.js) and the same
// card structure — disc, label, headline, score, note — in that tier's color.
// `copy` supplies the headline and note per tier: { perfect, good, watch },
// each { headline, note }, since what's true differs by quiz type (e.g. a
// missed-words session's misses stay under "still learning", a review
// session's go straight back into the next review).
export default function QuizResults({ score, total, copy, children }) {
  const tier = getScoreTier(score, total);
  const { accent, deep, rgb, label } = TIERS[tier];
  const Icon = TIER_ICONS[tier];
  const { headline, note } = copy[tier];

  return (
    <div
      className="voco-rise rounded-2xl p-8 mb-5"
      // The tint is layered over solid cream (not a translucent gradient,
      // which would pick up the peach page background and turn muddy).
      style={{
        border: `1px solid ${accent}99`,
        background: `linear-gradient(to bottom, rgba(${rgb}, 0.22), rgba(${rgb}, 0) 65%), #FFF9F2`,
      }}
    >
      <div
        className="voco-settle mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: accent, boxShadow: `0 0 0 8px ${accent}33` }}
      >
        <Icon size={28} color="#FFF9F2" strokeWidth={2.5} />
      </div>
      <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: deep }}>
        {label}
      </p>
      <p className="font-display text-2xl text-[#3D2B4F] leading-snug">{headline}</p>
      <p className="font-display text-lg mt-3" style={{ color: deep }}>
        {score} / {total}
      </p>
      <p className="text-sm mt-3 text-[#8A6E7D] text-balance">
        {/* An array puts each entry on its own line, so a line break lands on a sentence boundary. */}
        {Array.isArray(note)
          ? note.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))
          : note}
      </p>
      {children}
    </div>
  );
}
