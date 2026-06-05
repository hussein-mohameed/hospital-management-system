import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, User, Calendar, Stethoscope } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";

export default async function ReportsPage() {
  await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);

  // Fetch reports along with visit, patient and doctors relations
  const reports = await prisma.report.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      visit: {
        include: {
          patient: true,
          doctors: {
            include: {
              doctor: true,
            },
          },
        },
      },
    },
  });

  const caseColors = {
    OPEN: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    TREATED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    FOLLOW_UP: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    CLOSED: "bg-slate-800 text-slate-500 border-slate-700",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {t.reports.title}
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          الأضابير والتقارير الطبية المفصلة لحالات المرضى | Medical dossier and clinical reports archive
        </p>
      </div>

      {/* Reports Registry */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {reports.length === 0 ? (
          <EmptyState
            title={t.reports.noReports}
            description="لا توجد أي تقارير طبية منشأة في الأرشيف حالياً."
            icon={FileText}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold">{t.visits.patient}</TableHead>
                  <TableHead className="text-slate-400 font-bold">{t.visits.doctors}</TableHead>
                  <TableHead className="text-slate-400 font-bold">{t.reports.content}</TableHead>
                  <TableHead className="text-slate-400 font-bold">{t.visits.visitDate}</TableHead>
                  <TableHead className="text-slate-400 font-bold text-center">{t.reports.status}</TableHead>
                  <TableHead className="text-slate-400 font-bold text-center">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className="border-slate-800/60 hover:bg-slate-950/20">
                    {/* Patient */}
                    <TableCell className="font-extrabold text-slate-200">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-600 shrink-0" />
                        <Link href={`/patients/${report.visit.patientId}`} className="hover:text-cyan-400 transition-colors">
                          {report.visit.patient.fullName}
                        </Link>
                      </div>
                    </TableCell>

                    {/* Doctors */}
                    <TableCell className="text-slate-400 font-semibold text-xs">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-slate-600 shrink-0" />
                        <span>{report.visit.doctors.map((d) => d.doctor.fullName).join("، ") || "—"}</span>
                      </div>
                    </TableCell>

                    {/* Content snippet */}
                    <TableCell className="text-slate-300 max-w-xs truncate font-semibold text-xs leading-relaxed">
                      {report.content}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-slate-400 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-600 shrink-0" />
                        <span>{formatDate(report.visit.visitDate, lang === "ar" ? "ar-IQ" : "en-US")}</span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge className={`rounded-lg px-2.5 py-0.5 border font-semibold text-[10px] ${caseColors[report.status]}`}>
                        {t.status[report.status as keyof typeof t.status]}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                          <Link href={`/visits/${report.visitId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
