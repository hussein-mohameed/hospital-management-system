import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { StatsCard } from "@/components/shared/StatsCard";
import { VisitBarChart } from "@/components/shared/VisitBarChart";
import { Users, Stethoscope, Calendar, TestTube, Plus, FileText, ArrowUpRight, BarChart } from "lucide-react";
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

  const statusColors = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    IN_PROGRESS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1.5">
            {t.auth.welcomeBack}، {session.username} 👋
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex items-center gap-3">
          <Button asChild className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl cursor-pointer">
            <Link href="/visits/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-cyan-400" />
              <span>{t.dashboard.newVisit}</span>
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-xl cursor-pointer">
            <Link href="/patients/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>{t.dashboard.newPatient}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t.dashboard.totalPatients}
          value={totalPatients}
          description={t.dashboard.activePatients}
          icon={Users}
          variant="cyan"
        />
        <StatsCard
          title={t.dashboard.totalDoctors}
          value={totalDoctors}
          description={t.dashboard.activeDoctors}
          icon={Stethoscope}
          variant="emerald"
        />
        <StatsCard
          title={t.dashboard.todayVisits}
          value={todayVisits}
          description={t.dashboard.recentVisits}
          icon={Calendar}
          variant="purple"
        />
        <StatsCard
          title={t.dashboard.pendingExams}
          value={pendingExams}
          description={t.dashboard.pendingExams}
          icon={TestTube}
          variant="amber"
        />
      </div>

      {/* Main Grid: Recent Activity & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Chart & Table) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Weekly Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-xl">
            <div className="flex items-center mb-6">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BarChart className="h-5 w-5 text-purple-400" />
                <span>{lang === "ar" ? "الزيارات (آخر 7 أيام)" : "Visits (Last 7 Days)"}</span>
              </h3>
            </div>
            <VisitBarChart data={visitCounts} lang={lang} />
          </div>

          {/* Recent Visits Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-400" />
                <span>{t.dashboard.recentVisits}</span>
              </h3>
              <Button asChild variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer">
                <Link href="/visits" className="flex items-center gap-1">
                  <span>{t.dashboard.viewAll}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

          <div className="overflow-x-auto">
            {recentVisits.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-medium">
                {t.visits.noVisits}
              </div>
            ) : (
              <Table>
                <TableHeader className="border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold">{t.visits.patient}</TableHead>
                    <TableHead className="text-slate-400 font-bold">{t.visits.visitDate}</TableHead>
                    <TableHead className="text-slate-400 font-bold">{t.visits.doctors}</TableHead>
                    <TableHead className="text-slate-400 font-bold text-center">{t.visits.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentVisits.map((visit) => (
                    <TableRow key={visit.id} className="border-slate-800/60 hover:bg-slate-950/20">
                      <TableCell className="font-semibold text-slate-200">
                        <Link href={`/patients/${visit.patientId}`} className="hover:text-cyan-400 transition-colors">
                          {visit.patient.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">
                        {formatDate(visit.visitDate, lang === "ar" ? "ar-IQ" : "en-US")}
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs font-medium">
                        {visit.doctors.map((d) => d.doctor.fullName).join("، ") || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`rounded-lg px-2.5 py-1 border font-semibold text-xs ${statusColors[visit.status]}`}>
                          {t.status[visit.status as keyof typeof t.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        </div>

        {/* Quick Menu Card Catalog */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-teal-400" />
              <span>{t.dashboard.quickActions}</span>
            </h3>

            <div className="space-y-4">
              <Link
                href="/patients/new"
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-cyan-500/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{t.dashboard.newPatient}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">تسجيل مريض جديد في النظام</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </Link>

              <Link
                href="/visits/new"
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-teal-500/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{t.dashboard.newVisit}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">حجز أو تسجيل موعد كشف طبي</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-teal-400 transition-colors" />
              </Link>

              <Link
                href="/examinations"
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-purple-500/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                    <TestTube className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{t.nav.examinations}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">إدارة وإدخال نتائج الفحوصات</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
