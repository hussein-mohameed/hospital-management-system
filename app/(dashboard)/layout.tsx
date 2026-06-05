import { requireSession } from "@/lib/session";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { cookies } from "next/headers";
import { Language } from "@/lib/i18n";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard route on the server
  const session = await requireSession();
  
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;

  return (
    <div className="min-h-screen bg-slate-950 flex relative">
      {/* Premium Sidebar (Fixed width) */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${
          lang === "ar" ? "pr-0 lg:pr-64" : "pl-0 lg:pl-64"
        }`}
      >
        {/* Top Glassmorphic Navigation Bar */}
        <Navbar user={session} />
        
        {/* Central Workspace Page content */}
        <main className="flex-1 p-6 md:p-8 bg-slate-950 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
