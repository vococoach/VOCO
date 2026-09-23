// The one celebration-card recipe: a tinted card with a colored disc and
// glyph, a small label, a headline, a figure, and a note. Used by the
// score-tier results (components/QuizResults.js) and by the one-time
// milestones (components/MilestoneCards.js), so both read as the same visual
// language — only the accent color, glyph and words change.
//
// `theme` (lib/timeTheme.js's NIGHT or DAWN) sets the card's OWN surface —
// this used to be hardcoded to the light cream recipe always, regardless of
// what page it was shown on, which is exactly the activity-type-over-real-
// time bug CLAUDE.md's "Screens follow real time, not activity type" rule
// exists to prevent: a results screen is still a screen. `accent` (for
// graphics: disc, border, tint) and `rgb` (the same color as "r, g, b" for
// the tint) are unaffected by theme — they're OUTCOME colors (score tier or
// milestone kind), not time-of-day ones. `deep` (a darker shade of the same
// hue, readable on the light DAWN card) and `accent` itself (already proven
// readable on a dark surface — see lib/scoreTier.js) are the two small-text
// candidates; which one is legible depends on the card surface, so this
// picks it from `theme` rather than the caller guessing.
export default function CelebrationCard({ theme, accent, deep, rgb, Icon, label, headline, figure, note, children }) {
  const smallText = theme.isDawn ? deep : accent;
  return (
    <div
      className="voco-rise rounded-2xl p-8 mb-5"
      // The tint is layered over the theme's own solid card color (not a
      // translucent gradient, which would pick up the page background behind
      // it and turn muddy).
      style={{
        border: `1px solid ${accent}99`,
        background: `linear-gradient(to bottom, rgba(${rgb}, 0.22), rgba(${rgb}, 0) 65%), ${theme.card}`,
      }}
    >
      <div
        className="voco-settle mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: accent, boxShadow: `0 0 0 8px ${accent}33` }}
      >
        <Icon size={28} color={theme.card} strokeWidth={2.5} />
      </div>
      <p className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: smallText }}>
        {label}
      </p>
      <p className="font-display text-2xl leading-snug" style={{ color: theme.text }}>
        {headline}
      </p>
      <p className="font-display text-lg mt-3" style={{ color: smallText }}>
        {figure}
      </p>
      <p className="text-sm mt-3 text-balance" style={{ color: theme.subtext }}>
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
