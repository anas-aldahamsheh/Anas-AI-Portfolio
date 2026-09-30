"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, m, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { Menu, Sparkles, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/messages";
import { cn } from "@/lib/utils";
import { openAssistant } from "@/features/assistant/events";
import { LanguageSwitch } from "./language-switch";
import { ThemeToggle } from "./theme-toggle";

const LINKS: { href: string; key: MessageKey }[] = [
  { href: "", key: "nav.overview" },
  { href: "/cv", key: "nav.cv" },
  { href: "/experience", key: "nav.experience" },
  { href: "/projects", key: "nav.projects" },
  { href: "/certificates", key: "nav.certificates" },
  { href: "/contact", key: "nav.contact" },
];

export function Navbar({ logo }: { logo: ReactNode }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  // Hide while scrolling down, reveal on the way up; add depth once the page moves.
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(y > 8);
    if (open) return;
    if (y > previous && y > 180) setHidden(true);
    else if (y < previous - 4) setHidden(false);
  });

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setHidden(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hrefOf = (href: string) => `/${locale}${href}`;
  const isActive = (href: string) =>
    href === ""
      ? pathname === `/${locale}` || pathname === `/${locale}/`
      : pathname.startsWith(hrefOf(href));
  const activeHref = LINKS.find((link) => isActive(link.href))?.href ?? null;
  const pill = hovered ?? activeHref;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#173B6C] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t("nav.skip")}
      </a>
      <m.header
        className={cn(
          "vt-static sticky top-0 z-40 w-full border-b transition-[background-color,box-shadow,border-color] duration-300",
          scrolled
            ? "border-neutral-200/80 bg-white/80 shadow-[0_8px_30px_-12px_rgba(23,59,108,0.18)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#07101F]/80 dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
            : "border-transparent bg-white/60 backdrop-blur-md dark:bg-[#07101F]/60",
        )}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
      >
        <div className="mx-auto flex h-16 max-w-[1420px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          <Link
            href={hrefOf("")}
            className="flex shrink-0 items-center transition-opacity hover:opacity-85"
            aria-label={t("nav.overview")}
          >
            {logo}
          </Link>

          <nav
            aria-label={t("nav.main")}
            className="hidden md:block"
            onMouseLeave={() => setHovered(null)}
          >
            <ul className="flex items-center gap-0.5 lg:gap-1">
              {LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.key} className="relative">
                    <Link
                      href={hrefOf(link.href)}
                      aria-current={active ? "page" : undefined}
                      onMouseEnter={() => setHovered(link.href)}
                      onFocus={() => setHovered(link.href)}
                      onBlur={() => setHovered(null)}
                      className={cn(
                        "relative z-10 flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 lg:text-[13px]",
                        active
                          ? "font-semibold text-[#1E40AF] dark:text-indigo-100"
                          : "text-[#637089] hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:text-[#F6F8FC]",
                      )}
                    >
                      <span data-edit-ui={link.key}>{t(link.key)}</span>
                    </Link>
                    {pill === link.href && (
                      <m.span
                        layoutId="nav-pill"
                        className={cn(
                          "absolute inset-0 rounded-full",
                          link.href === activeHref
                            ? "bg-[#EEF5FF] dark:border dark:border-indigo-500/30 dark:bg-indigo-950/70 dark:shadow-[0_0_14px_rgba(99,102,241,0.25)]"
                            : "bg-neutral-100/80 dark:bg-white/[0.06]",
                        )}
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitch />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => openAssistant()}
              className="group ms-0.5 hidden h-9 items-center gap-1.5 rounded-full bg-[#173B6C] px-3.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#1E4B8A] hover:shadow-[0_8px_22px_-8px_rgba(23,59,108,0.6)] active:scale-95 sm:inline-flex dark:bg-[#4F46E5] dark:hover:bg-[#4338CA] dark:hover:shadow-[0_8px_24px_-8px_rgba(79,70,229,0.7)]"
            >
              <Sparkles
                className="h-3.5 w-3.5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[20deg]"
                aria-hidden="true"
              />
              <span data-edit-ui="nav.ask">{t("nav.ask")}</span>
            </button>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 md:hidden dark:text-neutral-200 dark:hover:bg-white/[0.08]"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t("nav.menuClose") : t("nav.menuOpen")}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={open ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                >
                  {open ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </m.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Reading progress, drawn along the header's bottom edge. */}
        <m.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-[#06B6D4] via-[#2F6FED] to-[#8B5CF6] rtl:origin-right"
          style={{ scaleX: progress }}
        />
      </m.header>

      <AnimatePresence>
        {open && (
          <m.div
            key="mobile-menu"
            className="fixed inset-0 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label={t("nav.menuClose")}
              className="absolute inset-0 bg-[#07101F]/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <m.div
              ref={menuRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t("nav.main")}
              className="absolute inset-x-3 top-[4.5rem] origin-top rounded-3xl border border-neutral-200/80 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0B1728]/95"
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <m.ul
                className="flex flex-col gap-1"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
                }}
              >
                {LINKS.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <m.li
                      key={link.key}
                      variants={{
                        hidden: { opacity: 0, x: locale === "ar" ? 16 : -16 },
                        show: { opacity: 1, x: 0 },
                      }}
                    >
                      <Link
                        href={hrefOf(link.href)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-[#EEF5FF] font-semibold text-[#1E40AF] dark:bg-indigo-950/70 dark:text-indigo-100"
                            : "text-[#637089] hover:bg-neutral-100/80 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.06] dark:hover:text-white",
                        )}
                      >
                        {t(link.key)}
                        {active && (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-[#2F6FED] dark:bg-indigo-300"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </m.li>
                  );
                })}
                <m.li
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  className="pt-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openAssistant();
                    }}
                    className="btn-action-primary w-full"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {t("nav.ask")}
                  </button>
                </m.li>
              </m.ul>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
