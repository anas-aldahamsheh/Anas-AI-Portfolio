import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toLocale } from "@/i18n/config";
import { getTranslator } from "@/i18n/server";
import { AuroraBackdrop } from "@/ui/page-hero";
import { SignInForm } from "@/features/admin/sign-in-form";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-in">): Promise<Metadata> {
  const { t } = await getTranslator(toLocale((await params).locale));
  return { title: t("auth.title"), robots: { index: false, follow: false } };
}

export default async function SignInPage({ params }: PageProps<"/[locale]/sign-in">) {
  const locale = toLocale((await params).locale);
  const { t } = await getTranslator(locale);
  const Back = locale === "ar" ? ArrowRight : ArrowLeft;
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 py-16 dark:bg-[#07101F]"
    >
      <AuroraBackdrop />
      <div className="relative z-10 flex w-full flex-col items-center gap-6">
        <SignInForm />
        <Link
          href={`/${locale}`}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-[#637089] transition-colors hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:text-white"
        >
          <Back
            className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
            aria-hidden="true"
          />
          {t("auth.back")}
        </Link>
      </div>
    </main>
  );
}
