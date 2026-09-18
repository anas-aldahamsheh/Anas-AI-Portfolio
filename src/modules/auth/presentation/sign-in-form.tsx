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
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
        >
          {generalError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="text-foreground mb-1.5 block text-sm font-medium">
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
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="name@example.com"
          disabled={isLoading}
        />
        {errors["email"] && <p className="text-destructive mt-1 text-xs">{errors["email"]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="text-foreground mb-1.5 block text-sm font-medium">
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
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="••••••••"
          disabled={isLoading}
        />
        {errors["password"] && (
          <p className="text-destructive mt-1 text-xs">{errors["password"]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium shadow transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading
          ? isArabic
            ? "جاري تسجيل الدخول..."
            : "Signing in..."
          : isArabic
            ? "تسجيل الدخول"
            : "Sign In"}
      </button>

      <div className="text-muted-foreground pt-2 text-center text-sm">
        {isArabic ? "ليس لديك حساب؟ " : "Don't have an account? "}
        <Link
          href={`/${locale}/sign-up`}
          className="text-foreground hover:text-primary font-medium underline underline-offset-4 transition-colors"
        >
          {isArabic ? "إنشاء حساب جديد" : "Sign up"}
        </Link>
      </div>
    </form>
  );
}
