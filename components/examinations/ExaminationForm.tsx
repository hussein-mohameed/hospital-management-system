"use client";

import { useActionState } from "react";
import { createExamination, ExamState } from "@/actions/examinations";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestTube, FileText, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export function ExaminationForm() {
  const { t, language } = useLanguage();
  const [state, formAction, isPending] = useActionState(createExamination, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(t.examinations.addSuccess);
      // Reset form natively
      const form = document.getElementById("add-exam-form") as HTMLFormElement;
      if (form) form.reset();
    }
  }, [state, t]);

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden rounded-3xl sticky top-24">
      {/* Decorative accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500" />

      <CardHeader className="pt-6 pb-4 px-6 border-b border-slate-800 bg-slate-950/20">
        <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2.5">
          <TestTube className="h-4.5 w-4.5 text-purple-400" />
          <span>{t.examinations.addExamination}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form id="add-exam-form" action={formAction} className="space-y-4">
          {/* General Form Error Alert */}
          {state?.error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {state.error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-slate-300 font-bold text-xs tracking-wider">
              {t.examinations.name} *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="مثال: تحليل السكر التراكمي HbA1c"
              className="h-10 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-purple-500/50 transition-all text-xs font-semibold"
            />
            {state?.errors?.name && (
              <p className="text-[10px] font-bold text-rose-400">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-slate-300 font-bold text-xs tracking-wider">
              {t.examinations.category} *
            </Label>
            <div className="relative">
              <select
                id="category"
                name="category"
                required
                className="w-full px-3 h-10 bg-slate-950/40 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl outline-none focus:border-purple-500/50 appearance-none transition-all font-sans cursor-pointer"
              >
                <option value="BLOOD" className="bg-slate-900">{t.examinations.categories.BLOOD}</option>
                <option value="URINE" className="bg-slate-900">{t.examinations.categories.URINE}</option>
                <option value="IMAGING" className="bg-slate-900">{t.examinations.categories.IMAGING}</option>
                <option value="CARDIAC" className="bg-slate-900">{t.examinations.categories.CARDIAC}</option>
                <option value="OTHER" className="bg-slate-900">{t.examinations.categories.OTHER}</option>
              </select>
              <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 ${
                language === "ar" ? "left-4" : "right-4"
              }`}>
                ▼
              </div>
            </div>
            {state?.errors?.category && (
              <p className="text-[10px] font-bold text-rose-400">
                {state.errors.category[0]}
              </p>
            )}
          </div>

          {/* Normal Range */}
          <div className="space-y-1.5">
            <Label htmlFor="normalRange" className="text-slate-300 font-bold text-xs tracking-wider">
              {t.examinations.normalRange} ({t.common.optional})
            </Label>
            <Input
              id="normalRange"
              name="normalRange"
              type="text"
              placeholder="مثال: 4.8 - 5.6"
              className="h-10 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-purple-500/50 transition-all text-xs font-semibold font-mono"
            />
          </div>

          {/* Unit */}
          <div className="space-y-1.5">
            <Label htmlFor="unit" className="text-slate-300 font-bold text-xs tracking-wider">
              {t.examinations.unit} ({t.common.optional})
            </Label>
            <Input
              id="unit"
              name="unit"
              type="text"
              placeholder="مثال: % أو mg/dL"
              className="h-10 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-purple-500/50 transition-all text-xs font-semibold font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-slate-300 font-bold text-xs tracking-wider">
              {t.examinations.description} ({t.common.optional})
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="اكتب وصفاً أو إرشادات خاصة بالفحص..."
              className="min-h-[70px] bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:border-purple-500/50 placeholder:text-slate-650 text-xs font-semibold"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl h-10 px-4 text-xs cursor-pointer shadow-lg shadow-purple-500/10 transition-all duration-300"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-1.5">
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>{t.common.saving}</span>
              </span>
            ) : (
              <span>{t.common.save}</span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
