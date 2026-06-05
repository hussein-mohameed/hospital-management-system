import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube, Plus, Search, HelpCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { ExaminationForm } from "@/components/examinations/ExaminationForm";

type SearchParams = Promise<{ query?: string; page?: string }>;

export default async function ExaminationsPage({
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
      { name: { contains: searchString, mode: "insensitive" as const } },
      { category: { contains: searchString, mode: "insensitive" as const } },
    ],
  };

  // Get total count for pagination
  const totalCount = await prisma.examination.count({ where: whereClause });
  const totalPages = Math.ceil(totalCount / pageSize);

  // Query examinations matching filter
  const examinations = await prisma.examination.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {t.examinations.title}
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          دليل الفحوصات والتحاليل الطبية المعتمدة في المستشفى | Diagnostic tests dictionary
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Catalog List (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Elegant Search form */}
          <form method="GET" className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              name="query"
              defaultValue={searchString}
              placeholder={t.examinations.searchPlaceholder}
              className="w-full pl-10 pr-4 h-11 bg-slate-900 border border-slate-800 focus:border-cyan-500 text-slate-200 text-sm font-semibold rounded-xl outline-none placeholder:text-slate-500 transition-all font-sans"
            />
            {searchString && (
              <Button
                type="button"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2 text-xs text-slate-400 hover:text-white"
                asChild
              >
                <Link href="/examinations">X</Link>
              </Button>
            )}
          </form>

          {/* Catalog Datatable */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {examinations.length === 0 ? (
              <EmptyState
                title={t.examinations.noExaminations}
                description="لا توجد فحوصات مطابقة لبحثك في دليل التحاليل حالياً."
                icon={TestTube}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-slate-800">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400 font-bold">{t.examinations.name}</TableHead>
                      <TableHead className="text-slate-400 font-bold">{t.examinations.category}</TableHead>
                      <TableHead className="text-slate-400 font-bold">{t.examinations.normalRange}</TableHead>
                      <TableHead className="text-slate-400 font-bold">{t.examinations.unit}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examinations.map((exam) => (
                      <TableRow key={exam.id} className="border-slate-800/60 hover:bg-slate-950/20">
                        <TableCell className="font-bold text-slate-200">
                          {exam.name}
                        </TableCell>
                        <TableCell className="text-slate-400 font-semibold text-xs">
                          {exam.category}
                        </TableCell>
                        <TableCell className="text-slate-400 font-mono text-xs">
                          {exam.normalRange || "—"}
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs font-semibold">
                          {exam.unit || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          
          {examinations.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              lang={lang}
            />
          )}
        </div>

        {/* Add new Examination form panel (Col span 1) */}
        <div className="lg:col-span-1">
          <ExaminationForm />
        </div>
      </div>
    </div>
  );
}
