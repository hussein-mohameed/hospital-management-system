"use client";

import { useActionState } from "react";
import { createDoctor, DoctorState } from "@/actions/doctors";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, User, Phone, Mail, Key, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DoctorForm() {
  const { t, language } = useLanguage();
  const [state, formAction, isPending] = useActionState(createDoctor, null);

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden max-w-2xl mx-auto rounded-3xl">
      {/* Decorative accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500" />

      <CardHeader className="pt-8 pb-6 px-8 flex flex-row items-center justify-between border-b border-slate-800 bg-slate-950/20">
        <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-3">
          <Stethoscope className="h-5 w-5 text-teal-400" />
          <span>{t.doctors.addDoctor}</span>
        </CardTitle>
        <Button asChild variant="ghost" className="text-slate-400 hover:text-white rounded-xl">
          <Link href="/doctors" className="flex items-center gap-1.5 text-xs font-semibold">
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
                {t.doctors.fullName} *
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="د. أحمد علي"
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold"
                />
              </div>
              {state?.errors?.fullName && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.fullName[0]}
                </p>
              )}
            </div>

            {/* Specialty */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="specialty" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.doctors.specialty} *
              </Label>
              <div className="relative group">
                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <Input
                  id="specialty"
                  name="specialty"
                  type="text"
                  required
                  placeholder="طب الأطفال / جراحة عامة"
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold"
                />
              </div>
              {state?.errors?.specialty && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.specialty[0]}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="phone" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.doctors.phone} (07XXXXXXXXX)
              </Label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="07801234567"
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold font-mono"
                />
              </div>
              {state?.errors?.phone && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.phone[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="email" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.doctors.email} *
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="doctor@hospital.com"
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold font-mono"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="username" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.doctors.username} *
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="ahmed.ali"
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold font-mono"
                />
              </div>
              {state?.errors?.username && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.username[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label htmlFor="password" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.doctors.password} (8+ characters) *
              </Label>
              <div className="relative group">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-600 transition-all text-sm font-semibold font-mono"
                />
              </div>
              {state?.errors?.password && (
                <p className="text-xs font-bold text-rose-400 mt-1">
                  {state.errors.password[0]}
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
              <Link href="/doctors">{t.common.cancel}</Link>
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-teal-500/10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-300"
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
