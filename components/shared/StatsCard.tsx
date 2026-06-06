import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────
   StatsCard — Premium Dark Glassmorphism Design
   Deep glass panels with subtle 1px border highlights, 
   glowing text, and a sleek layout.
   ──────────────────────────────────────────────────────── */

type Variant = "cyan" | "emerald" | "purple" | "amber";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: Variant;
};

const VARIANT_CONFIG: Record<Variant, { 
  iconColor: string; 
  iconGlow: string;
  textGlow: string;
  gradientLine: string;
}> = {
  cyan: {
    iconColor: "text-cyan-400",
    iconGlow: "drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]",
    textGlow: "drop-shadow-[0_0_16px_rgba(34,211,238,0.3)]",
    gradientLine: "from-cyan-500/0 via-cyan-400/50 to-cyan-500/0",
  },
  emerald: {
    iconColor: "text-emerald-400",
    iconGlow: "drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]",
    textGlow: "drop-shadow-[0_0_16px_rgba(52,211,153,0.3)]",
    gradientLine: "from-emerald-500/0 via-emerald-400/50 to-emerald-500/0",
  },
  purple: {
    iconColor: "text-purple-400",
    iconGlow: "drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]",
    textGlow: "drop-shadow-[0_0_16px_rgba(167,139,250,0.3)]",
    gradientLine: "from-purple-500/0 via-purple-400/50 to-purple-500/0",
  },
  amber: {
    iconColor: "text-amber-400",
    iconGlow: "drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]",
    textGlow: "drop-shadow-[0_0_16px_rgba(251,191,36,0.3)]",
    gradientLine: "from-amber-500/0 via-amber-400/50 to-amber-500/0",
  },
};

export function StatsCard({ title, value, icon: Icon, variant = "cyan" }: StatsCardProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "glass-panel-premium group cursor-default",
      )}
    >
      {/* Top subtle gradient highlight line */}
      <div 
        className={cn(
          "absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r opacity-50",
          config.gradientLine
        )} 
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-400 tracking-wide">{title}</p>
          <h3 
            className={cn(
              "text-4xl font-extrabold text-white tracking-tight",
              config.textGlow
            )}
          >
            {value}
          </h3>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.06] transition-colors duration-300">
          <Icon 
            className={cn("h-7 w-7", config.iconColor, config.iconGlow)} 
            strokeWidth={1.5} 
          />
        </div>
      </div>
    </div>
  );
}
