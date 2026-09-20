import { Sunrise, Flame, Award, BookOpen, Share2 } from "lucide-react";
import CelebrationCard from "@/components/CelebrationCard";
import ShareButton from "@/components/ShareButton";
import { CARD_STYLES } from "@/lib/milestones";

// Glyphs for the card styles in lib/milestones.js (the same names the share
// image uses, so the in-app card and the image match).
export const CARD_ICONS = { sunrise: Sunrise, flame: Flame, award: Award, book: BookOpen };

// The one-time milestone celebrations, shown under the score card on the
// results screen. Same visual recipe as the score-tier cards (it IS the same
// component, CelebrationCard); each has a "Share this" button right beside
// the achievement. `milestones` are descriptors from describeMilestone() —
// already marked as shown by checkNewMilestones(), so they appear once, ever.
export default function MilestoneCards({ milestones }) {
  return milestones.map((card) => {
    const style = CARD_STYLES[card.style];
    return (
      <CelebrationCard
        key={card.filename}
        accent={style.accent}
        deep={style.deep}
        rgb={style.rgb}
        Icon={CARD_ICONS[style.icon]}
        label="Milestone"
        headline={card.headline}
        figure={card.figure || `${card.big} ${card.unit}`}
        note={card.note}
      >
        <ShareButton
          card={card}
          className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border"
          style={{ borderColor: `${style.accent}99` }}
          ariaLabel={`Share this milestone: ${card.headline}`}
        >
          <Share2 size={15} style={{ color: style.deep }} />
          <span style={{ color: style.deep }}>Share this</span>
        </ShareButton>
      </CelebrationCard>
    );
  });
}
