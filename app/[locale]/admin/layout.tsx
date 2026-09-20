import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/modules/auth/infrastructure/server-auth";
import { isAdmin } from "@/modules/auth/domain/roles";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  const session = await getCurrentSession();

  if (!session) {
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/admin`);
  }

  if (!isAdmin(session.role)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="border-destructive/20 bg-destructive/5 max-w-md rounded-xl border p-8">
          <div className="mb-3 text-3xl">🛡️</div>
          <h1 className="text-destructive mb-2 text-xl font-semibold">
            {isArabic ? "صلاحيات غير كافية" : "Access Denied"}
          </h1>
          <p className="text-muted-foreground mb-6 text-sm">
            {isArabic
              ? "أنت مسجل الدخول، لكن حسابك لا يمتلك صلاحيات المسؤول (ADMIN) للوصول إلى لوحة التحكم."
              : "You are signed in, but your account lacks administrative permissions to access the control plane."}
          </p>
          <Link
            href={`/${locale}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors"
          >
            {isArabic ? "العودة للرئيسية" : "Return to Home"}
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: `/${locale}/admin`, label: isArabic ? "لوحة القيادة" : "Dashboard" },
    { href: `/${locale}/admin/content`, label: isArabic ? "المحتوى" : "Content" },
    { href: `/${locale}/admin/sections`, label: isArabic ? "الأقسام" : "Sections" },
    { href: `/${locale}/admin/projects`, label: isArabic ? "المشاريع" : "Projects" },
    { href: `/${locale}/admin/cv`, label: isArabic ? "السيرة الذاتية" : "CV" },
    {
      href: `/${locale}/admin/certificates`,
      label: isArabic ? "الشهادات والدورات" : "Certificates & Courses",
    },
    { href: `/${locale}/admin/ai`, label: isArabic ? "الذكاء الاصطناعي" : "AI Plane" },
    { href: `/${locale}/admin/prompts`, label: isArabic ? "التوجيهات الذكية" : "Prompts" },
    { href: `/${locale}/admin/rag`, label: isArabic ? "فهرسة المعرفة (RAG)" : "RAG Pipeline" },
    { href: `/${locale}/admin/evaluation`, label: isArabic ? "تقييم الجودة" : "Evaluation" },
    { href: `/${locale}/admin/theme`, label: isArabic ? "المظهر" : "Theme" },
    { href: `/${locale}/admin/feature-flags`, label: isArabic ? "رايات الميزات" : "Feature Flags" },
    {
      href: `/${locale}/admin/cache`,
      label: isArabic ? "ذاكرة التخزين المؤقت" : "Cache & Invalidation",
    },
    { href: `/${locale}/admin/audit`, label: isArabic ? "سجل التدقيق" : "Audit Logs" },
  ];

  return (
    <div className="bg-muted/20 flex min-h-screen flex-col md:flex-row">
      {/* Sidebar navigation */}
      <aside className="border-border bg-card flex w-full flex-col justify-between border-b p-4 sm:p-6 md:w-64 md:border-e md:border-b-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/admin`}
              className="text-foreground flex items-center gap-2 text-base font-semibold tracking-tight"
            >
              <span>⚙️</span>
              <span>{isArabic ? "لوحة التحكم" : "Admin Panel"}</span>
            </Link>
            <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-semibold">
              ADMIN
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-border mt-6 border-t pt-6">
          <div className="text-muted-foreground mb-2 truncate text-xs">{session.user.email}</div>
          <Link
            href={`/${locale}`}
            className="text-primary text-xs underline underline-offset-4 transition-opacity hover:opacity-80"
          >
            {isArabic ? "← العودة للموقع العام" : "← Public Site"}
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
