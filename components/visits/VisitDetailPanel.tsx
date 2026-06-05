"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  User,
  Stethoscope,
  TestTube,
  FileText,
  Clock,
  Activity,
  HeartPulse,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { updateVisitStatus, updateVisitDiagnosis } from "@/actions/visits";
import { updateExamResult } from "@/actions/examinations";
import { upsertReport } from "@/actions/reports";
import { VisitStatus, ExamStatus, CaseStatus } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type VisitDetailProps = {
  visit: {
    id: string;
    patientId: string;
    visitDate: Date;
    status: VisitStatus;
    chiefComplaint: string;
    notes: string | null;
    diagnosis: string | null;
    patient: {
      fullName: string;
      phone: string;
      region: string;
    };
    doctors: {
      doctor: {
        id: string;
        fullName: string;
      };
    }[];
    examinations: {
      id: string;
      examinationId: string;
      result: string | null;
      status: ExamStatus;
      notes: string | null;
      examination: {
        name: string;
        category: string;
        unit: string | null;
        normalRange: string | null;
      };
    }[];
    report: {
      content: string;
      status: CaseStatus;
    } | null;
  };
  currentUser: {
    role: string;
    username: string;
  };
};

export function VisitDetailPanel({ visit, currentUser }: VisitDetailProps) {
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();

  // Local state for diagnosis and report content
  const [diagnosis, setDiagnosis] = useState(visit.diagnosis || "");
  const [reportContent, setReportContent] = useState(visit.report?.content || "");
  const [caseStatus, setCaseStatus] = useState<CaseStatus>(visit.report?.status || "OPEN");

  // Local state for exam results form
  const [examResults, setExamResults] = useState<{ [key: string]: string }>({});

  const statusColors = {
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    IN_PROGRESS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  // 1. Change Visit Status
  const handleStatusChange = (newStatus: VisitStatus) => {
    startTransition(async () => {
      try {
        await updateVisitStatus(visit.id, newStatus);
        toast.success(t.visits.statusUpdated);
      } catch (err) {
        toast.error("Failed to change visit status");
      }
    });
  };

  // 2. Update Diagnosis
  const handleSaveDiagnosis = () => {
    startTransition(async () => {
      try {
        await updateVisitDiagnosis(visit.id, diagnosis);
        toast.success("تم حفظ التشخيص بنجاح | Diagnosis saved");
      } catch (err) {
        toast.error("Failed to save diagnosis");
      }
    });
  };

  // 3. Update Exam Result
  const handleSaveExamResult = (visitExamId: string) => {
    const result = examResults[visitExamId];
    if (!result) {
      toast.error("يرجى إدخال النتيجة أولاً | Enter test result first");
      return;
    }

    startTransition(async () => {
      try {
        await updateExamResult(visitExamId, result);
        toast.success("تم إدخال النتيجة بنجاح | Result updated");
      } catch (err) {
        toast.error("Failed to update test result");
      }
    });
  };

  // 4. Save Report
  const handleSaveReport = () => {
    if (!reportContent) {
      toast.error("يرجى كتابة محتوى التقرير | Write report content first");
      return;
    }

    startTransition(async () => {
      try {
        await upsertReport(visit.id, reportContent, caseStatus);
        toast.success(t.reports.updateSuccess);
      } catch (err) {
        toast.error("Failed to save report");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Title & Primary Status Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
            {t.visits.visitDetail}
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1.5">
            <span>زيارة المريض: {visit.patient.fullName}</span>
            <Badge className={`rounded-lg px-2.5 py-0.5 border font-semibold text-xs ${statusColors[visit.status]}`}>
              {t.status[visit.status as keyof typeof t.status]}
            </Badge>
          </h1>
          <p className="text-sm font-semibold text-slate-400 flex items-center gap-2 mt-1.5 font-mono">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span>{formatDate(visit.visitDate, language === "ar" ? "ar-IQ" : "en-US")}</span>
          </p>
        </div>

        {/* Clinician Status controls */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-2 border border-slate-800 rounded-2xl w-fit">
          <Button
            size="sm"
            onClick={() => handleStatusChange("IN_PROGRESS")}
            className={`rounded-xl px-4 py-2 cursor-pointer font-bold transition-all text-xs ${
              visit.status === "IN_PROGRESS"
                ? "bg-cyan-600 text-white"
                : "bg-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.status.IN_PROGRESS}
          </Button>
          <Button
            size="sm"
            onClick={() => handleStatusChange("COMPLETED")}
            className={`rounded-xl px-4 py-2 cursor-pointer font-bold transition-all text-xs ${
              visit.status === "COMPLETED"
                ? "bg-emerald-600 text-white"
                : "bg-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.status.COMPLETED}
          </Button>
          <Button
            size="sm"
            onClick={() => handleStatusChange("CANCELLED")}
            className={`rounded-xl px-4 py-2 cursor-pointer font-bold transition-all text-xs ${
              visit.status === "CANCELLED"
                ? "bg-rose-950/60 text-rose-400 border border-rose-900"
                : "bg-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.status.CANCELLED}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side columns: Demographic + Diagnosis */}
        <div className="space-y-8 lg:col-span-1">
          {/* Demographic card */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <User className="h-4.5 w-4.5 text-cyan-400" />
                <span>{t.patients.personalInfo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3.5 text-sm font-semibold text-slate-300">
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-500">{t.patients.fullName}</span>
                <span className="text-slate-100">{visit.patient.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-500">{t.patients.phone}</span>
                <span className="font-mono text-slate-100">{visit.patient.phone}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">{t.patients.region}</span>
                <span className="text-slate-100">{visit.patient.region}</span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Doctors */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <Stethoscope className="h-4.5 w-4.5 text-teal-400" />
                <span>{t.visits.doctors}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {visit.doctors.map((item) => (
                <div
                  key={item.doctor.id}
                  className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-850 rounded-2xl"
                >
                  <Stethoscope className="h-4 w-4 text-teal-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-200">{item.doctor.fullName}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chief Complaint & Notes */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-4 px-6">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <FileText className="h-4.5 w-4.5 text-purple-400" />
                <span>{t.visits.chiefComplaint} / {t.visits.notes}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  {t.visits.chiefComplaint}
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-bold bg-slate-950/30 p-3 rounded-2xl border border-slate-800/60">
                  {visit.chiefComplaint}
                </p>
              </div>

              {visit.notes && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    {t.visits.notes}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium bg-slate-950/20 p-3 rounded-2xl border border-slate-800/40">
                    {visit.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side columns: Ordered Exams + Medical Report */}
        <div className="space-y-8 lg:col-span-2">
          {/* Ordered Tests & Examinations Catalog */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-5 px-6">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <TestTube className="h-5 w-5 text-purple-400 animate-pulse" />
                <span>الفحوصات المطلوبة | Requested Lab Examinations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {visit.examinations.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-4">لم يتم حجز أي فحوصات معملية لهذه الزيارة.</p>
              ) : (
                <div className="space-y-4">
                  {visit.examinations.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md font-bold">
                          {item.examination.category}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-100 pt-1">
                          {item.examination.name}
                        </h4>
                        {item.examination.normalRange && (
                          <p className="text-[10px] text-slate-500 font-semibold">
                            النطاق الطبيعي: {item.examination.normalRange} {item.examination.unit}
                          </p>
                        )}
                      </div>

                      {/* Display / edit test result */}
                      <div className="shrink-0 flex items-center gap-2.5">
                        {item.status === "COMPLETED" ? (
                          <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl font-mono">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                            <div>
                              <span className="text-xs font-bold text-emerald-400 block leading-none">
                                {item.result} {item.examination.unit}
                              </span>
                              {item.notes && (
                                <span className="text-[9px] text-slate-500 block mt-1">
                                  {item.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="النتيجة"
                              className="h-9 w-28 bg-slate-900 border-slate-800 text-xs font-semibold rounded-lg font-mono placeholder:text-slate-700"
                              onChange={(e) =>
                                setExamResults((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveExamResult(item.id)}
                              disabled={isPending}
                              className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg h-9 px-3 text-xs font-bold cursor-pointer"
                            >
                              حفظ
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Primary Diagnosis & Clinical Case Report Form */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/60 bg-slate-950/20 py-5 px-6">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2.5">
                <HeartPulse className="h-5 w-5 text-emerald-400 animate-pulse" />
                <span>التشخيص والتقرير الطبي | Clinical Diagnosis & Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Diagnosis Field */}
              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-slate-300 font-bold text-xs">
                  {t.visits.diagnosis}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="diagnosis"
                    value={diagnosis}
                    placeholder="التشخيص السريري الأولي للمريض..."
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:border-cyan-500/50 text-sm font-semibold"
                  />
                  <Button
                    onClick={handleSaveDiagnosis}
                    disabled={isPending}
                    className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl h-11 px-4 cursor-pointer font-bold"
                  >
                    <Save className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>

              <div className="h-px bg-slate-850/60" />

              {/* Case Report Editor */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Label htmlFor="reportContent" className="text-slate-300 font-bold text-xs">
                    {t.reports.content}
                  </Label>

                  {/* Case status select */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">الحالة:</span>
                    <select
                      value={caseStatus}
                      onChange={(e) => setCaseStatus(e.target.value as CaseStatus)}
                      className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                    >
                      <option value="OPEN" className="bg-slate-900">{t.status.OPEN}</option>
                      <option value="TREATED" className="bg-slate-900">{t.status.TREATED}</option>
                      <option value="FOLLOW_UP" className="bg-slate-900">{t.status.FOLLOW_UP}</option>
                      <option value="CLOSED" className="bg-slate-900">{t.status.CLOSED}</option>
                    </select>
                  </div>
                </div>

                <Textarea
                  id="reportContent"
                  value={reportContent}
                  placeholder="اكتب التقرير الطبي المفصل، العلاج الموصوف، والجرعات المطلوبة هنا..."
                  onChange={(e) => setReportContent(e.target.value)}
                  className="min-h-[160px] bg-slate-950/40 border-slate-800 text-slate-100 rounded-2xl focus:border-cyan-500/50 placeholder:text-slate-600 text-sm font-semibold leading-relaxed"
                />

                <div className="flex justify-end pt-1">
                  <Button
                    onClick={handleSaveReport}
                    disabled={isPending}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl h-11 px-6 font-bold cursor-pointer transition-all duration-300 shadow-md shadow-emerald-500/10"
                  >
                    <Save className="h-4.5 w-4.5 ltr:mr-2 rtl:ml-2" />
                    <span>حفظ التقرير الطبي | Save Case Report</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
