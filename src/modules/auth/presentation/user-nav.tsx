"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { LogIn, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { signOut, useSession } from "@/lib/security/auth-client";

export interface UserNavProps {
  locale: string;
  initialUser?: {
    id: string;
    email: string;
    name?: string | null | undefined;
    image?: string | null | undefined;
    role?: string | undefined;
  } | null | undefined;
  className?: string | undefined;
}

export function UserNav({ locale, initialUser, className = "" }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isArabic = locale === "ar";

  // Use client-side session if available, falling back to server-provided initialUser
  const { data: clientSession } = useSession();
  const sessionUser = clientSession?.user;

  const user = sessionUser
    ? {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        image: sessionUser.image,
        role: initialUser?.role,
      }
    : initialUser;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Handle ESC and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDropdown();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      closeDropdown();
      await signOut();
      window.location.href = `/${locale}`;
    } catch {
      window.location.reload();
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (nameOrEmail?: string | null) => {
    if (!nameOrEmail) return "U";
    const cleaned = nameOrEmail.trim();
    if (!cleaned) return "U";
    const parts = cleaned.split(/[\s@]+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return cleaned.slice(0, 2).toUpperCase();
  };

  // 1. Guest View (Not Logged In)
  if (!user) {
    return (
      <Link
        href={`/${locale}/sign-in`}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border border-[#E4EAF3] bg-white/90 px-3.5 text-xs font-semibold text-[#173B6C] shadow-2xs transition-all duration-200 hover:bg-[#EEF5FF] hover:border-[#D0E2FF] hover:text-[#1E40AF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-[#E2E8F0] dark:hover:bg-white/[0.1] dark:hover:text-white cursor-pointer ${className}`.trim()}
        title={isArabic ? "تسجيل الدخول" : "Sign In"}
        aria-label={isArabic ? "تسجيل الدخول" : "Sign In"}
      >
        <LogIn className="h-3.5 w-3.5 text-[#2F6FED] dark:text-[#67E8F9]" />
        <span className="font-semibold">
          {isArabic ? "تسجيل الدخول" : "Sign In"}
        </span>
      </Link>
    );
  }

  // 2. Authenticated User View (Logged In)
  const displayName = user.name || user.email?.split("@")[0] || "User";
  const role = user.role;
  const isAdmin = role === "ADMIN";

  return (
    <div className="relative inline-block text-start">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`group/usernav inline-flex h-9 items-center gap-2 rounded-full border border-[#E4EAF3] bg-white/95 px-2.5 sm:px-3 text-xs font-semibold text-[#173B6C] shadow-2xs transition-all duration-200 hover:bg-[#EEF5FF] hover:border-[#BFD5F5] hover:text-[#1E40AF] hover:shadow-[0_2px_12px_rgba(47,111,237,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6FED] dark:border-white/[0.12] dark:bg-[#0B1728]/90 dark:text-[#E2E8F0] dark:hover:bg-[#13233D] dark:hover:border-white/[0.22] dark:hover:text-white dark:hover:shadow-[0_4px_16px_rgba(56,189,248,0.18)] cursor-pointer ${className}`.trim()}
        title={displayName}
        aria-label={isArabic ? `حساب المستخدم: ${displayName}` : `User account: ${displayName}`}
      >
        {/* Dynamic Glowing Avatar */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#2F6FED] to-[#4F46E5] text-white text-[11px] font-bold shadow-xs transition-transform duration-200 group-hover/usernav:scale-105 dark:from-[#38BDF8] dark:to-[#818CF8] dark:text-[#07101F]">
          {user.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.image}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <span>{getInitials(displayName)}</span>
          )}
        </div>

        <span className="max-w-[120px] truncate hidden md:inline font-medium tracking-tight">
          {displayName}
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 text-[#6C7893] transition-all duration-200 group-hover/usernav:text-[#173B6C] dark:text-[#9AA8C0] dark:group-hover/usernav:text-white ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Menu with Brand Glassmorphic Styling */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="menu"
          className="absolute end-0 top-full mt-2 w-60 rounded-2xl border border-[#E4EAF3] bg-white/98 p-1.5 shadow-[0_16px_40px_rgba(23,59,108,0.14)] backdrop-blur-xl dark:border-white/[0.12] dark:bg-[#0B1728]/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Info */}
          <div className="border-b border-[#F0F4FA] px-3.5 py-2.5 dark:border-white/[0.08]">
            <p className="text-xs font-bold text-[#173B6C] truncate dark:text-[#F4F7FF]">
              {displayName}
            </p>
            <p className="text-[11px] text-[#6C7893] truncate dark:text-[#9AA8C0] mt-0.5">
              {user.email}
            </p>
            {role && (
              <span className="mt-2 inline-flex items-center rounded-full border border-[#D0E2FF] bg-[#EEF5FF] px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#2F6FED] dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-[#67E8F9]">
                {role}
              </span>
            )}
          </div>

          {/* Action Links */}
          <div className="pt-1.5 space-y-1">
            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                onClick={closeDropdown}
                role="menuitem"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#173B6C] transition-colors hover:bg-[#EEF5FF] hover:text-[#1E40AF] dark:text-[#E2E8F0] dark:hover:bg-white/[0.08] dark:hover:text-[#67E8F9]"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[#2F6FED] dark:text-[#67E8F9]" />
                <span>{isArabic ? "لوحة التحكم (Admin)" : "Admin Dashboard"}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>
                {isSigningOut
                  ? isArabic
                    ? "جاري الخروج..."
                    : "Signing Out..."
                  : isArabic
                    ? "تسجيل الخروج"
                    : "Sign Out"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
