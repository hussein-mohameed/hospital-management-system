"use client";

import { useState, useTransition } from "react";
import { updateExamResult } from "@/actions/examinations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, FlaskConical } from "lucide-react";
import { toast } from "sonner";

interface ExamResultFormProps {
  visitExamId: string;
  examName: string;
  normalRange?: string | null;
  unit?: string | null;
  currentResult?: string | null;
  isCompleted: boolean;
  lang: string;
}

export function ExamResultForm({
  visitExamId,
  examName,
  normalRange,
  unit,
  currentResult,
  isCompleted,
  lang,
}: ExamResultFormProps) {
  const [result, setResult] = useState(currentResult || "");
  const [saved, setSaved] = useState(isCompleted);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!result.trim()) return;
    startTransition(async () => {
      await updateExamResult(visitExamId, result.trim());
      setSaved(true);
      toast.success(
        lang === "ar" ? "تم حفظ نتيجة الفحص ✅" : "Exam result saved ✅",
        { duration: 2500 }
      );
    });
  };

  if (saved && !isPending) {
    return (
      <div className="flex items-center justify-between py-3 px-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-slate-200">{examName}</p>
            {normalRange && (
              <p className="text-xs text-slate-500">
                {lang === "ar" ? "النطاق الطبيعي:" : "Normal:"} {normalRange} {unit || ""}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono font-bold text-emerald-300">{result || currentResult}</p>
          <button
            onClick={() => setSaved(false)}
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
          >
            {lang === "ar" ? "تعديل" : "Edit"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 px-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-amber-400 shrink-0" />
        <div>
          <p className="text-sm font-bold text-slate-200">{examName}</p>
          {normalRange && (
            <p className="text-xs text-slate-500">
              {lang === "ar" ? "النطاق الطبيعي:" : "Normal:"} {normalRange} {unit || ""}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder={lang === "ar" ? "أدخل النتيجة..." : "Enter result..."}
          className="flex-1 h-9 bg-slate-900/70 border-slate-700 text-slate-100 rounded-xl text-sm placeholder:text-slate-600 focus:border-cyan-500"
        />
        <Button
          onClick={handleSave}
          disabled={isPending || !result.trim()}
          className="h-9 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl cursor-pointer disabled:opacity-50 gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          {lang === "ar" ? "حفظ" : "Save"}
        </Button>
      </div>
    </div>
  );
}
