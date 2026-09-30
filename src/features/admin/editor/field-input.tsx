"use client";

import type { FieldSpec } from "@/server/content/collections";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { AdminStrings } from "../strings";
import { MediaField } from "./media-field";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100";

export function FieldInput({
  field,
  value,
  onChange,
  locale,
  strings,
  autoFocus,
}: {
  field: FieldSpec;
  value: unknown;
  onChange: (value: unknown) => void;
  locale: Locale;
  strings: AdminStrings;
  autoFocus?: boolean;
}) {
  const id = `field-${field.name}-${field.localized ? locale : "shared"}`;
  const label = (
    <label
      htmlFor={id}
      className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
    >
      <span>
        {field.label[locale]}
        {field.required ? <span className="text-rose-500"> *</span> : null}
      </span>
      {field.kind === "list" ? (
        <span className="font-normal text-slate-400">{strings.listHint}</span>
      ) : null}
      {field.kind === "tags" ? (
        <span className="font-normal text-slate-400">{strings.tagsHint}</span>
      ) : null}
    </label>
  );
  const dir = field.localized ? (locale === "ar" ? "rtl" : "ltr") : undefined;
  const text = typeof value === "string" ? value : "";
  const list = Array.isArray(value) ? (value as string[]) : [];

  switch (field.kind) {
    case "textarea":
    case "richtext":
      return (
        <div>
          {label}
          <textarea
            id={id}
            dir={dir}
            autoFocus={autoFocus}
            value={text}
            rows={Math.min(14, Math.max(3, Math.ceil(text.length / 70)))}
            onChange={(event) => onChange(event.target.value)}
            className={cn(inputClass, "resize-y leading-relaxed")}
          />
        </div>
      );
    case "list":
      return (
        <div>
          {label}
          <textarea
            id={id}
            dir={dir}
            autoFocus={autoFocus}
            value={list.join("\n")}
            rows={Math.min(14, Math.max(3, list.length + 1))}
            onChange={(event) => onChange(event.target.value.split("\n"))}
            onBlur={(event) =>
              onChange(
                event.target.value
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean),
              )
            }
            className={cn(inputClass, "resize-y leading-relaxed")}
          />
        </div>
      );
    case "tags":
      return (
        <div>
          {label}
          <input
            id={id}
            autoFocus={autoFocus}
            defaultValue={list.join(", ")}
            onBlur={(event) =>
              onChange([
                ...new Set(
                  event.target.value
                    .split(/[,\n،]/)
                    .map((t) => t.trim())
                    .filter(Boolean),
                ),
              ])
            }
            className={inputClass}
          />
          {list.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {list.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      );
    case "boolean":
      return (
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {field.label[locale]}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              value ? "bg-indigo-600" : "bg-slate-300 dark:bg-white/20",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                value ? "start-[22px]" : "start-0.5",
              )}
            />
          </button>
        </label>
      );
    case "select":
      return (
        <div>
          {label}
          <select
            id={id}
            value={text}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label[locale]}
              </option>
            ))}
          </select>
        </div>
      );
    case "media":
    case "file":
      return (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {field.label[locale]}
          </p>
          <MediaField
            value={text}
            onChange={onChange}
            strings={strings}
            {...(field.accept ? { accept: field.accept } : {})}
          />
        </div>
      );
    default:
      return (
        <div>
          {label}
          <input
            id={id}
            dir={
              field.kind === "url" || field.kind === "email" || field.kind === "date" ? "ltr" : dir
            }
            type={field.kind === "email" ? "email" : field.kind === "url" ? "url" : "text"}
            placeholder={field.kind === "date" ? "2025-06" : undefined}
            autoFocus={autoFocus}
            value={text}
            onChange={(event) => onChange(event.target.value)}
            className={inputClass}
          />
        </div>
      );
  }
}
