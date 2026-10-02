"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A silent loop of a project's recorded run over its poster frame. The clip only loads once
 * the frame is near the viewport (or on hover, with `playOnHover`), and never for visitors who
 * prefer reduced motion, so a page of cards stays as light as a page of images.
 */
export function LivePreview({
  src,
  poster,
  alt,
  playOnHover = false,
  priority = false,
  className,
}: {
  src: string;
  poster: string;
  alt: string;
  playOnHover?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (playOnHover) {
      // Touch screens have no hover: the card shows its still image.
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const host = element.closest("[data-preview-host]") ?? element;
      const enter = () => setActive(true);
      const leave = () => {
        setActive(false);
        setReady(false);
      };
      host.addEventListener("pointerenter", enter);
      host.addEventListener("pointerleave", leave);
      return () => {
        host.removeEventListener("pointerenter", enter);
        host.removeEventListener("pointerleave", leave);
      };
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "150px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [playOnHover]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) void video.play().catch(() => {});
    else video.pause();
  }, [active]);

  return (
    <div ref={ref} className={cn("absolute inset-0", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      {active ? (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setReady(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
    </div>
  );
}
