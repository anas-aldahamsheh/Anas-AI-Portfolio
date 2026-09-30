"use client";

import { FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { uploadMedia } from "@/server/actions/admin";
import type { AdminStrings } from "../strings";

/** Downscales large photos in the browser (≤1800px, WebP) so uploads stay fast and under limits. */
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml")
    return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 900_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86),
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export function MediaField({
  value,
  onChange,
  accept,
  strings,
}: {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  strings: AdminStrings;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isImage = accept?.startsWith("image") ?? false;

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("file", isImage ? await compressImage(file) : file);
    if (isImage) form.set("accept", "image");
    const result = await uploadMedia(form);
    setBusy(false);
    if (result.ok) onChange(result.data.url);
    else setError(result.error);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-16 w-24 rounded-lg border border-slate-200 object-cover dark:border-white/10"
            />
          ) : (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="flex h-16 w-24 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-white/10"
            >
              <FileText className="h-6 w-6" />
            </a>
          )
        ) : (
          <span className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 dark:border-white/15">
            <ImagePlus className="h-5 w-5" />
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {busy ? strings.uploading : value ? strings.replace : strings.upload}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {strings.remove}
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
      </div>
      <input
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={strings.orPasteUrl}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
