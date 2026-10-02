"use client";

import { AnimatePresence, m, useInView, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, Monitor, Play, Smartphone, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { ShowcaseItem } from "@/server/content/collections";
import { cn } from "@/lib/utils";

export interface ShowcaseLabels {
  video: string;
  play: string;
  desktop: string;
  mobile: string;
  prev: string;
  next: string;
  open: string;
  close: string;
  of: string;
}

type Image = ShowcaseItem & { kind: "image" };

const pad = (n: number) => String(n).padStart(2, "0");

function caption(item: ShowcaseItem, locale: string): string {
  return (
    (locale === "ar" ? item.caption.ar || item.caption.en : item.caption.en || item.caption.ar) ??
    ""
  );
}

function srcSet(item: ShowcaseItem): string | undefined {
  if (!item.srcLarge) return undefined;
  return `${item.src} ${item.width}w, ${item.srcLarge} ${Math.round(item.width * 1.78)}w`;
}

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Window chrome around desktop captures, so a screenshot reads as a running app. */
export function BrowserFrame({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white shadow-[0_40px_90px_-50px_rgba(23,59,108,0.6)] dark:border-white/[0.09] dark:bg-[#0B1728]",
        className,
      )}
    >
      <div
        dir="ltr"
        className="flex items-center gap-3 border-b border-[#E5EAF2] bg-[#F6F8FC] px-4 py-2.5 dark:border-white/[0.07] dark:bg-white/[0.03]"
      >
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </span>
        <span className="mx-auto max-w-[60%] truncate rounded-md bg-white px-3 py-0.5 text-center text-[11px] text-[#637089] dark:bg-white/[0.05] dark:text-[#9AA8C0]">
          {label}
        </span>
        <span className="w-[42px]" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}

/** Phone bezel around mobile captures. */
function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-[2.2rem] border border-[#D5DDEA] bg-[#0B1220] px-2 pt-7 pb-6 shadow-[0_30px_70px_-35px_rgba(23,59,108,0.7)] dark:border-white/[0.12]",
        className,
      )}
    >
      <span
        className="absolute top-2.5 left-1/2 h-[12px] w-[64px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10"
        aria-hidden="true"
      />
      <div className="overflow-hidden rounded-[0.9rem] bg-black">{children}</div>
      <span
        className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/25"
        aria-hidden="true"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Recorded run
// ---------------------------------------------------------------------------------------------

function VideoStage({
  video,
  title,
  locale,
  labels,
}: {
  video: ShowcaseItem;
  title: string;
  locale: string;
  labels: ShowcaseLabels;
}) {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { margin: "200px 0px" });
  const reduced = usePrefersReducedMotion();
  const text = caption(video, locale);
  const mobile = video.device === "mobile";

  const screen = (
    <div
      className="relative w-full bg-black"
      style={{ aspectRatio: `${video.width} / ${video.height}` }}
    >
      {playing ? (
        <video
          src={video.src}
          poster={video.poster || undefined}
          className="absolute inset-0 h-full w-full"
          controls
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-label={text || title}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full cursor-pointer"
          aria-label={`${labels.play}: ${text || title}`}
        >
          {video.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.poster}
              alt=""
              width={video.width}
              height={video.height}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          {video.preview && inView && !reduced ? (
            <video
              src={video.preview}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
            />
          ) : null}
          <span className="absolute inset-0 bg-gradient-to-t from-[#07101F]/70 via-[#07101F]/10 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/30 [animation-duration:2.2s]" />
              <span className="absolute inset-0 rounded-full bg-white/90 shadow-[0_10px_40px_rgba(47,111,237,0.55)] transition-transform duration-500 group-hover:scale-110 dark:bg-white" />
              <Play
                className="relative h-7 w-7 translate-x-0.5 fill-[#2F6FED] text-[#2F6FED] sm:h-8 sm:w-8"
                aria-hidden="true"
              />
            </span>
          </span>
          <span className="absolute start-4 bottom-4 flex items-center gap-2 text-start">
            <span className="rounded-full bg-black/55 px-2.5 py-1 font-mono text-[11px] font-semibold text-white backdrop-blur-sm">
              {formatDuration(video.duration)}
            </span>
            <span className="hidden rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:inline">
              {labels.video}
            </span>
          </span>
        </button>
      )}
    </div>
  );

  return (
    <figure ref={frameRef} className="space-y-3">
      {mobile ? (
        <PhoneFrame className="mx-auto w-full max-w-[320px]">{screen}</PhoneFrame>
      ) : (
        <BrowserFrame label={title}>{screen}</BrowserFrame>
      )}
      {text ? (
        <figcaption className="text-center text-sm text-[#637089] dark:text-[#9AA8C0]">
          {text}
        </figcaption>
      ) : null}
    </figure>
  );
}

// ---------------------------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------------------------

function Lightbox({
  images,
  index,
  locale,
  labels,
  onIndex,
  onClose,
}: {
  images: Image[];
  index: number;
  locale: string;
  labels: ShowcaseLabels;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [direction, setDirection] = useState(0);
  const rtl = locale === "ar";
  const item = images[index]!;

  const go = useCallback(
    (step: number) => {
      setDirection(step);
      onIndex((index + step + images.length) % images.length);
    },
    [index, images.length, onIndex],
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") go(rtl ? -1 : 1);
      else if (event.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, rtl]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (Math.abs(swipe) < 60) return;
    const forward = swipe < 0;
    go(forward !== rtl ? 1 : -1);
  };

  const text = caption(item, locale);
  const Prev = rtl ? ChevronRight : ChevronLeft;
  const Next = rtl ? ChevronLeft : ChevronRight;

  return createPortal(
    <m.div
      role="dialog"
      aria-modal="true"
      aria-label={text || labels.open}
      className="fixed inset-0 z-[100] flex flex-col bg-[#040A14]/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      dir={rtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <span className="font-mono text-xs tracking-wider text-white/70">
          {pad(index + 1)} {labels.of} {pad(images.length)}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={labels.close}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <m.img
            key={item.src}
            src={item.srcLarge || item.src}
            alt={text}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: (rtl ? -d : d) * 80, scale: 0.98 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (d: number) => ({ opacity: 0, x: (rtl ? d : -d) * 80, scale: 0.98 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={onDragEnd}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "max-h-full max-w-full cursor-grab touch-pan-y rounded-xl object-contain shadow-2xl select-none active:cursor-grabbing",
              item.device === "mobile" && "max-h-[82vh]",
            )}
            draggable={false}
          />
        </AnimatePresence>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                go(-1);
              }}
              className="absolute start-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:block"
              aria-label={labels.prev}
            >
              <Prev className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                go(1);
              }}
              className="absolute end-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:block"
              aria-label={labels.next}
            >
              <Next className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>
      <p className="min-h-14 px-6 py-4 text-center text-sm text-white/85">{text}</p>
    </m.div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------------------------

function DesktopStage({
  images,
  title,
  locale,
  labels,
  onOpen,
}: {
  images: Image[];
  title: string;
  locale: string;
  labels: ShowcaseLabels;
  onOpen: (i: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const rtl = locale === "ar";
  const item = images[index]!;
  const text = caption(item, locale);

  const select = (next: number) => {
    const target = (next + images.length) % images.length;
    setDirection(target > index ? 1 : -1);
    setIndex(target);
  };

  useEffect(() => {
    const thumb = stripRef.current?.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    thumb?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (Math.abs(swipe) < 60) return;
    const forward = swipe < 0;
    select(index + (forward !== rtl ? 1 : -1));
  };

  const Prev = rtl ? ChevronRight : ChevronLeft;
  const Next = rtl ? ChevronLeft : ChevronRight;
  // All screens share a frame size, so switching never makes the page jump.
  const ratio = Math.min(...images.map((i) => i.width / i.height));

  return (
    <div
      className="space-y-4"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") select(index + (rtl ? -1 : 1));
        if (event.key === "ArrowLeft") select(index + (rtl ? 1 : -1));
      }}
    >
      <BrowserFrame label={title}>
        <div
          className="group relative w-full overflow-hidden bg-[#F6F8FC] dark:bg-[#07101F]"
          style={{ aspectRatio: String(ratio) }}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <m.button
              key={item.src}
              type="button"
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: `${(rtl ? -d : d) * 6}%`, scale: 1.02 }),
                center: { opacity: 1, x: "0%", scale: 1 },
                exit: (d: number) => ({ opacity: 0, x: `${(rtl ? d : -d) * 6}%`, scale: 0.98 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 220, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={onDragEnd}
              onClick={() => onOpen(index)}
              className="absolute inset-0 block h-full w-full cursor-zoom-in touch-pan-y"
              aria-label={`${labels.open}: ${text || title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                srcSet={srcSet(item)}
                sizes="(min-width: 1280px) 1100px, 100vw"
                alt={text}
                width={item.width}
                height={item.height}
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover object-top select-none"
              />
            </m.button>
          </AnimatePresence>
          <span className="pointer-events-none absolute end-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
            {labels.open}
          </span>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => select(index - 1)}
                className="absolute start-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/85 text-[#173B6C] opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:opacity-100 focus-visible:opacity-100 dark:bg-[#0B1728]/85 dark:text-white"
                aria-label={labels.prev}
              >
                <Prev className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => select(index + 1)}
                className="absolute end-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/85 text-[#173B6C] opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:opacity-100 focus-visible:opacity-100 dark:bg-[#0B1728]/85 dark:text-white"
                aria-label={labels.next}
              >
                <Next className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </BrowserFrame>

      <div className="flex min-h-12 items-start justify-between gap-4">
        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={item.src}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm leading-relaxed text-[#637089] dark:text-[#9AA8C0]"
            aria-live="polite"
          >
            {text}
          </m.p>
        </AnimatePresence>
        <span className="shrink-0 pt-0.5 font-mono text-xs font-semibold text-[#173B6C] dark:text-[#E2E8F0]">
          {pad(index + 1)}
          <span className="text-[#637089] dark:text-[#9AA8C0]"> / {pad(images.length)}</span>
        </span>
      </div>

      {images.length > 1 ? (
        <div
          ref={stripRef}
          className="-mx-1 flex snap-x [scrollbar-width:thin] gap-2.5 overflow-x-auto px-1 pt-1 pb-2"
        >
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              data-thumb={i}
              onClick={() => select(i)}
              aria-label={caption(image, locale) || `${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative aspect-[16/10] w-28 shrink-0 snap-start overflow-hidden rounded-lg border transition-all duration-300 sm:w-36",
                i === index
                  ? "border-transparent"
                  : "border-[#E5EAF2] opacity-60 hover:opacity-100 dark:border-white/[0.08]",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
              {i === index ? (
                <m.span
                  layoutId="showcase-thumb"
                  className="absolute inset-0 rounded-lg ring-2 ring-[#2F6FED] ring-inset dark:ring-indigo-400"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileRail({
  images,
  locale,
  labels,
  onOpen,
}: {
  images: Image[];
  locale: string;
  labels: ShowcaseLabels;
  onOpen: (i: number) => void;
}) {
  return (
    <ul
      className={cn(
        "-mx-4 flex snap-x snap-mandatory [scrollbar-width:thin] gap-6 overflow-x-auto px-4 pt-2 pb-6 sm:mx-0 sm:px-0",
        images.length <= 3 && "sm:justify-center",
      )}
    >
      {images.map((image, i) => {
        const text = caption(image, locale);
        return (
          <m.li
            key={image.src}
            className="w-[220px] shrink-0 snap-center sm:w-[240px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 26,
              delay: Math.min(i, 5) * 0.07,
            }}
          >
            <button
              type="button"
              onClick={() => onOpen(i)}
              className="group block w-full cursor-zoom-in text-start"
              aria-label={`${labels.open}: ${text}`}
            >
              <PhoneFrame className="transition-transform duration-500 group-hover:-translate-y-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={text}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </PhoneFrame>
              {text ? (
                <span className="mt-3 block text-center text-xs leading-relaxed text-[#637089] dark:text-[#9AA8C0]">
                  {text}
                </span>
              ) : null}
            </button>
          </m.li>
        );
      })}
    </ul>
  );
}

export function ProjectShowcase({
  items,
  title,
  locale,
  labels,
}: {
  items: ShowcaseItem[];
  title: string;
  locale: string;
  labels: ShowcaseLabels;
}) {
  const videos = useMemo(() => items.filter((i) => i.kind === "video"), [items]);
  const desktop = useMemo(
    () => items.filter((i): i is Image => i.kind === "image" && i.device === "desktop"),
    [items],
  );
  const mobile = useMemo(
    () => items.filter((i): i is Image => i.kind === "image" && i.device === "mobile"),
    [items],
  );
  const tabs = [
    desktop.length ? ("desktop" as const) : null,
    mobile.length ? ("mobile" as const) : null,
  ].filter((t) => t !== null);
  const [tab, setTab] = useState<"desktop" | "mobile">(tabs[0] ?? "desktop");
  const [open, setOpen] = useState<{ set: "desktop" | "mobile"; index: number } | null>(null);
  const lightboxImages = open?.set === "mobile" ? mobile : desktop;

  return (
    <div className="space-y-12">
      {videos.length ? (
        <div className={cn("grid gap-8", videos.length > 1 && "lg:grid-cols-2")}>
          {videos.map((video) => (
            <VideoStage
              key={video.src}
              video={video}
              title={title}
              locale={locale}
              labels={labels}
            />
          ))}
        </div>
      ) : null}

      {tabs.length ? (
        <div className="space-y-5">
          {tabs.length > 1 ? (
            <div
              role="tablist"
              className="mx-auto flex w-fit items-center gap-1 rounded-full border border-[#E5EAF2] bg-white/80 p-1 dark:border-white/[0.08] dark:bg-white/[0.03]"
            >
              {tabs.map((value) => {
                const active = tab === value;
                const Icon = value === "desktop" ? Monitor : Smartphone;
                const count = value === "desktop" ? desktop.length : mobile.length;
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(value)}
                    className={cn(
                      "relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                      active
                        ? "text-white"
                        : "text-[#637089] hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:text-white",
                    )}
                  >
                    {active ? (
                      <m.span
                        layoutId="showcase-tab"
                        className="absolute inset-0 rounded-full bg-[#173B6C] dark:bg-indigo-600"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <Icon className="relative h-3.5 w-3.5" aria-hidden="true" />
                    <span className="relative">
                      {value === "desktop" ? labels.desktop : labels.mobile}
                    </span>
                    <span className="relative font-mono opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={tab}
              role="tabpanel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {tab === "desktop" && desktop.length ? (
                <DesktopStage
                  images={desktop}
                  title={title}
                  locale={locale}
                  labels={labels}
                  onOpen={(index) => setOpen({ set: "desktop", index })}
                />
              ) : (
                <MobileRail
                  images={mobile}
                  locale={locale}
                  labels={labels}
                  onOpen={(index) => setOpen({ set: "mobile", index })}
                />
              )}
            </m.div>
          </AnimatePresence>
        </div>
      ) : null}

      <AnimatePresence>
        {open ? (
          <Lightbox
            key="lightbox"
            images={lightboxImages}
            index={open.index}
            locale={locale}
            labels={labels}
            onIndex={(index) => setOpen({ set: open.set, index })}
            onClose={() => setOpen(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
