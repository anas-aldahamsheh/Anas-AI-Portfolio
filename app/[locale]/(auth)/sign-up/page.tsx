import Link from "next/link";
import { SignUpForm } from "@/modules/auth/presentation/sign-up-form";

interface SignUpPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Guest Reassurance Banner */}
        <div className="border-border/80 bg-muted/40 rounded-lg border p-4 text-sm">
          <div className="text-foreground mb-1 font-medium">
            {isArabic ? "💡 زيارة استكشافية؟" : "💡 Exploring as a Guest?"}
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {isArabic
              ? "إنشاء الحساب ليس شرطًا للاستفادة من المحفظة. كافة الوظائف والمشاريع والمساعد الذكي متوفرة بالكامل للزوار."
              : "Creating an account is not required. All features, projects, CV downloads, and AI tools are fully available to guests."}
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
              {isArabic ? "إنشاء حساب جديد" : "Create an Account"}
            </h1>
            <p className="text-muted-foreground mt-1.5 text-xs">
              {isArabic
                ? "أنشئ حسابًا لحفظ التفضيلات أو المزامنة"
                : "Create an account for saved preferences or collaboration"}
            </p>
          </div>

          <SignUpForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
