import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { getTranslations } from "@/lib/i18n";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, Shield, Mail, User, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { DeleteUserButton } from "@/components/users/DeleteUserButton";
import { Role } from "@prisma/client";

export default async function UsersPage() {
  const session = await requireSession();
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const t = getTranslations(lang);

  // Only Super Admin can manage users
  if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <Shield className="h-16 w-16 text-rose-400/50" />
        <h1 className="text-2xl font-extrabold text-white">
          {lang === "ar" ? "غير مصرح لك بالوصول" : "Access Denied"}
        </h1>
        <p className="text-slate-400 text-sm">
          {lang === "ar"
            ? "هذه الصفحة متاحة فقط للمدير العام."
            : "This page is only available to Super Admins."}
        </p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { doctor: { select: { fullName: true, specialty: true } } },
  });

  const roleColors: Record<Role, string> = {
    SUPER_ADMIN: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    ADMIN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    DOCTOR: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    RECEPTIONIST: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  const roleIcons: Record<Role, string> = {
    SUPER_ADMIN: "👑",
    ADMIN: "🔑",
    DOCTOR: "🩺",
    RECEPTIONIST: "🖥️",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="h-8 w-8 text-cyan-400" />
            {t.users.title}
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            {lang === "ar"
              ? "إدارة حسابات المستخدمين وصلاحياتهم في النظام"
              : "Manage system user accounts and permissions"}
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold rounded-xl cursor-pointer">
          <Link href="/users/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <span>{t.users.addUser}</span>
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"] as Role[]).map((role) => {
          const count = users.filter((u) => u.role === role).length;
          return (
            <div key={role} className={`rounded-2xl border p-4 ${roleColors[role]} bg-opacity-5`}>
              <p className="text-2xl font-extrabold font-mono">{count}</p>
              <p className="text-xs font-bold mt-1 opacity-80">
                {roleIcons[role]} {t.common.role[role]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="py-20 text-center">
          <Users className="h-12 w-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">{t.users.noUsers}</p>
        </div>
      ) : (
        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/20">
                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 tracking-wider">
                      {lang === "ar" ? "المستخدم" : "User"}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 tracking-wider">
                      {t.users.email}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 tracking-wider">
                      {t.users.role}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 tracking-wider">
                      {t.common.dateCreated}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 tracking-wider">
                      {t.common.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-600/30 to-teal-600/30 border border-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-300">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200">
                              <span className="font-mono text-slate-400">@</span>{user.username}
                            </p>
                            {user.doctor && (
                              <p className="text-xs text-teal-400 font-semibold">{user.doctor.fullName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-slate-400">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`rounded-lg px-2.5 py-0.5 border font-bold text-xs ${roleColors[user.role]}`}>
                          {roleIcons[user.role]} {t.common.role[user.role]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-500">
                          {formatDate(user.createdAt, lang === "ar" ? "ar-IQ" : "en-US")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.id !== session.userId && (
                          <DeleteUserButton userId={user.id} username={user.username} lang={lang} />
                        )}
                        {user.id === session.userId && (
                          <span className="text-xs text-slate-600 font-semibold px-2">
                            {lang === "ar" ? "أنت" : "You"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
