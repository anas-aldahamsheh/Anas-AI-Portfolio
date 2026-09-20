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
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white px-2.5 text-xs font-semibold text-neutral-800 shadow-xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 cursor-pointer ${className}`.trim()}
        title={isArabic ? "تسجيل الدخول" : "Sign In"}
        aria-label={isArabic ? "تسجيل الدخول" : "Sign In"}
      >
        <LogIn className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
        <span className="hidden sm:inline font-medium">
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
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-white px-2 text-xs font-semibold text-neutral-800 shadow-xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 cursor-pointer ${className}`.trim()}
        title={displayName}
        aria-label={isArabic ? `حساب المستخدم: ${displayName}` : `User account: ${displayName}`}
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-bold text-[11px]">
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

        <span className="max-w-[110px] truncate hidden md:inline font-medium">
          {displayName}
        </span>

        <ChevronDown
          className={`h-3 w-3 opacity-60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="menu"
          className="absolute end-0 top-full mt-2 w-56 rounded-xl border border-neutral-200/80 bg-white p-1.5 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Info */}
          <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800/80">
            <p className="text-xs font-bold text-neutral-900 truncate dark:text-neutral-100">
              {displayName}
            </p>
            <p className="text-[11px] text-neutral-500 truncate dark:text-neutral-400">
              {user.email}
            </p>
            {role && (
              <span className="mt-1.5 inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {role}
              </span>
            )}
          </div>

          {/* Action Links */}
          <div className="pt-1 space-y-0.5">
            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                onClick={closeDropdown}
                role="menuitem"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                <LayoutDashboard className="h-3.5 w-3.5 opacity-70" />
                <span>{isArabic ? "لوحة التحكم (Admin)" : "Admin Dashboard"}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 cursor-pointer disabled:opacity-50"
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
