"use client";

/* ────────────────────────────────────────────────────────
   VisitAreaChart — SVG area chart with smooth Bézier curves
   Matches the reference design: gradient-filled area under
   a smooth curve, grid lines, labeled Y axis, X axis labels.
   ──────────────────────────────────────────────────────── */

interface VisitAreaChartProps {
  data: { label: string; count: number }[];
  lang: string;
}

/** Build a smooth cubic Bézier path through the given points. */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";

  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;

    d += ` C ${midX},${curr.y} ${midX},${next.y} ${next.x},${next.y}`;
  }

  return d;
}

const CHART_W = 600;
const CHART_H = 220;
const PAD_L = 35;
const PAD_R = 15;
const PAD_T = 15;
const PAD_B = 30;

export function VisitAreaChart({ data }: VisitAreaChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // Round up to a nice number for the Y axis
  const yMax = Math.ceil(maxCount * 1.25) || 5;
  const ySteps = 5;

  const plotW = CHART_W - PAD_L - PAD_R;
  const plotH = CHART_H - PAD_T - PAD_B;

  // Map data to SVG points
  const points = data.map((item, i) => ({
    x: PAD_L + (i / (data.length - 1)) * plotW,
    y: PAD_T + plotH - (item.count / yMax) * plotH,
  }));

  const linePath = buildSmoothPath(points);

  // Area path: line path → drop down to bottom → close
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x},${PAD_T + plotH}` +
    ` L ${points[0].x},${PAD_T + plotH} Z`;

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Gradient fill under the curve */}
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
        </linearGradient>

        {/* Glow filter for the line */}
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal grid lines */}
      {Array.from({ length: ySteps + 1 }).map((_, i) => {
        const y = PAD_T + (i / ySteps) * plotH;
        const val = Math.round(yMax - (i / ySteps) * yMax);
        return (
          <g key={`grid-${i}`}>
            <line
              x1={PAD_L}
              y1={y}
              x2={CHART_W - PAD_R}
              y2={y}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-slate-500"
              fontSize="10"
              fontFamily="inherit"
            >
              {val}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Main curve line */}
      <path
        d={linePath}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#lineGlow)"
      />

      {/* Data points */}
      {points.map((pt, i) => (
        <g key={`pt-${i}`}>
          {/* Outer ring */}
          <circle cx={pt.x} cy={pt.y} r="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
          {/* Inner dot */}
          <circle cx={pt.x} cy={pt.y} r="1.5" fill="#22d3ee" />
        </g>
      ))}

      {/* X axis labels */}
      {data.map((item, i) => {
        const x = PAD_L + (i / (data.length - 1)) * plotW;
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={CHART_H - 5}
            textAnchor="middle"
            className="fill-slate-500"
            fontSize="10"
            fontFamily="inherit"
          >
            {item.label}
          </text>
        );
      })}
    </svg>
  );
}
