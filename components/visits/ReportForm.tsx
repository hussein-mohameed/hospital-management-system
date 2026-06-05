"use client";

import { useState, useTransition } from "react";
import { upsertReport } from "@/actions/reports";
import { CaseStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, CheckCircle2, Edit } from "lucide-react";
import { toast } from "sonner";

interface ReportFormProps {
  visitId: string;
  existingContent?: string | null;
  existingStatus?: CaseStatus | null;
  lang: string;
}

const caseStatuses: CaseStatus[] = ["OPEN", "TREATED", "FOLLOW_UP", "CLOSED"];

const statusLabelAr: Record<CaseStatus, string> = {
  OPEN: "مفتوح",
  TREATED: "تم العلاج",
  FOLLOW_UP: "متابعة",
  CLOSED: "مغلق",
};

const statusLabelEn: Record<CaseStatus, string> = {
  OPEN: "Open",
  TREATED: "Treated",
  FOLLOW_UP: "Follow Up",
  CLOSED: "Closed",
};

const statusColors: Record<CaseStatus, string> = {
  OPEN: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  TREATED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  FOLLOW_UP: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  CLOSED: "bg-slate-800 text-slate-500 border-slate-700",
};

export function ReportForm({ visitId, existingContent, existingStatus, lang }: ReportFormProps) {
  const [content, setContent] = useState(existingContent || "");
  const [caseStatus, setCaseStatus] = useState<CaseStatus>(existingStatus || "OPEN");
  const [isEditing, setIsEditing] = useState(!existingContent);
  const [saved, setSaved] = useState(!!existingContent);
  const [isPending, startTransition] = useTransition();

  const statusLabels = lang === "ar" ? statusLabelAr : statusLabelEn;

  const handleSave = () => {
    if (!content.trim()) return;
    startTransition(async () => {
      await upsertReport(visitId, content.trim(), caseStatus);
      setIsEditing(false);
      setSaved(true);
      toast.success(
        lang === "ar" ? "تم حفظ التقرير الطبي ✅" : "Medical report saved ✅",
        { duration: 3000 }
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Status Selector */}
      <div className="flex flex-wrap gap-2">
        {caseStatuses.map((s) => (
          <button
            key={s}
            onClick={() => setCaseStatus(s)}
            disabled={!isEditing}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              caseStatus === s
                ? statusColors[s]
                : "bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700"
            } ${!isEditing ? "opacity-60 cursor-default" : "cursor-pointer"}`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder={
              lang === "ar"
                ? "اكتب محتوى التقرير الطبي هنا... (التشخيص، الدواء الموصوف، التوصيات)"
                : "Write medical report content... (diagnosis, prescriptions, recommendations)"
            }
            className="bg-slate-950/50 border-slate-700 text-slate-100 rounded-xl placeholder:text-slate-600 text-sm leading-relaxed focus:border-cyan-500"
          />
          <div className="flex gap-2 justify-end">
            {saved && (
              <Button
                onClick={() => setIsEditing(false)}
                variant="ghost"
                className="text-slate-400 hover:text-slate-300 rounded-xl cursor-pointer"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isPending || !content.trim()}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50 gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {lang === "ar" ? "حفظ التقرير" : "Save Report"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-300 leading-loose whitespace-pre-wrap font-medium">
              {content}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
