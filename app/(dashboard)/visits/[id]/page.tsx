import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, User, Stethoscope, FlaskConical,
  FileText, ClipboardList, Activity, Clock, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { VisitStatusButtons } from "@/components/visits/VisitStatusButtons";
import { ExamResultForm } from "@/components/visits/ExamResultForm";
import { ReportForm } from "@/components/visits/ReportForm";

type Params = Promise<{ id: string }>;

export default async function VisitDetailPage({ params }: { params: Params }) {
  await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);
  const { id } = await params;

  const visit = await prisma.visit.findUnique({
    where: { id },
    include: {
      patient: true,
      doctors: { include: { doctor: true } },
      examinations: {
        include: { examination: true },
      },
      report: true,
    },
  });

  if (!visit) notFound();

  const statusColors = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    IN_PROGRESS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  const completedExams = visit.examinations.filter((e) => e.status === "COMPLETED").length;
  const totalExams = visit.examinations.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <Link href="/visits">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {lang === "ar" ? "زيارة" : "Visit"} — {visit.patient.fullName}
              </h1>
              <Badge className={`rounded-lg px-2.5 py-0.5 border font-bold text-xs ${statusColors[visit.status]}`}>
                {t.status[visit.status as keyof typeof t.status]}
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1 font-mono flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(visit.visitDate, lang === "ar" ? "ar-IQ" : "en-US")}
            </p>
          </div>
        </div>
        <VisitStatusButtons visitId={visit.id} currentStatus={visit.status} lang={lang} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Patient Card */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                {t.visits.patient}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Link href={`/patients/${visit.patient.id}`} className="block group">
                <p className="text-base font-extrabold text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {visit.patient.fullName}
                </p>
              </Link>
              <div className="text-xs text-slate-500 space-y-1.5">
                <p><span className="text-slate-600">{t.patients.phone}: </span>
                  <span className="text-slate-300 font-mono">{visit.patient.phone}</span></p>
                <p><span className="text-slate-600">{t.patients.region}: </span>
                  <span className="text-slate-300">{visit.patient.region}</span></p>
              </div>
            </CardContent>
          </Card>

          {/* Doctors Card */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-teal-400" />
                {t.visits.doctors}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {visit.doctors.length === 0 ? (
                <p className="text-sm text-slate-500">—</p>
              ) : (
                <ul className="space-y-3">
                  {visit.doctors.map((vd) => (
                    <li key={vd.doctorId} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs shrink-0">
                        {vd.doctor.fullName.charAt(2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">{vd.doctor.fullName}</p>
                        <p className="text-xs text-slate-500">{vd.doctor.specialty}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Complaint & Notes Card */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-purple-400" />
                {t.visits.chiefComplaint}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-bold">{t.visits.chiefComplaint}</p>
                <p className="text-sm font-semibold text-slate-200 leading-relaxed">{visit.chiefComplaint}</p>
              </div>
              {visit.notes && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5 font-bold">{t.visits.notes}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{visit.notes}</p>
                </div>
              )}
              {visit.diagnosis && (
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 mb-1.5 font-bold">{t.visits.diagnosis}</p>
                  <p className="text-sm font-semibold text-teal-300 leading-relaxed">{visit.diagnosis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visit Meta */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-400 animate-pulse" />
                {lang === "ar" ? "معلومات الزيارة" : "Visit Info"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-slate-500 font-bold mb-1">{lang === "ar" ? "تاريخ الموعد" : "Visit Date"}</dt>
                  <dd className="font-mono text-slate-300">{formatDate(visit.visitDate, lang === "ar" ? "ar-IQ" : "en-US")}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-bold mb-1">{lang === "ar" ? "رقم الزيارة" : "Visit ID"}</dt>
                  <dd className="font-mono text-slate-300">{visit.id.substring(0, 8).toUpperCase()}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-bold mb-1">{t.common.dateCreated}</dt>
                  <dd className="font-mono text-slate-300">{formatDate(visit.createdAt, lang === "ar" ? "ar-IQ" : "en-US")}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 font-bold mb-1">{t.common.lastUpdated}</dt>
                  <dd className="font-mono text-slate-300">{formatDate(visit.updatedAt, lang === "ar" ? "ar-IQ" : "en-US")}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Exams + Report */}
        <div className="lg:col-span-2 space-y-6">
          {/* Examinations */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-amber-400" />
                  {t.visits.examinations}
                </CardTitle>
                {totalExams > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: `${(completedExams / totalExams) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {completedExams}/{totalExams}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {visit.examinations.length === 0 ? (
                <div className="py-8 text-center">
                  <FlaskConical className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-medium">
                    {lang === "ar" ? "لا توجد فحوصات مطلوبة لهذه الزيارة" : "No examinations ordered for this visit"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visit.examinations.map((ve) => (
                    <ExamResultForm
                      key={ve.id}
                      visitExamId={ve.id}
                      examName={ve.examination.name}
                      normalRange={ve.examination.normalRange}
                      unit={ve.examination.unit}
                      currentResult={ve.result}
                      isCompleted={ve.status === "COMPLETED"}
                      lang={lang}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Report */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  {t.visits.report}
                </CardTitle>
                {visit.report && (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {lang === "ar" ? "تم الحفظ" : "Saved"}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ReportForm
                visitId={visit.id}
                existingContent={visit.report?.content}
                existingStatus={visit.report?.status}
                lang={lang}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
