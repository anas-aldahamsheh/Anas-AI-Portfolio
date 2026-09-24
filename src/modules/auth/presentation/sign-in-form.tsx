"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/security/auth-client";
import { signInSchema, type SignInInput } from "../domain/validation";

interface SignInFormProps {
  locale: string;
}

export function SignInForm({ locale }: SignInFormProps) {
  const router = useRouter();
  const isArabic = locale === "ar";

  const [formData, setFormData] = useState<SignInInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    const validationResult = signInSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (res.error) {
        setGeneralError(
          res.error.message ||
            (isArabic
              ? "فشل تسجيل الدخول. يرجى التحقق من بياناتك."
              : "Failed to sign in. Please check your credentials."),
        );
        setIsLoading(false);
        return;
      }

      router.push(`/${locale}`);
      router.refresh();
    } catch {
      setGeneralError(
        isArabic
          ? "حدث خطأ غير متوقع أثناء تسجيل الدخول."
          : "An unexpected error occurred during sign in.",
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {generalError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs sm:text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {generalError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="font-space-grotesk text-xs sm:text-sm font-semibold text-[#173B6C] dark:text-[#E2E8F0] mb-1.5 block">
          {isArabic ? "البريد الإلكتروني" : "Email Address"}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-xl border border-[#D8E2EE] bg-white px-3.5 py-2.5 text-sm text-[#173B6C] shadow-2xs placeholder:text-[#94A3B8] transition-all duration-200 outline-none focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.12] dark:bg-[#07101F]/80 dark:text-[#F8FAFC] dark:placeholder:text-[#64748B] dark:focus:border-[#38BDF8] dark:focus:ring-cyan-500/20"
          placeholder="name@example.com"
          disabled={isLoading}
        />
        {errors["email"] && <p className="text-rose-600 dark:text-rose-400 mt-1 text-xs">{errors["email"]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="font-space-grotesk text-xs sm:text-sm font-semibold text-[#173B6C] dark:text-[#E2E8F0] mb-1.5 block">
          {isArabic ? "كلمة المرور" : "Password"}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full rounded-xl border border-[#D8E2EE] bg-white px-3.5 py-2.5 text-sm text-[#173B6C] shadow-2xs placeholder:text-[#94A3B8] transition-all duration-200 outline-none focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.12] dark:bg-[#07101F]/80 dark:text-[#F8FAFC] dark:placeholder:text-[#64748B] dark:focus:border-[#38BDF8] dark:focus:ring-cyan-500/20"
          placeholder="••••••••"
          disabled={isLoading}
        />
        {errors["password"] && (
          <p className="text-rose-600 dark:text-rose-400 mt-1 text-xs">{errors["password"]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="cursor-pointer inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#2F6FED] to-[#4F46E5] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition-all duration-200 hover:from-[#2557BC] hover:to-[#4338CA] hover:shadow-lg hover:shadow-blue-500/35 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6FED] disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading
          ? isArabic
            ? "جاري تسجيل الدخول..."
            : "Signing in..."
          : isArabic
            ? "تسجيل الدخول"
            : "Sign In"}
      </button>

      <div className="pt-2 text-center text-xs sm:text-sm text-[#6C7893] dark:text-[#9AA8C0]">
        {isArabic ? "ليس لديك حساب؟ " : "Don't have an account? "}
        <Link
          href={`/${locale}/sign-up`}
          className="font-semibold text-[#2F6FED] underline underline-offset-4 transition-colors hover:text-[#1E40AF] dark:text-[#67E8F9] dark:hover:text-[#38BDF8]"
        >
          {isArabic ? "إنشاء حساب جديد" : "Sign up"}
        </Link>
      </div>
    </form>
  );
}
