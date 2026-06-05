import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/context/LanguageContext";
import { Language } from "@/lib/i18n";
import { Toaster } from "sonner";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hospital OS — 🏥 نظام إدارة المستشفيات المتكامل",
  description: "نظام متكامل لإدارة العمليات الطبية، تسجيل المرضى، الفحوصات والتقارير الطبية.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Await cookies in Next.js 16
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value || "ar") as Language;
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${cairo.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <LanguageProvider initialLanguage={lang}>
          {children}
          <Toaster
            position={lang === "ar" ? "bottom-right" : "bottom-left"}
            theme="dark"
            richColors
            toastOptions={{
              style: {
                background: "#0f172a",
                border: "1px solid #1e293b",
                color: "#f1f5f9",
                fontFamily: "var(--font-cairo), sans-serif",
              },
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}
