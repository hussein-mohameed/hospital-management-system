import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Stethoscope, Plus, Phone, Mail, User, ShieldAlert, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { getInitials } from "@/lib/utils";

export default async function DoctorsPage() {
  await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);

  // Fetch doctors with their related users and visit counts
  const doctors = await prisma.doctor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      _count: {
        select: { visits: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t.doctors.title}
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            الأطباء والمستشارون المتواجدون في المستشفى | Medical consultants and staff
          </p>
        </div>

        <Button asChild className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-semibold rounded-xl cursor-pointer">
          <Link href="/doctors/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <span>{t.doctors.addDoctor}</span>
          </Link>
        </Button>
      </div>

      {doctors.length === 0 ? (
        <EmptyState
          title={t.doctors.noDoctors}
          description="لا يوجد أطباء مسجلون في النظام حالياً. يرجى إضافة الطبيب الأول للبدء."
          icon={Stethoscope}
          actionLabel={t.doctors.addDoctor}
          actionHref="/doctors/new"
        />
      ) : (
        /* Responsive Grid of Consultant Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="bg-slate-900 border-slate-800 shadow-lg relative overflow-hidden rounded-3xl hover:border-slate-700/80 transition-all duration-300 group"
            >
              {/* Accent Accent Top glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-70" />

              <CardHeader className="p-6 pb-4 flex flex-row items-start gap-4">
                <Avatar className="h-14 w-14 border border-teal-500/20 bg-slate-950/40">
                  <AvatarFallback className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white text-base font-bold font-sans">
                    {getInitials(doctor.fullName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-slate-100 group-hover:text-teal-400 transition-colors text-base truncate">
                      {doctor.fullName}
                    </h3>
                    <Badge className={`shrink-0 rounded-full px-2 py-0.5 border font-semibold text-[9px] ${
                      doctor.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}>
                      {doctor.isActive ? t.doctors.active : t.doctors.inactive}
                    </Badge>
                  </div>
                  <p className="text-xs text-teal-400 font-semibold flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span>{doctor.specialty}</span>
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4 text-xs font-semibold text-slate-400">
                <div className="h-px bg-slate-800/60" />

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-600" />
                    <span className="font-mono">{doctor.user.email}</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-600" />
                      <span className="font-mono">{doctor.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-600" />
                    <span className="font-mono text-[10px] bg-slate-950/40 px-2 py-0.5 border border-slate-800 rounded-md">
                      @{doctor.user.username}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-slate-800/60" />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">{t.doctors.totalPatients}</span>
                  <span className="text-sm font-extrabold text-slate-200 bg-slate-950/40 px-2.5 py-1 border border-slate-800/80 rounded-xl font-mono">
                    {doctor._count.visits}
                  </span>
                </div>

                <div className="h-px bg-slate-800/60" />

                <Button asChild variant="ghost" size="sm" className="w-full text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-xl cursor-pointer gap-1.5 justify-center font-bold">
                  <Link href={`/doctors/${doctor.id}`}>
                    <span>{t.doctors.doctorProfile}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
