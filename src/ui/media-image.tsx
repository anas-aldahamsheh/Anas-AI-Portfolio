import Image from "next/image";

/**
 * Renders a media field value. Uploaded files (`/media/...`) and bundled images (`/images/...`)
 * go through next/image; anything else (an external URL the owner pasted) is a lazy <img>.
 */
export function MediaImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
  fill = true,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  if (!src) return null;
  const local = src.startsWith("/");
  if (local && !src.endsWith(".svg")) {
    return fill ? (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "100vw"}
        className={className}
        priority={priority}
      />
    ) : (
      <Image
        src={src}
        alt={alt}
        width={width ?? 1200}
        height={height ?? 800}
        sizes={sizes}
        className={className}
        priority={priority}
      />
    );
  }
  // SVGs and external images: no optimisation needed / possible.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={fill ? `absolute inset-0 h-full w-full ${className ?? ""}` : className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
