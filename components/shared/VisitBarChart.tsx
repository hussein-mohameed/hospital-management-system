"use client";

interface VisitBarChartProps {
  data: { label: string; count: number }[];
  lang: string;
}

const BAR_GRADIENTS = [
  { from: "#06b6d4", to: "#0d9488" },   // cyan -> teal
  { from: "#0891b2", to: "#0e7490" },   // darker cyan
  { from: "#14b8a6", to: "#059669" },   // teal -> emerald
  { from: "#06b6d4", to: "#3b82f6" },   // cyan -> blue
  { from: "#22d3ee", to: "#06b6d4" },   // light cyan
  { from: "#0ea5e9", to: "#06b6d4" },   // sky -> cyan
  { from: "#14b8a6", to: "#06b6d4" },   // teal -> cyan
];

export function VisitBarChart({ data, lang }: VisitBarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3.5">
      {data.map((item, i) => {
        const grad = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
        const pct = (item.count / max) * 100;

        return (
          <div key={i} className="flex items-center gap-3 group">
            <span className="text-xs font-mono text-slate-500 w-12 shrink-0 text-right group-hover:text-slate-300 transition-colors">
              {item.label}
            </span>
            <div className="flex-1 h-7 bg-slate-800/40 rounded-full overflow-hidden relative">
              {/* Subtle inner track glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-800/20 to-transparent" />
              <div
                className="h-full rounded-full relative transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${grad.from}, ${grad.to})`,
                  minWidth: item.count > 0 ? "2rem" : "0",
                  boxShadow: item.count > 0
                    ? `0 0 16px -4px ${grad.from}66, 0 0 6px -2px ${grad.from}44`
                    : "none",
                }}
              >
                {/* Shimmer overlay on bar */}
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
                    backgroundSize: "200% 100%",
                    animation: "shimmer-slide 3s linear infinite",
                  }}
                />
              </div>
            </div>
            <span className="text-xs font-extrabold font-mono text-slate-300 w-7 shrink-0 text-center group-hover:text-white transition-colors">
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
