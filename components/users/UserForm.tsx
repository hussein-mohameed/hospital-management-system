"use client";

import { useActionState, useTransition } from "react";
import { createUser, UserState } from "@/actions/users";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Mail, Key, Shield, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const roles = [
  { value: "SUPER_ADMIN", labelAr: "مدير عام", labelEn: "Super Admin", color: "text-rose-400" },
  { value: "ADMIN", labelAr: "مدير", labelEn: "Admin", color: "text-amber-400" },
  { value: "DOCTOR", labelAr: "طبيب", labelEn: "Doctor", color: "text-teal-400" },
  { value: "RECEPTIONIST", labelAr: "موظف استقبال", labelEn: "Receptionist", color: "text-cyan-400" },
];

export function UserForm() {
  const { t, language } = useLanguage();
  const [state, formAction, isPending] = useActionState<UserState, FormData>(createUser, null);

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden max-w-2xl mx-auto rounded-3xl">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />

      <CardHeader className="pt-8 pb-6 px-8 flex flex-row items-center justify-between border-b border-slate-800 bg-slate-950/20">
        <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-3">
          <Users className="h-5 w-5 text-cyan-400" />
          <span>{t.users.addUser}</span>
        </CardTitle>
        <Button asChild variant="ghost" className="text-slate-400 hover:text-white rounded-xl">
          <Link href="/users" className="flex items-center gap-1.5 text-xs font-semibold">
            <ArrowRight className={`h-4 w-4 ${language === "ar" ? "" : "rotate-180"}`} />
            <span>{t.common.back}</span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-8">
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.users.username} *
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="john.doe"
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-mono"
                />
              </div>
              {state?.errors?.username && (
                <p className="text-xs font-bold text-rose-400">{state.errors.username[0]}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.users.email} *
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="user@hospital.com"
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-mono"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-xs font-bold text-rose-400">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-bold text-xs tracking-wider">
                {t.users.password} (8+ {language === "ar" ? "أحرف" : "chars"}) *
              </Label>
              <div className="relative group">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10 h-11 bg-slate-950/40 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600 transition-all text-sm font-mono"
                />
              </div>
              {state?.errors?.password && (
                <p className="text-xs font-bold text-rose-400">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-slate-300 font-bold text-xs tracking-wider">
                {t.users.role} *
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {roles.map((r) => (
                  <label
                    key={r.value}
                    className="flex items-center gap-2 px-3 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all group"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      required
                      className="accent-cyan-500"
                    />
                    <span className={`text-xs font-bold ${r.color}`}>
                      {language === "ar" ? r.labelAr : r.labelEn}
                    </span>
                  </label>
                ))}
              </div>
              {state?.errors?.role && (
                <p className="text-xs font-bold text-rose-400">{state.errors.role[0]}</p>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl text-xs text-slate-400 leading-relaxed">
            <Shield className="h-4 w-4 text-cyan-400 inline mr-1.5" />
            {language === "ar"
              ? "ملاحظة: إذا كانت الصلاحية \"طبيب\"، يجب إضافة ملف الطبيب عبر صفحة الأطباء لاحقاً."
              : "Note: If role is Doctor, a doctor profile must be added separately via the Doctors page."}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" asChild
              className="border-slate-800 text-slate-400 hover:text-white rounded-xl h-11 px-6 cursor-pointer font-bold">
              <Link href="/users">{t.common.cancel}</Link>
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl h-11 px-8 shadow-lg cursor-pointer disabled:opacity-75 transition-all"
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
