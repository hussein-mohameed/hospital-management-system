"use client";

import { useActionState } from "react";
import { createPatient, updatePatient, PatientState } from "@/actions/patients";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, MapPin, Mail, Calendar, FileText, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

type PatientFormProps = {
  initialData?: {
    id: string;
    fullName: string;
    dateOfBirth: Date;
    region: string;
    email: string | null;
    phone: string;
    description: string | null;
  };
};

export function PatientForm({ initialData }: PatientFormProps) {
  const { t, language } = useLanguage();

  // Pick correct server action based on whether we are editing or creating
  const formActionWithId = initialData
    ? updatePatient.bind(null, initialData.id)
    : createPatient;

  const [state, formAction, isPending] = useActionState(formActionWithId, null);

  // Format date of birth to YYYY-MM-DD for date input
  const defaultDob = initialData
    ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
    : "";

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden max-w-2xl mx-auto rounded-3xl">
      {/* Decorative accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />

      <CardHeader className="pt-8 pb-6 px-8 flex flex-row items-center justify-between border-b border-slate-800 bg-slate-950/20">
        <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-3">
          <User className="h-5 w-5 text-cyan-400" />
          <span>
            {initialData ? t.patients.editPatient : t.patients.addPatient}
          </span>
        </CardTitle>
        <Button asChild variant="ghost" className="text-slate-400 hover:text-white rounded-xl">
          <Link href="/patients" className="flex items-center gap-1.5 text-xs font-semibold">
            <ArrowRight className={`h-4 w-4 ${language === "ar" ? "" : "rotate-185"}`} />
            <span>{t.common.back}</span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-8">
        <form action={formAction} className="space-y-6">
          {/* General Form Error Alert */}
          {state?.error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="fullName" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.patients.fullName} *
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="علي حسن محمد"
                  defaultValue={initialData?.fullName || ""}
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold"
                />
              </div>
              {state?.errors?.fullName && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.fullName[0]}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="phone" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.patients.phone} (07XXXXXXXXX) *
              </Label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="07701234567"
                  defaultValue={initialData?.phone || ""}
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold font-mono"
                />
              </div>
              {state?.errors?.phone && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.phone[0]}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="dateOfBirth" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.patients.dateOfBirth} *
              </Label>
              <div className="relative group">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  defaultValue={defaultDob}
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-semibold font-mono"
                />
              </div>
              {state?.errors?.dateOfBirth && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.dateOfBirth[0]}
                </p>
              )}
            </div>

            {/* Region */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="region" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.patients.region} *
              </Label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="region"
                  name="region"
                  type="text"
                  required
                  placeholder="بغداد، الكرادة"
                  defaultValue={initialData?.region || ""}
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold"
                />
              </div>
              {state?.errors?.region && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.region[0]}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="email" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.patients.email} ({t.common.optional})
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="patient@hospital.com"
                  defaultValue={initialData?.email || ""}
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold font-mono"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Description Notes */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.patients.description} ({t.common.optional})
              </Label>
              <div className="relative group">
                <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Textarea
                  id="description"
                  name="description"
                  placeholder="أي ملاحظات طبية سابقة أو تفاصيل الحساسية..."
                  defaultValue={initialData?.description || ""}
                  className="pl-10 min-h-[120px] bg-slate-950/40 border-slate-800 text-slate-100 rounded-2xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold"
                />
              </div>
              {state?.errors?.description && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.description[0]}
                </p>
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
              <Link href="/patients">{t.common.cancel}</Link>
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-300"
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
