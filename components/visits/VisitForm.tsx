"use client";

import { useActionState } from "react";
import { createVisit, VisitState } from "@/actions/visits";
import { useLanguage } from "@/context/LanguageContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Stethoscope, TestTube, FileText, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type VisitFormProps = {
  patients: { id: string; fullName: string }[];
  doctors: { id: string; fullName: string }[];
  examinations: { id: string; name: string; category: string }[];
};

export function VisitForm({ patients, doctors, examinations }: VisitFormProps) {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId") || "";

  const [state, formAction, isPending] = useActionState(createVisit, null);

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden max-w-3xl mx-auto rounded-3xl">
      {/* Decorative accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

      <CardHeader className="pt-8 pb-6 px-8 flex flex-row items-center justify-between border-b border-slate-800 bg-slate-950/20">
        <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-3">
          <Calendar className="h-5 w-5 text-cyan-400" />
          <span>{t.visits.addVisit}</span>
        </CardTitle>
        <Button asChild variant="ghost" className="text-slate-400 hover:text-white rounded-xl">
          <Link href="/visits" className="flex items-center gap-1.5 text-xs font-semibold">
            <ArrowRight className={`h-4 w-4 ${language === "ar" ? "" : "rotate-185"}`} />
            <span>{t.common.back}</span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-8">
        <form action={formAction} className="space-y-8">
          {/* General Form Error Alert */}
          {state?.error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Select */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="patientId" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.visits.patient} *
              </Label>
              <div className="relative">
                <select
                  id="patientId"
                  name="patientId"
                  required
                  defaultValue={preselectedPatientId}
                  className="w-full pl-3 pr-10 h-11 bg-slate-950/40 border border-slate-800 text-slate-200 text-sm font-semibold rounded-xl outline-none focus:border-cyan-500/50 appearance-none transition-all font-sans cursor-pointer"
                >
                  <option value="" className="bg-slate-900 text-slate-500">{t.visits.selectPatient}</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      {p.fullName}
                    </option>
                  ))}
                </select>
                <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 ${
                  language === "ar" ? "left-4" : "right-4"
                }`}>
                  ▼
                </div>
              </div>
              {state?.errors?.patientId && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.patientId[0]}
                </p>
              )}
            </div>

            {/* Visit Date & Time */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="visitDate" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.visits.visitDate} *
              </Label>
              <input
                id="visitDate"
                name="visitDate"
                type="datetime-local"
                required
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 h-11 bg-slate-950/40 border border-slate-800 text-slate-200 text-sm font-semibold rounded-xl outline-none focus:border-cyan-500/50 transition-all font-sans font-mono"
              />
              {state?.errors?.visitDate && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.visitDate[0]}
                </p>
              )}
            </div>

            {/* Chief Complaint */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="chiefComplaint" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.visits.chiefComplaint} *
              </Label>
              <div className="relative group">
                <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Textarea
                  id="chiefComplaint"
                  name="chiefComplaint"
                  required
                  placeholder="وصف للشكوى التي يعاني منها المريض (مثال: سعال وارتفاع في درجات الحرارة منذ 3 أيام)..."
                  className="pl-10 min-h-[90px] bg-slate-950/40 border-slate-800 text-slate-100 rounded-2xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold"
                />
              </div>
              {state?.errors?.chiefComplaint && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.chiefComplaint[0]}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.visits.notes} ({t.common.optional})
              </Label>
              <div className="relative group">
                <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="أي ملاحظات إضافية مثل قياس الضغط، النبض، أو علامات حيوية أخرى..."
                  className="pl-10 min-h-[90px] bg-slate-950/40 border-slate-800 text-slate-100 rounded-2xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold"
                />
              </div>
              {state?.errors?.notes && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.notes[0]}
                </p>
              )}
            </div>

            {/* Assigned Doctors Checklist */}
            <div className="space-y-3 col-span-2 border-t border-slate-800/60 pt-6">
              <Label className="text-slate-300 font-bold text-xs tracking-wider flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-teal-400" />
                <span>{t.visits.selectDoctors} *</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {doctors.map((doctor) => (
                  <label
                    key={doctor.id}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/20 border border-slate-800 hover:border-slate-700/60 transition-all cursor-pointer font-sans"
                  >
                    <input
                      type="checkbox"
                      name="doctorIds"
                      value={doctor.id}
                      className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      {doctor.fullName}
                    </span>
                  </label>
                ))}
              </div>
              {state?.errors?.doctorIds && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.doctorIds[0]}
                </p>
              )}
            </div>

            {/* Requested Examinations Checklist */}
            <div className="space-y-3 col-span-2 border-t border-slate-800/60 pt-6">
              <Label className="text-slate-300 font-bold text-xs tracking-wider flex items-center gap-2">
                <TestTube className="h-4 w-4 text-purple-400" />
                <span>{t.visits.selectExams} ({t.common.optional})</span>
              </Label>
              {examinations.length === 0 ? (
                <p className="text-xs text-slate-500 italic">لا توجد فحوصات مسجلة في دليل الفحوصات الطبية حالياً.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {examinations.map((exam) => (
                    <label
                      key={exam.id}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950/20 border border-slate-800 hover:border-slate-700/60 transition-all cursor-pointer font-sans"
                    >
                      <input
                        type="checkbox"
                        name="examinationIds"
                        value={exam.id}
                        className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-slate-900"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-300 block">
                          {exam.name}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">
                          {exam.category}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="border-slate-800 text-slate-400 hover:text-white rounded-xl h-11 px-6 cursor-pointer font-bold"
              asChild
            >
              <Link href="/visits">{t.common.cancel}</Link>
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.common.saving}</span>
                </span>
              ) : (
                <span>{t.common.save}</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
