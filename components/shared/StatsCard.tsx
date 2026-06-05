import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
      glow: "shadow-cyan-500/5",
      gradient: "from-cyan-500 to-teal-500",
    },
    emerald: {
      bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      glow: "shadow-emerald-500/5",
      gradient: "from-emerald-500 to-teal-500",
    },
    purple: {
      bg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      glow: "shadow-purple-500/5",
      gradient: "from-purple-500 to-indigo-500",
    },
    amber: {
      bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      glow: "shadow-amber-500/5",
      gradient: "from-amber-500 to-orange-500",
    },
    rose: {
      bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
      glow: "shadow-rose-500/5",
      gradient: "from-rose-500 to-pink-500",
    },
  };

  const style = variantStyles[variant];

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-slate-900 border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group",
        style.glow
      )}
    >
      {/* Decorative Gradient Background Blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-800 to-transparent opacity-30 rounded-bl-full pointer-events-none" />

      <CardContent className="p-6 flex items-center justify-between gap-4">
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">
            {value}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 font-medium">{description}</p>
          )}
        </div>

        <div
          className={cn(
            "p-3 rounded-2xl border transition-transform duration-300 group-hover:scale-110",
            style.bg
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>

      {/* Thin Bottom Accent Line */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r", style.gradient)} />
    </Card>
  );
}
