"use client";

import { useEffect, useRef } from "react";

// The section tabs of a course page, as one row of pills that never wraps. When they do not
// all fit, the row scrolls sideways, and whenever the selection changes the active pill is
// scrolled to the middle of the row (the row's own scroll, never the page's), so it is not
// left clipped at an edge. It is still a proper tablist: arrow keys are not added, but each
// pill is a tab with aria-selected and the page's tabpanel is labelled by it.
export default function SectionPills({ sections, value, onSelect, label }) {
  const rowRef = useRef(null);

  useEffect(() => {
    const row = rowRef.current;
    const active = row && row.querySelector('[aria-selected="true"]');
    if (!active) return;
    row.scrollLeft = Math.max(0, active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2);
  }, [value]);

  return (
    <div ref={rowRef} role="tablist" aria-label={label} data-scrollx className="vc-pills">
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          role="tab"
          id={`tab-${s.id}`}
          aria-selected={value === s.id}
          aria-controls={`panel-${s.id}`}
          onClick={() => onSelect(s.id)}
          className="vc-pill"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
