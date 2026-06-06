import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { StatsCard } from "@/components/shared/StatsCard";
import { VisitBarChart } from "@/components/shared/VisitBarChart";
import { Users, Stethoscope, Calendar, TestTube, Plus, ArrowUpRight, BarChart, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);

  // Fetch real-time metrics
  const [totalPatients, totalDoctors, todayVisits, pendingExams] = await Promise.all([
    prisma.patient.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.visit.count({
      where: {
        visitDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.visitExam.count({ where: { status: "PENDING" } }),
  ]);

  // Fetch recent visits
  const recentVisits = await prisma.visit.findMany({
    take: 5,
    orderBy: { visitDate: "desc" },
    include: {
      patient: true,
      doctors: {
        include: {
          doctor: true,
        },
      },
    },
  });

  // Fetch data for bar chart (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const visitCounts = await Promise.all(
    last7Days.map(async (date) => {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const count = await prisma.visit.count({
        where: {
          visitDate: {
            gte: date,
            lt: nextDate,
          },
        },
      });
      return {
        label: lang === "ar" 
          ? date.toLocaleDateString("ar-IQ", { weekday: "short" })
          : date.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      };
    })
  );

  const statusStyles: Record<string, { badge: string; dot: string }> = {
    PENDING: {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/15 backdrop-blur-sm",
      dot: "bg-amber-400",
    },
    IN_PROGRESS: {
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/15 backdrop-blur-sm",
      dot: "bg-cyan-400 animate-pulse",
    },
    COMPLETED: {
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15 backdrop-blur-sm",
      dot: "bg-emerald-400",
    },
    CANCELLED: {
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/15 backdrop-blur-sm",
      dot: "bg-rose-400",
    },
  };

  return (
    <div className="space-y-8 relative">
      {/* ════ Ambient Background Glow Orbs ════ */}
      <div className="glow-orb glow-orb-cyan w-[600px] h-[600px] -top-60 -left-60 fixed" />
      <div className="glow-orb glow-orb-purple w-[500px] h-[500px] top-1/3 -right-48 fixed" style={{ animationDelay: "3s" }} />
      <div className="glow-orb glow-orb-teal w-[450px] h-[450px] bottom-0 left-1/4 fixed" style={{ animationDelay: "1.5s" }} />

      {/* ════ Header Greeting ════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/15">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {t.dashboard.title}
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-400 mt-1.5">
            {t.auth.welcomeBack}، {session.username} 👋
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex items-center gap-3">
          <Button asChild className="glass-card !border-slate-700/40 hover:!border-cyan-500/25 text-slate-200 font-semibold rounded-xl cursor-pointer h-10 px-4">
            <Link href="/visits/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-cyan-400" />
              <span>{t.dashboard.newVisit}</span>
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-xl cursor-pointer shadow-lg shadow-cyan-500/20 h-10 px-4">
            <Link href="/patients/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>{t.dashboard.newPatient}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ════ Statistics Metric Cards Grid ════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-fade-up animate-delay-100">
          <StatsCard
            title={t.dashboard.totalPatients}
            value={totalPatients}
            description={t.dashboard.activePatients}
            icon={Users}
            variant="cyan"
          />
        </div>
        <div className="animate-fade-up animate-delay-200">
          <StatsCard
            title={t.dashboard.totalDoctors}
            value={totalDoctors}
            description={t.dashboard.activeDoctors}
            icon={Stethoscope}
            variant="emerald"
          />
        </div>
        <div className="animate-fade-up animate-delay-300">
          <StatsCard
            title={t.dashboard.todayVisits}
            value={todayVisits}
            description={t.dashboard.recentVisits}
            icon={Calendar}
            variant="purple"
          />
        </div>
        <div className="animate-fade-up animate-delay-400">
          <StatsCard
            title={t.dashboard.pendingExams}
            value={pendingExams}
            description={t.dashboard.pendingExams}
            icon={TestTube}
            variant="amber"
          />
        </div>
      </div>

      {/* ════ Main Grid: Chart + Table + Quick Actions ════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Chart & Table) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Weekly Chart — Glass Panel */}
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden animate-fade-up animate-delay-300">
            {/* Glow orb behind chart */}
            <div className="glow-orb glow-orb-purple w-56 h-56 -top-20 -right-8" style={{ animationDelay: "2s" }} />
            
            {/* Inner frost reflection */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center mb-6 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/15">
                  <BarChart className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  {lang === "ar" ? "الزيارات (آخر 7 أيام)" : "Visits (Last 7 Days)"}
                </h3>
              </div>
            </div>
            <div className="relative z-10">
              <VisitBarChart data={visitCounts} lang={lang} />
            </div>
          </div>

          {/* Recent Visits Table — Glass Panel */}
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden animate-fade-up animate-delay-400">
            {/* Glow orb behind table */}
            <div className="glow-orb glow-orb-cyan w-52 h-52 -bottom-16 -left-16" style={{ animationDelay: "4s" }} />

            {/* Inner frost reflection */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/15">
                  <Calendar className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">
                  {t.dashboard.recentVisits}
                </h3>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-semibold cursor-pointer rounded-xl">
                <Link href="/visits" className="flex items-center gap-1">
                  <span>{t.dashboard.viewAll}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="overflow-x-auto relative z-10">
              {recentVisits.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-medium">
                  <div className="p-4 rounded-2xl bg-slate-800/20 inline-block mb-3">
                    <Calendar className="h-8 w-8 text-slate-600" />
                  </div>
                  <p>{t.visits.noVisits}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="border-slate-800/40">
                    <TableRow className="border-slate-800/40 hover:bg-transparent">
                      <TableHead className="text-slate-400 font-bold text-xs uppercase tracking-wider">{t.visits.patient}</TableHead>
                      <TableHead className="text-slate-400 font-bold text-xs uppercase tracking-wider">{t.visits.visitDate}</TableHead>
                      <TableHead className="text-slate-400 font-bold text-xs uppercase tracking-wider">{t.visits.doctors}</TableHead>
                      <TableHead className="text-slate-400 font-bold text-xs uppercase tracking-wider text-center">{t.visits.status}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentVisits.map((visit) => {
                      const statusStyle = statusStyles[visit.status] || statusStyles.PENDING;
                      return (
                        <TableRow key={visit.id} className="border-slate-800/30 glass-table-row">
                          <TableCell className="font-semibold text-slate-200">
                            <Link href={`/patients/${visit.patientId}`} className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/10 flex items-center justify-center shrink-0">
                                <Users className="h-3.5 w-3.5 text-cyan-400" />
                              </div>
                              <span>{visit.patient.fullName}</span>
                            </Link>
                          </TableCell>
                          <TableCell className="text-slate-400 font-mono text-xs">
                            {formatDate(visit.visitDate, lang === "ar" ? "ar-IQ" : "en-US")}
                          </TableCell>
                          <TableCell className="text-slate-400 text-xs font-medium">
                            {visit.doctors.map((d) => d.doctor.fullName).join("، ") || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`rounded-lg px-3 py-1.5 border font-semibold text-xs inline-flex items-center gap-1.5 ${statusStyle.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
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
          </div>
        </div>

        {/* ════ Quick Menu — Glass Panel ════ */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between animate-fade-up animate-delay-500">
          {/* Glow orb */}
          <div className="glow-orb glow-orb-teal w-48 h-48 -top-16 -right-16" style={{ animationDelay: "1s" }} />

          {/* Inner frost reflection */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/15">
                <Zap className="h-5 w-5 text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                {t.dashboard.quickActions}
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* New Patient */}
              <Link
                href="/patients/new"
                className="quick-action-glass flex items-center justify-between p-4 rounded-2xl group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/15 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{t.dashboard.newPatient}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">تسجيل مريض جديد في النظام</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              {/* New Visit */}
              <Link
                href="/visits/new"
                className="quick-action-glass flex items-center justify-between p-4 rounded-2xl group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/15 text-teal-400 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-300">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{t.dashboard.newVisit}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">حجز أو تسجيل موعد كشف طبي</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-teal-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              {/* Examinations */}
              <Link
                href="/examinations"
                className="quick-action-glass flex items-center justify-between p-4 rounded-2xl group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/15 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                    <TestTube className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{t.nav.examinations}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">إدارة وإدخال نتائج الفحوصات</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-purple-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
