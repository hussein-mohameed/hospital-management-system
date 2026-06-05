import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft, Stethoscope, Phone, Mail, User,
  Calendar, Activity, Edit, Plus, ArrowUpRight, Clock
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getInitials } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export default async function DoctorProfilePage({ params }: { params: Params }) {
  await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);
  const { id } = await params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      user: true,
      visits: {
        orderBy: { visit: { visitDate: "desc" } },
        take: 10,
        include: {
          visit: {
            include: { patient: true },
          },
        },
      },
      _count: { select: { visits: true } },
    },
  });

  if (!doctor) notFound();

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
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <Link href="/doctors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-teal-500/20">
              <AvatarFallback className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white text-lg font-bold">
                {getInitials(doctor.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {doctor.fullName}
                </h1>
                <Badge className={`rounded-full px-2.5 py-0.5 border font-bold text-xs ${
                  doctor.isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-slate-800 text-slate-500 border-slate-700"
                }`}>
                  {doctor.isActive ? t.doctors.active : t.doctors.inactive}
                </Badge>
              </div>
              <p className="text-sm text-teal-400 font-semibold mt-0.5 flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5" />
                {doctor.specialty}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl cursor-pointer">
            <Link href={`/doctors/${doctor.id}/edit`} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>{t.common.edit}</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info Cards */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                {lang === "ar" ? "معلومات الاتصال" : "Contact Info"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-600" />
                  {t.doctors.email}
                </span>
                <span className="text-slate-200 font-mono text-xs">{doctor.user.email}</span>
              </div>
              {doctor.phone && (
                <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-600" />
                    {t.doctors.phone}
                  </span>
                  <span className="text-slate-200 font-mono">{doctor.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-600" />
                  {t.doctors.username}
                </span>
                <span className="text-slate-200 font-mono text-xs bg-slate-950/40 px-2 py-0.5 border border-slate-800 rounded-md">
                  @{doctor.user.username}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400 animate-pulse" />
                {lang === "ar" ? "الإحصائيات" : "Statistics"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-2">
                <p className="text-4xl font-extrabold text-teal-400 font-mono">{doctor._count.visits}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">{t.doctors.totalPatients}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>{t.common.dateCreated}</span>
                  <span className="font-mono text-slate-400">{formatDate(doctor.createdAt, lang === "ar" ? "ar-IQ" : "en-US")}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === "ar" ? "الصلاحية" : "Role"}</span>
                  <span className="text-teal-400 font-bold">{t.common.role.DOCTOR}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Visit History */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl h-full">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  {lang === "ar" ? "سجل الزيارات" : "Visit History"}
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 cursor-pointer text-xs gap-1">
                  <Link href={`/visits`}>
                    {lang === "ar" ? "عرض الكل" : "View All"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {doctor.visits.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">
                    {lang === "ar" ? "لا توجد زيارات مسجلة لهذا الطبيب" : "No visits recorded for this doctor"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {doctor.visits.map((vd) => (
                    <Link
                      key={vd.visitId}
                      href={`/visits/${vd.visitId}`}
                      className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {vd.visit.patient.fullName}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">{vd.visit.chiefComplaint}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <Badge className={`rounded-lg px-2 py-0.5 border font-bold text-[9px] ${statusColors[vd.visit.status]}`}>
                            {t.status[vd.visit.status as keyof typeof t.status]}
                          </Badge>
                          <p className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />
                            {formatDate(vd.visit.visitDate, lang === "ar" ? "ar-IQ" : "en-US")}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </Link>
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
