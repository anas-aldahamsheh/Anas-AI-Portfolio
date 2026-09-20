import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/modules/auth/infrastructure/server-auth";
import { isAdmin } from "@/modules/auth/domain/roles";
import { certificateService } from "@/modules/certificates/infrastructure/certificate-service";
import { CertificatesAdminManager } from "@/modules/certificates/presentation";

interface AdminCertificatesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AdminCertificatesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic
      ? "إدارة الشهادات والدورات | لوحة التحكم"
      : "Manage Certificates & Courses | Admin Control Plane",
  };
}

export default async function AdminCertificatesPage({ params }: AdminCertificatesPageProps) {
  const { locale } = await params;
  const session = await getCurrentSession();

  if (!session) {
    redirect(`/${locale}/sign-in?callbackUrl=/${locale}/admin/certificates`);
  }

  if (!isAdmin(session.role)) {
    redirect(`/${locale}/admin`);
  }

  const certificates = await certificateService.getCertificates();

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <CertificatesAdminManager initialCertificates={certificates} locale={locale} />
    </div>
  );
}
