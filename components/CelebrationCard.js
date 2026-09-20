// The one celebration-card recipe: a tinted cream card with a colored disc and
// glyph, a small label, a headline, a figure, and a note. Used by the
// score-tier results (components/QuizResults.js) and by the one-time
// milestones (components/MilestoneCards.js), so both read as the same visual
// language — only the accent color, glyph and words change.
//
// Colors: `accent` for graphics (disc, border, tint), `deep` (a darker shade
// of the same hue) for small text, since the accent itself is too pale to
// read at that size on the cream card. `rgb` is the accent as "r, g, b".
export default function CelebrationCard({ accent, deep, rgb, Icon, label, headline, figure, note, children }) {
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
        {figure}
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
