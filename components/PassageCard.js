"use client";

// The passage text, with any blank (a words-in-context passage) drawn as a
// visible underlined gap. Shared by every screen that displays passage text.
export function PassageText({ paragraph, theme }) {
  const parts = paragraph.split("______");
  return (
    <p className="font-display text-[17px] leading-[1.75]" style={{ color: theme.text }}>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span
              role="img"
              aria-label="blank"
              className="inline-block w-20 mx-1 align-baseline"
              style={{ borderBottom: `2px solid ${theme.text}` }}
            >
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

// One passage's title/subject/text card — the same rounded card
// /passages/[passageId] has always shown, extracted so /cross-text/[pairId]
// can show two of them stacked without duplicating the markup. `titleTag`
// defaults to h2 (right when two cards share a page, as on the cross-text
// screen); the single-passage page passes "h1" to keep its exact prior
// heading level.
export default function PassageCard({ title, subject, text, theme, titleTag = "h2" }) {
  const TitleTag = titleTag;
  return (
    <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: theme.card }}>
      <p className="text-xs uppercase tracking-wide mb-1" style={{ color: theme.subtext }}>
        Reading passage · {subject}
      </p>
      <TitleTag className="font-display text-xl mb-4" style={{ color: theme.text }}>{title}</TitleTag>
      <div className="space-y-4">
        {text.map((paragraph, i) => (
          <PassageText key={i} paragraph={paragraph} theme={theme} />
        ))}
      </div>
    </div>
  );
}
