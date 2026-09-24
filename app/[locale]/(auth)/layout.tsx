import Link from "next/link";
import { BrandLogo } from "@/modules/navigation/presentation/brand-logo";
import { LanguageSelect } from "@/modules/localization/presentation/language-select";
import { ThemeToggle } from "@/modules/theme/presentation/theme-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-white text-[#173B6C] transition-colors duration-300 dark:bg-[#07101F] dark:text-[#F4F7FF]">
      {/* Living Aurora Glow Aura on Left */}
      <div
        className="hero-aurora-left pointer-events-none absolute -top-24 -start-20 h-[520px] w-[560px] rounded-full bg-gradient-to-br from-[#BAE6FD]/70 via-[#E0F2FE]/50 to-transparent blur-[110px] dark:from-[#0284c7]/20 dark:via-[#0369a1]/10 dark:to-transparent"
        aria-hidden="true"
      />

      {/* Living Aurora Glow Aura on Right */}
      <div
        className="hero-aurora-right pointer-events-none absolute -top-20 -end-20 h-[520px] w-[580px] rounded-full bg-gradient-to-bl from-[#DDD6FE]/75 via-[#EDE9FE]/50 to-transparent blur-[120px] dark:from-[#7c3aed]/20 dark:via-[#6d28d9]/10 dark:to-transparent"
        aria-hidden="true"
      />

      {/* Soft Ambient Floating Center Orb */}
      <div
        className="hero-aurora-center pointer-events-none absolute top-1/3 start-1/2 -translate-x-1/2 h-[380px] w-[500px] rounded-full bg-gradient-to-r from-[#BAE6FD]/30 to-[#DDD6FE]/30 blur-[130px] dark:from-[#0284c7]/10 dark:to-[#7c3aed]/10"
        aria-hidden="true"
      />

      {/* Subtle Atmospheric Wash */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#EBF6FE]/40 via-transparent to-[#F3EEFE]/40 dark:from-[#0B1728]/50 dark:via-transparent dark:to-[#150E2A]/50"
        aria-hidden="true"
      />

      {/* 
        ==================================================
        AUTH HEADER (Top Bar)
        Brand Logo on Start | Controls on End:
        [Language Switcher] [Theme Toggle] [Return to Portfolio]
        ==================================================
      */}
      <header className="sticky top-0 z-30 w-full border-b border-[#E5EAF2]/80 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#07101F]/80">
        <div className="mx-auto flex h-16 max-w-[1420px] items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Start: Brand Identity */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 transition-opacity hover:opacity-85 text-start shrink-0"
            aria-label={isArabic ? "أنس الدحامشة - الرئيسية" : "Anas Al Dahamsheh - Home"}
          >
            <BrandLogo className="h-8 sm:h-9 lg:h-10 w-auto" />
          </Link>

          {/* End: Control Cluster (Language + Theme Toggle + Return Link) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* 1. Language Toggle (AR / EN) */}
            <LanguageSelect
              currentLocale={locale}
              className="h-9 w-9 rounded-full border border-[#E4EAF3] bg-white text-xs font-bold text-[#173B6C] shadow-2xs hover:bg-[#EEF5FF] hover:border-[#D0E2FF] hover:text-[#1E40AF] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-[#E2E8F0] dark:hover:bg-white/[0.08] dark:hover:text-white"
            />

            {/* 2. Theme Toggle (Light / Dark) */}
            <ThemeToggle
              locale={locale}
              className="h-9 w-9 rounded-full border border-[#E4EAF3] bg-white text-[#173B6C] shadow-2xs hover:bg-[#EEF5FF] hover:border-[#D0E2FF] hover:text-[#1E40AF] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-[#E2E8F0] dark:hover:bg-white/[0.08] dark:hover:text-white"
            />

            {/* 3. Return to Portfolio Link */}
            <Link
              href={`/${locale}`}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#E4EAF3] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#173B6C] shadow-2xs transition-all duration-200 hover:bg-[#EEF5FF] hover:border-[#D0E2FF] hover:text-[#1E40AF] dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-[#E2E8F0] dark:hover:bg-white/[0.1] dark:hover:text-white"
            >
              <span>{isArabic ? "المحفظة" : "Portfolio"}</span>
              <span className="text-xs transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                {isArabic ? "←" : "→"}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-12 md:py-16">
        {children}
      </main>

      {/* Subtle Minimal Footer Note */}
      <footer className="relative z-10 border-t border-[#E5EAF2]/60 py-4 text-center text-xs text-[#6C7893] transition-colors duration-300 dark:border-white/[0.06] dark:text-[#9AA8C0]/80">
        <p>
          {isArabic
            ? "© أنس الدحامشة — مهندس ذكاء اصطناعي ومطور برمجيات"
            : "© Anas Al Dahamsheh — AI Engineer & Full-Stack Developer"}
        </p>
      </footer>
    </div>
  );
}
