import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaImage } from "@/ui/media-image";

const SIZES = {
  sm: { box: "h-7 w-7", text: "text-[11px]", px: "28px" },
  md: { box: "h-10 w-10", text: "text-sm", px: "40px" },
  lg: { box: "h-14 w-14", text: "text-xl", px: "56px" },
} as const;

/**
 * The assistant's face: the owner's photo when one is uploaded (profile → avatar), otherwise
 * their initial on the brand gradient. The sparkle badge marks it as the AI, not the person.
 */
export function AssistantAvatar({
  name,
  avatar,
  size = "md",
  online = false,
  className,
}: {
  name: string;
  avatar?: string | undefined;
  size?: keyof typeof SIZES;
  online?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  const initial = (name.trim()[0] ?? "A").toUpperCase();
  return (
    <span className={cn("relative inline-flex shrink-0", s.box, className)} aria-hidden="true">
      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[conic-gradient(from_210deg,#173B6C,#2F6FED,#0891B2,#173B6C)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] ring-2 ring-white/70 dark:bg-[conic-gradient(from_210deg,#4F46E5,#6366F1,#0891B2,#4F46E5)] dark:ring-white/15">
        {avatar ? (
          <MediaImage src={avatar} alt="" sizes={s.px} className="object-cover" />
        ) : (
          <span className={cn("font-display leading-none font-bold", s.text)}>{initial}</span>
        )}
      </span>
      <span className="absolute -end-1 -top-1 flex h-[46%] w-[46%] items-center justify-center rounded-full bg-white text-[#2F6FED] shadow-sm ring-1 ring-[#173B6C]/10 dark:bg-[#0B1728] dark:text-[#A5B4FC] dark:ring-white/15">
        <Sparkles className="h-[62%] w-[62%]" />
      </span>
      {online ? (
        <span className="absolute -end-0.5 -bottom-0.5 h-[30%] w-[30%] rounded-full border-2 border-white bg-emerald-500 dark:border-[#0A1426]" />
      ) : null}
    </span>
  );
}
