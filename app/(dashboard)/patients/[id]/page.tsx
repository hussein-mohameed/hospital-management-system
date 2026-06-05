import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MapPin, Mail, Calendar, FileText, Plus, Edit, Activity, HeartPulse } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export default async function PatientProfilePage({
  params,
}: {
  params: Params;
}) {
  await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);

  // Await params (Next.js 16)
  const { id } = await params;

  // Fetch patient profile with complete visit logs
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      visits: {
        orderBy: { visitDate: "desc" },
        include: {
          doctors: {
            include: {
              doctor: true,
            },
          },
        },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  const birthDate = new Date(patient.dateOfBirth);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  const statusColors = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    IN_PROGRESS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Header and Quick Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>{patient.fullName}</span>
              <Badge className={`rounded-full px-2.5 py-0.5 border font-semibold text-[10px] ${
                patient.isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-slate-800 text-slate-500 border-slate-700"
              }`}>
                {patient.isActive ? t.patients.active : t.patients.inactive}
              </Badge>
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {t.patients.patientProfile} | Patient ID: {patient.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl cursor-pointer">
            <Link href={`/patients/${patient.id}/edit`} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>{t.common.edit}</span>
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-xl cursor-pointer">
            <Link href={`/visits/new?patientId=${patient.id}`} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>{t.dashboard.newVisit}</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Demographic Cards */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-5 px-6">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <HeartPulse className="h-4 w-4 text-cyan-400" />
                <span>{t.patients.personalInfo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm font-medium text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-600" />
                  {t.patients.dateOfBirth}
                </span>
                <span className="font-mono text-slate-200">
                  {birthDate.toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-US")} ({age} {t.patients.years})
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <span className="text-slate-500 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-600" />
                  {t.patients.phone}
                </span>
                <span className="font-mono text-slate-200">{patient.phone}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <span className="text-slate-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-600" />
                  {t.patients.region}
                </span>
                <span className="text-slate-200">{patient.region}</span>
              </div>

              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-600" />
                  {t.patients.email}
                </span>
                <span className="text-slate-200 font-mono">{patient.email || "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Description / Clinical Notes Card */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-5 px-6">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-teal-400" />
                <span>{t.patients.medicalNotes}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 leading-relaxed font-semibold">
                {patient.description || "لا توجد ملاحظات طبية خاصة مسجلة لهذا المريض حالياً."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Visit History Timeline */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl h-full flex flex-col">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-5 px-6">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-purple-400 animate-pulse" />
                <span>{t.patients.visitsHistory}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-start">
              {patient.visits.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-16 text-center text-slate-500 font-medium">
                  {t.visits.noVisits}
                </div>
              ) : (
                <div className={`relative ${lang === "ar" ? "border-r pr-6" : "border-l pl-6"} border-slate-800 space-y-8 py-2`}>
                  {patient.visits.map((visit) => (
                    <div key={visit.id} className="relative">
                      {/* Timeline Dot */}
                      <span className={`absolute -top-1 ${
                        lang === "ar" ? "-right-[31px]" : "-left-[31px]"
                      } h-4.5 w-4.5 rounded-full border-2 border-slate-900 bg-cyan-500 shadow-sm shadow-cyan-500/20`} />

                      {/* Timeline Content */}
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/60 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-3">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {formatDate(visit.visitDate, lang === "ar" ? "ar-IQ" : "en-US")}
                          </span>
                          <Badge className={`w-fit rounded-lg px-2 py-0.5 border font-semibold text-[10px] ${statusColors[visit.status]}`}>
                            {t.status[visit.status as keyof typeof t.status]}
                          </Badge>
                        </div>

                        <Link href={`/visits/${visit.id}`} className="block group">
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                            {visit.chiefComplaint}
                          </h4>
                        </Link>

                        {visit.diagnosis && (
                          <p className="text-xs text-slate-400 mt-2 font-medium bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800/40">
                            <strong>{t.visits.diagnosis}:</strong> {visit.diagnosis}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                          <span>{t.visits.doctors}:</span>
                          <span className="text-slate-300">
                            {visit.doctors.map((d) => d.doctor.fullName).join("، ") || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
