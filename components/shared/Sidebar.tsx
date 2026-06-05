"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  TestTube,
  FileText,
  LogOut,
  Activity,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";

export function Sidebar() {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const menuItems = [
    {
      href: "/",
      label: t.nav.dashboard,
      icon: LayoutDashboard,
    },
    {
      href: "/patients",
      label: t.nav.patients,
      icon: Users,
    },
    {
      href: "/doctors",
      label: t.nav.doctors,
      icon: Stethoscope,
    },
    {
      href: "/visits",
      label: t.nav.visits,
      icon: Calendar,
    },
    {
      href: "/examinations",
      label: t.nav.examinations,
      icon: TestTube,
    },
    {
      href: "/reports",
      label: t.nav.reports,
      icon: FileText,
    },
    {
      href: "/users",
      label: t.nav.users,
      icon: UserCog,
    },
  ];

  return (
    <aside
      className={cn(
        "w-64 h-screen fixed top-0 flex flex-col bg-slate-900 text-slate-100 border-slate-800 z-30 transition-all duration-300",
        language === "ar" ? "right-0 border-l" : "left-0 border-r"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Activity className="h-6 w-6 animate-pulse" />
        </div>
        <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
          Hospital OS
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative",
                isActive
                  ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/10"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-cyan-400"
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <span
                  className={cn(
                    "absolute w-1.5 h-6 bg-cyan-400 rounded-full",
                    language === "ar" ? "-left-1" : "-right-1"
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile / Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3.5 px-4 py-3 h-auto text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5 text-rose-400" />
            <span className="text-sm font-semibold">{t.nav.logout}</span>
          </Button>
        </form>
      </div>
    </aside>
  );
}
