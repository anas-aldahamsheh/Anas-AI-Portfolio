"use client";

import { useState } from "react";
import { Upload, CheckCircle2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAdminEdit } from "@/modules/admin/presentation";
import type { CvVersion, PublishedCv } from "../domain/cv";

export interface CvAdminControlsProps {
  currentCv: PublishedCv;
  versions?: CvVersion[] | undefined;
  onRefresh?: (() => void) | undefined;
}

export function CvAdminControls({ currentCv, versions = [], onRefresh }: CvAdminControlsProps) {
  const { isAdmin, isEditMode } = useAdminEdit();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changelog, setChangelog] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isAdmin || !isEditMode) {
    return null;
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (changelog) formData.append("changelog", changelog);

    try {
      const res = await fetch("/api/admin/cv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage({ type: "success", text: "New CV version uploaded successfully!" });
      setSelectedFile(null);
      setChangelog("");
      onRefresh?.();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload file",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async (versionId: string) => {
    setIsPublishing(versionId);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/cv", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Publish failed");
      }

      setMessage({ type: "success", text: "CV version published successfully!" });
      onRefresh?.();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish version",
      });
    } finally {
      setIsPublishing(null);
    }
  };

  return (
    <Card className="my-6 border-dashed border-neutral-300 bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-900/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Upload className="h-4 w-4" />
            <span>Admin CV Management & Versioning</span>
          </CardTitle>
          <Badge variant="outline" size="sm">
            Current: v{currentCv.versionNumber}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div
            className={`rounded-lg p-2.5 text-xs font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="grid items-end gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label
              htmlFor="cv-file-input"
              className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
            >
              PDF Document
            </label>
            <Input
              id="cv-file-input"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="cv-changelog-input"
              className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
            >
              Changelog / Release Notes
            </label>
            <Input
              id="cv-changelog-input"
              type="text"
              placeholder="e.g. Added 2026 AI Agent achievements"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUploading}
              disabled={!selectedFile}
              className="w-full text-xs"
            >
              Upload New Version
            </Button>
          </div>
        </form>

        {/* Version History List */}
        {versions.length > 0 && (
          <div className="space-y-2 border-t border-neutral-200 pt-2 dark:border-neutral-800">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              <History className="h-3.5 w-3.5" />
              <span>Available Versions</span>
            </h4>
            <div className="max-h-40 space-y-1.5 overflow-y-auto">
              {versions.map((ver) => {
                const isCurrent = ver.versionNumber === currentCv.versionNumber;
                return (
                  <div
                    key={ver.id}
                    className="flex items-center justify-between rounded-md border border-neutral-200 bg-white p-2 text-xs dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={isCurrent ? "default" : "secondary"} size="sm">
                        v{ver.versionNumber}
                      </Badge>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {ver.fileName}
                      </span>
                      {ver.changelog && (
                        <span className="max-w-xs truncate text-[11px] text-neutral-500">
                          — {ver.changelog}
                        </span>
                      )}
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          isLoading={isPublishing === ver.id}
                          onClick={() => handlePublish(ver.id)}
                          className="h-6 px-2 text-[11px]"
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
