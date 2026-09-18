"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

export interface LanguageSelectProps {
  currentLocale: string;
  ariaLabel?: string;
  className?: string;
}

export function LanguageSelect({
  currentLocale,
  ariaLabel = "Select language",
  className,
}: LanguageSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleValueChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && (segments[0] === "ar" || segments[0] === "en")) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPath = `/${segments.join("/")}`;

    startTransition(() => {
      router.push(newPath);
    });
  };

  return (
    <div className="flex items-center">
      <Select
        value={currentLocale}
        onValueChange={handleValueChange}
        disabled={isPending}
        dir={currentLocale === "ar" ? "rtl" : "ltr"}
      >
        <SelectTrigger
          aria-label={ariaLabel}
          className={className || "h-9 w-[135px] text-xs font-medium"}
        >
          <div className="flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ar">العربية (AR)</SelectItem>
          <SelectItem value="en">English (EN)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
