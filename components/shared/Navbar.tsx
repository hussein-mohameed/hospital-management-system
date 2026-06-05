"use client";

import { useLanguage } from "@/context/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Menu, User, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

type NavbarProps = {
  user: {
    username: string;
    role: string;
  } | null;
};

export function Navbar({ user }: NavbarProps) {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const locale = language === "ar" ? "ar-IQ" : "en-US";
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formatter.format(new Date()));
  }, [language]);

  return (
    <header className="sticky top-0 z-20 w-full h-16 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-sm">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-800">
          <Calendar className="h-3.5 w-3.5 text-cyan-400" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-4">
        <LanguageToggle />

        <div className="h-6 w-px bg-slate-800" />

        {/* User Profile Block */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-200">
              {user?.username || "Admin"}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {user?.role ? t.common.role[user.role as keyof typeof t.common.role] || user.role : ""}
            </p>
          </div>
          <Avatar className="h-9 w-9 border border-cyan-500/20 bg-slate-800">
            <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-teal-600 text-white text-xs font-bold font-sans">
              {user?.username ? getInitials(user.username) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
