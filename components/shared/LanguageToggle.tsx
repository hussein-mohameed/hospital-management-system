"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 rounded-full px-3 py-1 cursor-pointer font-sans"
    >
      <Globe className="h-4 w-4 text-cyan-500 animate-pulse" />
      <span className="text-xs font-semibold uppercase tracking-wider">
        {language === "ar" ? "English" : "العربية"}
      </span>
    </Button>
  );
}
