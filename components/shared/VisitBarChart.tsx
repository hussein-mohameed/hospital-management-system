"use client";

import { useEffect, useRef } from "react";

interface VisitBarChartProps {
  data: { label: string; count: number }[];
  lang: string;
}

const BAR_COLORS = [
  "#06b6d4", "#0891b2", "#0e7490", "#06b6d4",
  "#22d3ee", "#67e8f9", "#a5f3fc",
];

export function VisitBarChart({ data, lang }: VisitBarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500 w-12 shrink-0 text-right">
            {item.label}
          </span>
          <div className="flex-1 h-6 bg-slate-800/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(item.count / max) * 100}%`,
                background: `linear-gradient(90deg, ${BAR_COLORS[i % BAR_COLORS.length]}cc, ${BAR_COLORS[(i + 2) % BAR_COLORS.length]})`,
                minWidth: item.count > 0 ? "1.5rem" : "0",
              }}
            />
          </div>
          <span className="text-xs font-extrabold font-mono text-slate-300 w-6 shrink-0">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}
