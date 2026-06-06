import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: "cyan" | "emerald" | "purple" | "amber" | "rose";
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "cyan",
}: StatsCardProps) {
  const variantStyles = {
    cyan: {
      iconBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
      glowClass: "glow-cyan",
      shimmer: "from-transparent via-cyan-400/60 to-transparent",
      orbClass: "glow-orb-cyan",
      textAccent: "text-cyan-400",
      valueGlow: "drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]",
    },
    emerald: {
      iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      glowClass: "glow-emerald",
      shimmer: "from-transparent via-emerald-400/60 to-transparent",
      orbClass: "glow-orb-emerald",
      textAccent: "text-emerald-400",
      valueGlow: "drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]",
    },
    purple: {
      iconBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      glowClass: "glow-purple",
      shimmer: "from-transparent via-purple-400/60 to-transparent",
      orbClass: "glow-orb-purple",
      textAccent: "text-purple-400",
      valueGlow: "drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]",
    },
    amber: {
      iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      glowClass: "glow-amber",
      shimmer: "from-transparent via-amber-400/60 to-transparent",
      orbClass: "glow-orb-amber",
      textAccent: "text-amber-400",
      valueGlow: "drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]",
    },
    rose: {
      iconBg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      glowClass: "glow-cyan",
      shimmer: "from-transparent via-rose-400/60 to-transparent",
      orbClass: "glow-orb-cyan",
      textAccent: "text-rose-400",
      valueGlow: "drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={cn(
        "glass-card relative overflow-hidden rounded-2xl p-6 group cursor-default",
        style.glowClass
      )}
    >
      {/* Ambient Glow Orb */}
      <div
        className={cn(
          "glow-orb w-40 h-40 -top-12 -right-12",
          style.orbClass
        )}
      />

      {/* Shimmer Top Border */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r shimmer-border",
          style.shimmer
        )}
      />

      {/* Inner Frost Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="space-y-2.5 min-w-0">
          <p className="text-sm font-semibold text-slate-400 truncate">{title}</p>
          <h3
            className={cn(
              "text-3xl font-extrabold text-white tracking-tight",
              style.valueGlow
            )}
          >
            {value}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 font-medium truncate">{description}</p>
          )}
        </div>

        <div
          className={cn(
            "p-3.5 rounded-2xl border transition-all duration-300 group-hover:scale-110 icon-ring-pulse shrink-0",
            style.iconBg
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
