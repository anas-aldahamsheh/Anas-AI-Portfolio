import Link from "next/link";
import { SignInForm } from "@/modules/auth/presentation/sign-in-form";

interface SignInPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Guest Reassurance Banner per docs/features/22_SIGNIN_GUEST_MESSAGING.md */}
        <div className="border-border/80 bg-muted/40 rounded-lg border p-4 text-sm">
          <div className="text-foreground mb-1 font-medium">
            {isArabic ? "💡 زيارة استكشافية؟" : "💡 Exploring as a Guest?"}
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {isArabic
              ? "المصادقة اختيارية تمامًا. يمكنك تصفح جميع المشاريع، وقراءة التفاصيل التقنية، وتحميل السيرة الذاتية، ومحادثة المساعد الذكي، واستخدام محلل الملاءمة الوظيفية كزائر بدون الحاجة لإنشاء حساب."
              : "Authentication is completely optional. You can browse all projects, read architectural deep dives, download the CV, chat with the AI assistant, and use the Job Fit Analyzer without logging in."}
          </p>
          <div className="mt-2.5">
            <Link
              href={`/${locale}`}
              className="text-primary text-xs font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              {isArabic ? "← العودة لتصفح المحفظة كزائر" : "← Return to portfolio as guest"}
            </Link>
          </div>
        </div>

        {/* Card Form */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-xs sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-card-foreground text-2xl font-semibold tracking-tight">
              {isArabic ? "تسجيل الدخول" : "Sign In"}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-xs">
              {isArabic
                ? "سجّل الدخول إلى حسابك أو لوحة التحكم"
                : "Sign in to your account or administrator panel"}
            </p>
          </div>

          <SignInForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
