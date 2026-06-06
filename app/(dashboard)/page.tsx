import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { StatsCard } from "@/components/shared/StatsCard";
import { VisitAreaChart } from "@/components/shared/VisitAreaChart";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Stethoscope,
  Calendar,
  TestTube,
  Plus,
  ChevronRight,
  BarChart3,
  UserPlus,
  CalendarPlus,
  Microscope,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

/* ────────────────────────────────────────────────────────
   Dashboard Page — Hospital Management System
   Layout: Header → Stats Grid → [Chart + Quick Actions]
                                → [Recent Visits + Examinations]
   ──────────────────────────────────────────────────────── */

/** Status badge colour map */
const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  PENDING: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  IN_PROGRESS: {
    badge: "bg-sky-500/15 text-sky-400 border-sky-500/20",
    dot: "bg-sky-400 animate-pulse",
  },
  COMPLETED: {
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  CANCELLED: {
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    dot: "bg-rose-400",
  },
};

export default async function DashboardPage() {
  const session = await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);

  /* ── Data fetching ──────────────────────────────────── */

  const [totalPatients, totalDoctors, todayVisits, pendingExams] =
    await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.doctor.count({ where: { isActive: true } }),
      prisma.visit.count({
        where: {
          visitDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.visitExam.count({ where: { status: "PENDING" } }),
    ]);

  const recentVisits = await prisma.visit.findMany({
    take: 5,
    orderBy: { visitDate: "desc" },
    include: {
      patient: true,
      doctors: { include: { doctor: true } },
    },
  });

  // Last 7 days visit counts for the area chart
  const last7Days = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    })
    .reverse();

  const visitCounts = await Promise.all(
    last7Days.map(async (date) => {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const count = await prisma.visit.count({
        where: { visitDate: { gte: date, lt: nextDate } },
      });
      return {
        label:
          lang === "ar"
            ? date.toLocaleDateString("ar-IQ", { weekday: "short" })
            : date.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      };
    }),
  );

  /* ── Render ─────────────────────────────────────────── */

  return (
    <div className="space-y-7 relative">
      {/* Ambient glow orbs */}
      <div
        className="dashboard-glow-orb w-[800px] h-[800px] -top-64 -left-64"
        style={{ "--orb-color": "rgba(6,182,212,0.6)" } as React.CSSProperties}
      />
      <div
        className="dashboard-glow-orb w-[700px] h-[700px] top-1/4 -right-48"
        style={
          {
            "--orb-color": "rgba(167,139,250,0.5)",
            animationDelay: "3s",
          } as React.CSSProperties
        }
      />

      {/* ─── Header ─────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t.auth.welcomeBack},{" "}
            <span className="text-cyan-400 font-semibold">
              {session.username}
            </span>
            !
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="border-teal-500/50 bg-transparent hover:bg-teal-500/10 text-teal-400 hover:text-teal-300 rounded-xl h-9 px-4 cursor-pointer transition-colors"
          >
            <Link href="/visits/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-semibold">
                {t.dashboard.newVisit}
              </span>
            </Link>
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white rounded-xl h-9 px-4 shadow-lg shadow-cyan-900/40 cursor-pointer btn-premium-glow border-0"
          >
            <Link href="/patients/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {t.dashboard.newPatient}
              </span>
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── Stats Cards ────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="animate-fade-up animate-delay-1">
          <StatsCard
            title={t.dashboard.totalPatients}
            value={totalPatients}
            icon={Users}
            variant="cyan"
          />
        </div>
        <div className="animate-fade-up animate-delay-2">
          <StatsCard
            title={t.dashboard.totalDoctors}
            value={totalDoctors}
            icon={Stethoscope}
            variant="emerald"
          />
        </div>
        <div className="animate-fade-up animate-delay-3">
          <StatsCard
            title={t.dashboard.todayVisits}
            value={todayVisits}
            icon={Calendar}
            variant="purple"
          />
        </div>
        <div className="animate-fade-up animate-delay-4">
          <StatsCard
            title={t.dashboard.pendingExams}
            value={pendingExams}
            icon={TestTube}
            variant="amber"
          />
        </div>
      </section>

      {/* ─── Chart + Quick Actions Row ──────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 glass-panel-premium rounded-2xl p-7 animate-fade-up animate-delay-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
            </div>
            <h2 className="text-sm font-bold text-slate-200 tracking-wide">
              {lang === "ar"
                ? "الزيارات (آخر 7 أيام)"
                : "Visits (Last 7 Days)"}
            </h2>
          </div>
          <VisitAreaChart data={visitCounts} lang={lang} />
        </div>

        {/* Quick Actions */}
        <div className="glass-panel-premium rounded-2xl p-7 animate-fade-up animate-delay-5 flex flex-col">
          <h2 className="text-sm font-bold text-slate-200 tracking-wide mb-6">
            {t.dashboard.quickActions}
          </h2>

          {/* Two action cards side by side */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <QuickActionCard
              href="/patients/new"
              icon={UserPlus}
              label={t.dashboard.newPatient}
              description={
                lang === "ar"
                  ? "إنشاء ملف مريض جديد"
                  : "Register a new patient"
              }
              buttonLabel={t.dashboard.newPatient}
              color="cyan"
            />
            <QuickActionCard
              href="/visits/new"
              icon={CalendarPlus}
              label={t.dashboard.newVisit}
              description={
                lang === "ar"
                  ? "تسجيل موعد كشف طبي"
                  : "Schedule a new appointment"
              }
              buttonLabel={t.dashboard.newVisit}
              color="teal"
            />
          </div>

          {/* Examinations card */}
          <Link
            href="/examinations"
            className="flex-1 flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-300 group"
          >
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(167,139,250,0.1)]">
              <Microscope className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-200">
                {t.nav.examinations}
              </h4>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {lang === "ar"
                  ? "إدارة الفحوصات والنتائج"
                  : "Manage exams and results"}
              </p>
            </div>
            <Button
              size="sm"
              className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs rounded-lg px-3 h-8 cursor-pointer shrink-0 transition-colors"
            >
              {t.nav.examinations}
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Recent Visits Table ─────────────────────── */}
      <section className="glass-panel-premium rounded-2xl p-7 animate-fade-up animate-delay-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <Calendar className="h-5 w-5 text-teal-400" />
            </div>
            <h2 className="text-sm font-bold text-slate-200 tracking-wide">
              {t.dashboard.recentVisits}
            </h2>
          </div>
          <Link
            href="/visits"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 font-semibold transition-colors"
          >
            {t.dashboard.viewAll}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {recentVisits.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="font-medium">{t.visits.noVisits}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold text-xs bg-white/[0.02] rounded-l-lg h-10">
                    {t.visits.patient}
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold text-xs bg-white/[0.02] h-10">
                    {t.visits.visitDate}
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold text-xs bg-white/[0.02] h-10">
                    {t.visits.doctors}
                  </TableHead>
                  <TableHead className="text-slate-400 font-bold text-xs text-center bg-white/[0.02] rounded-r-lg h-10">
                    {t.visits.status}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentVisits.map((visit) => {
                  const s =
                    STATUS_STYLES[visit.status] ?? STATUS_STYLES.PENDING;
                  return (
                    <TableRow
                      key={visit.id}
                      className="border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell className="font-semibold text-slate-200 py-3">
                        <Link
                          href={`/patients/${visit.patientId}`}
                          className="hover:text-cyan-400 transition-colors"
                        >
                          {visit.patient.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs font-mono py-3">
                        {formatDate(
                          visit.visitDate,
                          lang === "ar" ? "ar-IQ" : "en-US",
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs py-3">
                        {visit.doctors
                          .map((d) => d.doctor.fullName)
                          .join("، ") || "—"}
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <Badge
                          className={`rounded-full px-3 py-1 border-0 text-xs font-semibold inline-flex items-center gap-1.5 ${s.badge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`}
                          />
                          {t.status[visit.status as keyof typeof t.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   QuickActionCard — Matches reference design: icon, text,
   CTA button inside a mini card.
   ──────────────────────────────────────────────────────── */

function QuickActionCard({
  href,
  icon: Icon,
  label,
  description,
  buttonLabel,
  color,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  buttonLabel: string;
  color: "cyan" | "teal";
}) {
  const colors = {
    cyan: {
      iconBg: "bg-cyan-500/10 text-cyan-400",
      btn: "bg-cyan-600 hover:bg-cyan-500",
    },
    teal: {
      iconBg: "bg-teal-500/10 text-teal-400",
      btn: "bg-teal-600 hover:bg-teal-500",
    },
  };
  const c = colors[color];

  return (
    <Link
      href={href}
      className="flex flex-col items-center text-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all duration-300 group"
    >
      <div
        className={`p-3 rounded-xl ${c.iconBg} mb-4 group-hover:scale-105 transition-transform shadow-[0_0_12px_currentColor] opacity-90`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h4 className="text-sm font-bold text-slate-200 mb-1.5">{label}</h4>
      <p className="text-[11px] text-slate-400 leading-relaxed mb-4 line-clamp-2">
        {description}
      </p>
      <span
        className={`text-xs font-semibold text-white px-4 py-1.5 rounded-lg ${c.btn} transition-colors btn-premium-glow`}
      >
        {buttonLabel}
      </span>
    </Link>
  );
}
