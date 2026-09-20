import { Check, TrendingUp, Bookmark } from "lucide-react";
import { getScoreTier, TIERS } from "@/lib/scoreTier";
import CelebrationCard from "@/components/CelebrationCard";

// One glyph per tier, shared with the home screen's level indicators so the
// results card and the list use the same visual language.
export const TIER_ICONS = { perfect: Check, good: TrendingUp, watch: Bookmark };

// End-of-quiz summary shared by level quizzes, missed-words sessions
// (both in app/sets/[setId]/quiz) and review sessions (app/review).
//
// Every result gets a tier by percentage (see lib/scoreTier.js) and renders
// through the shared CelebrationCard in that tier's color. `copy` supplies
// the headline and note per tier: { perfect, good, watch }, each
// { headline, note }, since what's true differs by quiz type (e.g. a
// missed-words session's misses stay under "still learning", a review
// session's go straight back into the next review).
export default function QuizResults({ score, total, copy, children }) {
  const tier = getScoreTier(score, total);
  const { accent, deep, rgb, label } = TIERS[tier];
  const { headline, note } = copy[tier];

  return (
    <CelebrationCard
      accent={accent}
      deep={deep}
      rgb={rgb}
      Icon={TIER_ICONS[tier]}
      label={label}
      headline={headline}
      figure={`${score} / ${total}`}
      note={note}
    >
      {children}
    </CelebrationCard>
  );
}
