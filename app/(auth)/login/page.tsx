"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { LanguageToggle } from "@/components/shared/LanguageToggle";

export default function LoginPage() {
  const { t } = useLanguage();
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden px-4">
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Language Switcher in Login */}
      <div className="absolute top-6 right-6 z-10 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800">
        <LanguageToggle />
      </div>

      <Card className="w-full max-w-md bg-slate-900/60 border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:border-slate-700/80">
        {/* Glowing Top Indicator */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />

        <CardHeader className="space-y-4 text-center pt-8">
          <div className="mx-auto p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit animate-pulse">
            <Activity className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-extrabold text-white tracking-wide">
              {t.auth.welcomeBack}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-slate-400">
              {t.auth.systemName}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          <form action={formAction} className="space-y-6">
            {/* General Form Error */}
            {state?.error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold leading-relaxed">
                {state.error}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300 font-semibold text-xs tracking-wider">
                {t.auth.username}
              </Label>
              <div className="relative group">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="admin"
                  defaultValue="admin"
                  className="pl-10 h-11 bg-slate-950/50 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 placeholder:text-slate-600 transition-all font-sans"
                />
              </div>
              {state?.errors?.username && (
                <p className="text-xs font-semibold text-rose-400 mt-1">
                  {state.errors.username[0]}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-semibold text-xs tracking-wider">
                {t.auth.password}
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-cyan-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  defaultValue="Admin@123"
                  className="pl-10 h-11 bg-slate-950/50 border-slate-800 text-slate-100 rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500 placeholder:text-slate-600 transition-all font-sans"
                />
              </div>
              {state?.errors?.password && (
                <p className="text-xs font-semibold text-rose-400 mt-1">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Action Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group transition-all duration-300"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  {t.auth.loggingIn}
                </span>
              ) : (
                t.auth.loginButton
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
