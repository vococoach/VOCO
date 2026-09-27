"use client";

// The data display for a command-of-evidence-quantitative question (lib/
// satPassages.js) — deliberately minimal, matching this app's existing
// discipline around dependencies: a plain HTML table for tabular data, or a
// small hand-rolled inline-SVG horizontal bar chart for magnitude/trend
// data. No charting library; no interactivity (hover, tooltips) either,
// since every value a learner needs is already printed on the chart. See
// CLAUDE.md "The last four SAT domains" for why this level of complexity
// was chosen over a full charting dependency.

function DataTable({ chart, theme }) {
  return (
    <div className="mb-4 overflow-x-auto">
      {chart.caption && (
        <p className="text-xs mb-2" style={{ color: theme.subtext }}>{chart.caption}</p>
      )}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {chart.columns.map((col, i) => (
              <th
                key={i}
                className="text-left font-medium pb-2 pr-3"
                style={{ color: theme.text, borderBottom: `1px solid ${theme.text}33` }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="py-2 pr-3"
                  style={{ color: theme.text, borderBottom: `1px solid ${theme.text}1A` }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Horizontal bars — label on the left, bar extending right, value at the end
// — chosen over vertical bars specifically because it needs no rotated or
// truncated axis labels to stay readable at phone width.
function BarChart({ chart, theme }) {
  const { bars, unit } = chart;
  const max = Math.max(...bars.map((b) => b.value));
  const barHeight = 26;
  const gap = 14;
  const labelWidth = 108;
  const trackWidth = 160;
  const valueMargin = 70;
  const rowHeight = barHeight + gap;
  const height = bars.length * rowHeight - gap;
  const totalWidth = labelWidth + trackWidth + valueMargin;

  return (
    <div className="mb-4">
      {chart.caption && (
        <p className="text-xs mb-2" style={{ color: theme.subtext }}>{chart.caption}</p>
      )}
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full"
        role="img"
        aria-label={chart.caption || "Bar chart"}
      >
        {bars.map((b, i) => {
          const y = i * rowHeight;
          const w = max > 0 ? (b.value / max) * trackWidth : 0;
          return (
            <g key={i}>
              <text
                x={labelWidth - 8}
                y={y + barHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill={theme.text}
              >
                {b.label}
              </text>
              <rect x={labelWidth} y={y} width={w} height={barHeight} rx={4} fill={theme.accent} />
              <text
                x={labelWidth + w + 8}
                y={y + barHeight / 2}
                dominantBaseline="middle"
                fontSize="12"
                fill={theme.text}
              >
                {b.value}
                {unit ? ` ${unit}` : ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function PassageChart({ chart, theme }) {
  if (!chart) return null;
  if (chart.kind === "table") return <DataTable chart={chart} theme={theme} />;
  if (chart.kind === "bar") return <BarChart chart={chart} theme={theme} />;
  return null;
}
