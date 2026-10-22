// The Voco mark: a lavender crescent cradling an orange sun. The shapes and colors
// below are the contents of brand-assets/voco-mark-clean.svg (the same file as
// public/icon.svg), unchanged. Don't redraw or restyle it; scripts/test-first-visit.mjs
// checks that this markup and public/icon.svg still describe the same two shapes.
//
// Decorative: the wordmark beside it, or the page title, already carries the name,
// so it is hidden from assistive technology. `size` is the rendered height and
// width in px (the artwork's own box is 398 by 400, so it is centred in a square).
export default function VocoMark({ size = 26, className = "" }) {
  return (
    <svg
      viewBox="56 56 398 400"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M 261.04 86.07 A 170 170 0 1 0 394.96 353.93 A 150 150 0 1 1 261.04 86.07 Z"
        fill="#8B85FF"
        stroke="#8B85FF"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <circle cx="320" cy="224" r="108" fill="#FF9B5C" />
    </svg>
  );
}
