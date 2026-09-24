import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SignUpForm } from "@/modules/auth/presentation/sign-up-form";

interface SignUpPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <div className="w-full max-w-md space-y-5">
      {/* Guest Reassurance Banner */}
      <div className="group relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-white/80 to-indigo-50/70 p-4 sm:p-5 shadow-xs backdrop-blur-md transition-all duration-300 dark:border-white/[0.1] dark:bg-gradient-to-br dark:from-[#0B1A30]/80 dark:via-[#07101F]/90 dark:to-[#171336]/70 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100/90 text-blue-700 shadow-2xs dark:bg-cyan-500/20 dark:text-cyan-300 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <h2 className="font-space-grotesk text-sm font-bold text-[#173B6C] dark:text-[#F4F7FF]">
            {isArabic ? "زيارة استكشافية؟" : "Exploring as a Guest?"}
          </h2>
        </div>
        <p className="font-manrope text-xs leading-relaxed text-[#6C7893] dark:text-[#9AA8C0]">
          {isArabic
            ? "إنشاء الحساب ليس شرطًا للاستفادة من المحفظة. كافة الوظائف والمشاريع والمساعد الذكي متوفرة بالكامل للزوار."
            : "Creating an account is not required. All features, projects, CV downloads, and AI tools are fully available to guests."}
        </p>
        <div className="mt-3">
          <Link
            href={`/${locale}`}
            className="group/link inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F6FED] transition-colors hover:text-[#1E40AF] dark:text-[#67E8F9] dark:hover:text-[#38BDF8]"
          >
            <span className="transition-transform group-hover/link:-translate-x-1 rtl:group-hover/link:translate-x-1">
              {isArabic ? "←" : "←"}
            </span>
            <span className="underline underline-offset-4">
              {isArabic ? "العودة لتصفح المحفظة كزائر" : "Return to portfolio as guest"}
            </span>
          </Link>
        </div>
      </div>

      {/* Main Sign-Up Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white/95 p-6 sm:p-8 shadow-[0_20px_50px_rgba(23,59,108,0.08)] backdrop-blur-xl transition-all duration-300 dark:border-white/[0.1] dark:bg-[#0B1728]/85 dark:shadow-[0_25px_60px_rgba(0,0,0,0.55)]">
        {/* Subtle decorative glow accent at top of card */}
        <div
          className="pointer-events-none absolute -top-16 start-1/2 -translate-x-1/2 h-32 w-56 rounded-full bg-gradient-to-r from-[#2F6FED]/20 to-[#818CF8]/20 blur-2xl dark:from-cyan-500/15 dark:to-indigo-500/15"
          aria-hidden="true"
        />

        <div className="relative mb-6 text-center">
          <h1 className="font-space-grotesk text-2xl sm:text-3xl font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF]">
            {isArabic ? "إنشاء حساب جديد" : "Create an Account"}
          </h1>
          <p className="font-manrope text-xs sm:text-sm text-[#6C7893] dark:text-[#9AA8C0] mt-1.5 leading-relaxed">
            {isArabic
              ? "أنشئ حسابًا لحفظ التفضيلات أو المزامنة"
              : "Create an account for saved preferences or collaboration"}
          </p>
        </div>

        <SignUpForm locale={locale} />
      </div>
    </div>
  );
}
