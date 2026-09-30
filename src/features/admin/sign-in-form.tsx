"use client";

import { m } from "motion/react";
import { Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/security/auth-client";
import { useI18n } from "@/i18n/provider";

export function SignInForm() {
  const { t, locale } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: signInError } = await authClient.signIn.email({ email: email.trim(), password });
    if (signInError) {
      setBusy(false);
      setError(t("auth.invalid"));
      return;
    }
    const session = (await fetch("/api/admin/session", { cache: "no-store" }).then((r) =>
      r.json(),
    )) as { admin: boolean };
    if (!session.admin) {
      await authClient.signOut();
      setBusy(false);
      setError(t("auth.notAdmin"));
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.assign(next && next.startsWith(`/${locale}`) ? next : `/${locale}/admin`);
  };

  return (
    <m.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="w-full max-w-sm space-y-5 rounded-3xl border border-[#E5EAF2] bg-white/90 p-7 shadow-[0_30px_80px_-40px_rgba(23,59,108,0.5)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0B1728]/90"
    >
      <div className="space-y-2 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#173B6C] via-[#2F6FED] to-[#0891B2] text-white shadow-lg">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="font-display text-xl font-bold text-[#173B6C] dark:text-[#F4F7FF]">
          {t("auth.title")}
        </h1>
        <p className="text-xs leading-relaxed text-[#637089] dark:text-[#9AA8C0]">
          {t("auth.subtitle")}
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-semibold text-[#173B6C] dark:text-[#E2E8F0]"
          >
            {t("auth.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFF] px-3.5 py-2.5 text-sm transition outline-none focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold text-[#173B6C] dark:text-[#E2E8F0]"
          >
            {t("auth.password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#E5EAF2] bg-[#F8FAFF] px-3.5 py-2.5 text-sm transition outline-none focus:border-[#2F6FED] focus:bg-white focus:ring-4 focus:ring-[#2F6FED]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
          />
        </div>
      </div>
      {error ? (
        <m.p
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: [0, -6, 6, -3, 3, 0] }}
          className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
          role="alert"
        >
          {error}
        </m.p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="btn-action-primary w-full disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {t("auth.submit")}
      </button>
    </m.form>
  );
}
