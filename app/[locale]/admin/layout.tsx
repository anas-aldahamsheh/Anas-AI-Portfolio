import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toLocale, type Locale } from "@/i18n/config";
import { getAdmin } from "@/server/auth/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

// Document extraction and re-indexing run inside admin actions.
export const maxDuration = 60;

async function AdminGuard({ locale, children }: { locale: Locale; children: ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/sign-in?next=/${locale}/admin`);
  return <>{children}</>;
}

export default async function AdminLayout({ children, params }: LayoutProps<"/[locale]/admin">) {
  const locale = toLocale((await params).locale);
  return (
    <div className="min-h-screen bg-[#F6F8FC] dark:bg-[#050B16]">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }
      >
        <AdminGuard locale={locale}>{children}</AdminGuard>
      </Suspense>
    </div>
  );
}
