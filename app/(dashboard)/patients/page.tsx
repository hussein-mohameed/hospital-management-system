import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, User, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";

type SearchParams = Promise<{ query?: string; page?: string }>;

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);

  // Await searchParams Promise (Next.js 16)
  const { query, page } = await searchParams;
  const searchString = query || "";
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = 10;

  const whereClause = {
    OR: [
      { fullName: { contains: searchString, mode: "insensitive" as const } },
      { phone: { contains: searchString } },
      { region: { contains: searchString, mode: "insensitive" as const } },
    ],
  };

  // Get total count for pagination
  const totalCount = await prisma.patient.count({ where: whereClause });
  const totalPages = Math.ceil(totalCount / pageSize);

  // Query database with search filter & pagination
  const patients = await prisma.patient.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return (
    <div className="space-y-8">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {t.patients.title}
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            إدارة سجلات المرضى والملفات الطبية | Manage patient records and history
          </p>
        </div>

        <Button asChild className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-xl cursor-pointer">
          <Link href="/patients/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <span>{t.patients.addPatient}</span>
          </Link>
        </Button>
      </div>

      {/* Elegant Native Search Bar Form */}
      <form method="GET" className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          name="query"
          defaultValue={searchString}
          placeholder={t.patients.searchPlaceholder}
          className="w-full pl-10 pr-4 h-11 bg-slate-900 border border-slate-800 focus:border-cyan-500 text-slate-200 text-sm font-semibold rounded-xl outline-none placeholder:text-slate-500 transition-all font-sans"
        />
        {searchString && (
          <Button
            type="button"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2 text-xs text-slate-400 hover:text-white"
            asChild
          >
            <Link href="/patients">X</Link>
          </Button>
        )}
      </form>

      {/* Patients Data Table Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {patients.length === 0 ? (
          <EmptyState
            title={t.patients.noPatients}
            description="لم نجد أي مريض يطابق هذا البحث، يرجى التحقق من الاسم أو إضافة مريض جديد."
            icon={User}
            actionLabel={t.patients.addPatient}
            actionHref="/patients/new"
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-slate-800">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold">{t.patients.fullName}</TableHead>
                  <TableHead className="text-slate-400 font-bold">{t.patients.phone}</TableHead>
                  <TableHead className="text-slate-400 font-bold">{t.patients.region}</TableHead>
                  <TableHead className="text-slate-400 font-bold">{t.patients.dateOfBirth}</TableHead>
                  <TableHead className="text-slate-400 font-bold text-center">{t.patients.active}</TableHead>
                  <TableHead className="text-slate-400 font-bold text-center">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => {
                  const birthDate = new Date(patient.dateOfBirth);
                  const age = new Date().getFullYear() - birthDate.getFullYear();

                  return (
                    <TableRow key={patient.id} className="border-slate-800/60 hover:bg-slate-950/20">
                      <TableCell className="font-bold text-slate-200">
                        <Link href={`/patients/${patient.id}`} className="hover:text-cyan-400 transition-colors">
                          {patient.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-400 font-medium font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-600" />
                          <span>{patient.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm font-semibold">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-600" />
                          <span>{patient.region}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 font-medium text-xs">
                        {birthDate.toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-US")} ({age} {t.patients.years})
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`rounded-full px-2.5 py-0.5 border font-semibold text-[10px] ${
                          patient.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-800 text-slate-500 border-slate-700"
                        }`}>
                          {patient.isActive ? t.patients.active : t.patients.inactive}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                            <Link href={`/patients/${patient.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg cursor-pointer">
                            <Link href={`/patients/${patient.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {patients.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          lang={lang}
        />
      )}
    </div>
  );
}
