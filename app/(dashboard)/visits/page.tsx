import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Plus, Clock, FileText, User, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { formatDate } from "@/lib/utils";
import { VisitStatus } from "@prisma/client";

type SearchParams = Promise<{ status?: string; page?: string }>;

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);

  // Await searchParams Promise (Next.js 16)
  const { status, page } = await searchParams;
  const activeTab = status || "ALL";
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = 10;

  // Build query
  const queryWhere = activeTab !== "ALL" ? { status: activeTab as VisitStatus } : {};

  // Get total count for pagination
  const totalCount = await prisma.visit.count({ where: queryWhere });
  const totalPages = Math.ceil(totalCount / pageSize);

  // Fetch visits
  const visits = await prisma.visit.findMany({
    where: queryWhere,
    orderBy: { visitDate: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    include: {
      patient: true,
      doctors: {
        include: {
          doctor: true,
        },
      },
    },
  });

  const tabs = [
    { value: "ALL", label: t.common.all },
    { value: "PENDING", label: t.status.PENDING },
    { value: "IN_PROGRESS", label: t.status.IN_PROGRESS },
    { value: "COMPLETED", label: t.status.COMPLETED },
    { value: "CANCELLED", label: t.status.CANCELLED },
  ];

  const statusColors = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    IN_PROGRESS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t.visits.title}
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            مواعيد الكشوفات الطبية وجلسات المتابعة | Patient appointments and sessions
          </p>
        </div>

        <Button asChild className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-xl cursor-pointer">
          <Link href="/visits/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <span>{t.visits.addVisit}</span>
          </Link>
        </Button>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value === "ALL" ? "/visits" : `/visits?status=${tab.value}`}
              className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Visits Cards Registry */}
      {visits.length === 0 ? (
        <EmptyState
          title={t.visits.noVisits}
          description="لا توجد زيارات طبية مسجلة في هذا القسم حالياً."
          icon={Calendar}
          actionLabel={t.visits.addVisit}
          actionHref="/visits/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visits.map((visit) => (
            <Card
              key={visit.id}
              className="bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl rounded-3xl relative overflow-hidden group transition-all duration-300"
            >
              <CardContent className="p-6 space-y-4">
                {/* Header Block: Status & Date */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2 text-slate-400 font-bold font-mono text-xs">
                    <Clock className="h-4 w-4 text-cyan-400 animate-pulse" />
                    <span>{formatDate(visit.visitDate, lang === "ar" ? "ar-IQ" : "en-US")}</span>
                  </div>
                  <Badge className={`rounded-lg px-2.5 py-0.5 border font-semibold text-[10px] ${statusColors[visit.status]}`}>
                    {t.status[visit.status as keyof typeof t.status]}
                  </Badge>
                </div>

                {/* Body Block: Patient, Doctors, Chief Complaint */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">
                      {t.visits.patient}
                    </span>
                    <Link
                      href={`/patients/${visit.patientId}`}
                      className="text-base font-extrabold text-slate-100 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-600" />
                      <span>{visit.patient.fullName}</span>
                    </Link>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">
                      {t.visits.chiefComplaint}
                    </span>
                    <p className="text-sm font-semibold text-slate-300 line-clamp-2">
                      {visit.chiefComplaint}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">
                      {t.visits.doctors}
                    </span>
                    <p className="text-xs font-semibold text-teal-400">
                      {visit.doctors.map((d) => d.doctor.fullName).join("، ") || "—"}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-800/60 pt-1" />

                {/* Footer Action Button */}
                <div className="flex justify-end">
                  <Button asChild variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer gap-1">
                    <Link href={`/visits/${visit.id}`}>
                      <span>{t.visits.visitDetail}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {visits.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          lang={lang}
        />
      )}
    </div>
  );
}
