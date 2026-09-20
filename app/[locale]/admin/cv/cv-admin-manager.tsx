"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Download,
  User,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type CvAboutConfig,
  type PublishedCv,
  type CvVersion,
  DEFAULT_CV_ABOUT,
  formatFileSize,
} from "@/modules/cv/domain/cv";
import { CvDocumentViewer } from "@/modules/cv/presentation";

export interface CvAdminManagerProps {
  initialPublishedCv: PublishedCv;
  initialVersions: CvVersion[];
  initialAbout: CvAboutConfig;
  locale: string;
}

export function CvAdminManager({
  initialPublishedCv,
  initialVersions,
  initialAbout,
  locale,
}: CvAdminManagerProps) {
  const isArabic = locale === "ar";

  const [activeTab, setActiveTab] = useState<"about" | "pdf">("about");
  const [selectedLang, setSelectedLang] = useState<"en" | "ar">(isArabic ? "ar" : "en");

  // About Me Section State
  const [aboutConfig, setAboutConfig] = useState<CvAboutConfig>(
    initialAbout && initialAbout.en && initialAbout.ar ? initialAbout : DEFAULT_CV_ABOUT,
  );
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [aboutMessage, setAboutMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // PDF Versions State
  const [publishedCv, setPublishedCv] = useState<PublishedCv>(initialPublishedCv);
  const [versions, setVersions] = useState<CvVersion[]>(initialVersions);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changelog, setChangelog] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [pdfMessage, setPdfMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ==========================================
  // ABOUT SECTION EDIT HANDLERS
  // ==========================================

  const currentAbout = aboutConfig[selectedLang];

  const handleFieldChange = (field: "badge" | "name" | "headline", value: string) => {
    setAboutConfig((prev) => ({
      ...prev,
      [selectedLang]: {
        ...prev[selectedLang],
        [field]: value,
      },
    }));
  };

  const handleParagraphChange = (index: number, value: string) => {
    setAboutConfig((prev) => {
      const nextParas = [...prev[selectedLang].paragraphs];
      nextParas[index] = value;
      return {
        ...prev,
        [selectedLang]: {
          ...prev[selectedLang],
          paragraphs: nextParas,
        },
      };
    });
  };

  const handleAddParagraph = () => {
    setAboutConfig((prev) => ({
      ...prev,
      [selectedLang]: {
        ...prev[selectedLang],
        paragraphs: [...prev[selectedLang].paragraphs, ""],
      },
    }));
  };

  const handleDeleteParagraph = (index: number) => {
    if (currentAbout.paragraphs.length <= 1) {
      alert(isArabic ? "يجب الإبقاء على فقرة واحدة على الأقل." : "At least one paragraph is required.");
      return;
    }
    setAboutConfig((prev) => {
      const nextParas = prev[selectedLang].paragraphs.filter((_, i) => i !== index);
      return {
        ...prev,
        [selectedLang]: {
          ...prev[selectedLang],
          paragraphs: nextParas,
        },
      };
    });
  };

  const handleMoveParagraph = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= currentAbout.paragraphs.length) return;

    setAboutConfig((prev) => {
      const nextParas = [...prev[selectedLang].paragraphs];
      const moved = nextParas[index];
      if (!moved) return prev;
      nextParas.splice(index, 1);
      nextParas.splice(target, 0, moved);
      return {
        ...prev,
        [selectedLang]: {
          ...prev[selectedLang],
          paragraphs: nextParas,
        },
      };
    });
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAbout(true);
    setAboutMessage(null);

    // Clean empty paragraphs
    const cleanEnParas = aboutConfig.en.paragraphs.map((p) => p.trim()).filter(Boolean);
    const cleanArParas = aboutConfig.ar.paragraphs.map((p) => p.trim()).filter(Boolean);

    const payload: CvAboutConfig = {
      en: {
        ...aboutConfig.en,
        paragraphs: cleanEnParas.length > 0 ? cleanEnParas : DEFAULT_CV_ABOUT.en.paragraphs,
      },
      ar: {
        ...aboutConfig.ar,
        paragraphs: cleanArParas.length > 0 ? cleanArParas : DEFAULT_CV_ABOUT.ar.paragraphs,
      },
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/admin/cv/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save about section");
      }

      setAboutConfig(data.about);
      setAboutMessage({
        type: "success",
        text: isArabic
          ? "تم حفظ وتحديث محتوى قسم (About Me) بنجاح لكلتا اللغتين!"
          : "About Me section content saved and updated successfully for both languages!",
      });
    } catch (err) {
      setAboutMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save about section",
      });
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleResetAboutDefaults = () => {
    const confirmMsg = isArabic
      ? "هل تريد بالتأكيد استعادة النص الأصلي الافتراضي لقسم (About Me) باللغتين؟"
      : "Are you sure you want to restore the default About Me text for both languages?";
    if (!window.confirm(confirmMsg)) return;

    setAboutConfig(DEFAULT_CV_ABOUT);
    setAboutMessage({
      type: "success",
      text: isArabic ? "تمت استعادة النص الافتراضي، اضغط حفظ لتأكيده." : "Defaults restored, click Save to persist.",
    });
  };

  // ==========================================
  // PDF UPLOAD & PUBLISH OPERATIONS
  // ==========================================

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setPdfMessage(null);

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

      setPdfMessage({
        type: "success",
        text: isArabic
          ? "تم رفع نسخة السيرة الذاتية الجديدة بنجاح! يمكنك نشرها الآن من القائمة بالأسفل."
          : "New CV version uploaded successfully! You can publish it from the list below.",
      });
      setSelectedFile(null);
      setChangelog("");
      refreshVersions();
    } catch (err) {
      setPdfMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to upload file",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishVersion = async (versionId: string) => {
    setIsPublishing(versionId);
    setPdfMessage(null);

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

      setPdfMessage({
        type: "success",
        text: isArabic
          ? "تم نشر هذه النسخة بنجاح وأصبحت معتمدة في صفحة About & Resume!"
          : "CV version published successfully and is now active on About & Resume!",
      });
      refreshVersions();
    } catch (err) {
      setPdfMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to publish version",
      });
    } finally {
      setIsPublishing(null);
    }
  };

  const refreshVersions = async () => {
    try {
      const res = await fetch("/api/admin/cv");
      const data = await res.json();
      if (data.success) {
        if (data.versions) setVersions(data.versions);
        if (data.current) setPublishedCv(data.current);
      }
    } catch {
      // Ignore background refresh errors
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "about"
              ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          <User className="h-4 w-4" />
          <span>{isArabic ? "محتوى قسم نبذة عني (About Me - الصورة 4)" : "About Me Narrative Section"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pdf")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "pdf"
              ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>{isArabic ? "مستند الـ PDF والنسخ (الصورة 1 و 2)" : "CV PDF Document & Versions"}</span>
          <Badge variant="outline" size="sm">
            v{publishedCv.versionNumber}
          </Badge>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ABOUT ME SECTION MANAGEMENT (IMAGE 4) */}
      {/* ========================================================= */}
      {activeTab === "about" && (
        <div className="space-y-6">
          {/* Header Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {isArabic
                  ? "تعديل قسم نبذة عني في صفحة About & Resume"
                  : "Edit About Me Section (About & Resume Page)"}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isArabic
                  ? "هذا السكشن بديل للصناديق القديمة، يمكنك تعديل الاسم، العنوان، وإضافة أو حذف أي فقرة باللغتين."
                  : "Replaces old competency boxes. Edit name, headline, and paragraphs in English and Arabic."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5 dark:border-neutral-700 dark:bg-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedLang("en")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedLang === "en"
                      ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang("ar")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedLang === "ar"
                      ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  العربية
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAboutDefaults}
                disabled={isSavingAbout}
                className="gap-1.5 text-xs text-neutral-600 dark:text-neutral-400"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{isArabic ? "استعادة الافتراضي" : "Reset Defaults"}</span>
              </Button>
            </div>
          </div>

          {/* Feedback Message */}
          {aboutMessage && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
                aboutMessage.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300"
              }`}
            >
              {aboutMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{aboutMessage.text}</span>
            </div>
          )}

          {/* Edit Form & Live Preview Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Form Column */}
            <form onSubmit={handleSaveAbout} className="space-y-4 lg:col-span-7">
              <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {selectedLang === "ar" ? "محتوى اللغة العربية" : "English Content Form"}
                  </span>
                  <Badge variant="secondary" size="sm">
                    {selectedLang.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {/* Badge Text */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? "نص الشارة العلوية (Badge)" : "Top Badge Text"}
                    </label>
                    <input
                      type="text"
                      required
                      value={currentAbout.badge}
                      onChange={(e) => handleFieldChange("badge", e.target.value)}
                      placeholder={selectedLang === "ar" ? "مثال: نبذة عني" : "e.g. About Me"}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? "الاسم الكامل (Heading)" : "Full Name Heading"}
                    </label>
                    <input
                      type="text"
                      required
                      value={currentAbout.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      placeholder={selectedLang === "ar" ? "مثال: أنس الدحامشة" : "e.g. Anas Al Dahamsheh"}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-bold dark:border-neutral-700 dark:bg-neutral-800"
                    />
                  </div>

                  {/* Headline / Subtitle */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? "العنوان التعريفي (Headline / Subtitle)" : "Headline Subtitle"}
                    </label>
                    <input
                      type="text"
                      required
                      value={currentAbout.headline}
                      onChange={(e) => handleFieldChange("headline", e.target.value)}
                      placeholder={
                        selectedLang === "ar"
                          ? "مثال: مهندس ذكاء اصطناعي وبرمجيات..."
                          : "e.g. AI & Software Engineer focused on..."
                      }
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                    />
                  </div>

                  {/* Paragraphs List */}
                  <div className="pt-2">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {isArabic ? "الفقرات النصية (Paragraphs)" : "Paragraphs"} ({currentAbout.paragraphs.length})
                      </label>
                      <button
                        type="button"
                        onClick={handleAddParagraph}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{isArabic ? "إضافة فقرة جديدة" : "Add Paragraph"}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {currentAbout.paragraphs.map((para, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-800/40"
                        >
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-neutral-500">
                              {isArabic ? `الفقرة ${idx + 1}` : `Paragraph ${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveParagraph(idx, "up")}
                                disabled={idx === 0}
                                title={isArabic ? "تحريك لأعلى" : "Move Up"}
                                className="rounded p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200"
                              >
                                <MoveUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveParagraph(idx, "down")}
                                disabled={idx === currentAbout.paragraphs.length - 1}
                                title={isArabic ? "تحريك لأسفل" : "Move Down"}
                                className="rounded p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200"
                              >
                                <MoveDown className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteParagraph(idx)}
                                title={isArabic ? "حذف الفقرة" : "Delete"}
                                className="rounded p-1 text-neutral-400 hover:text-rose-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <textarea
                            rows={3}
                            value={para}
                            onChange={(e) => handleParagraphChange(idx, e.target.value)}
                            placeholder={isArabic ? "اكتب محتوى الفقرة هنا..." : "Enter paragraph text here..."}
                            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs leading-relaxed dark:border-neutral-700 dark:bg-neutral-900"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSavingAbout}
                      className="w-full gap-2 text-xs"
                    >
                      {isSavingAbout ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{isArabic ? "جاري الحفظ..." : "Saving Changes..."}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{isArabic ? "حفظ وتثبيت التعديلات" : "Save All Changes"}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Live Preview Column */}
            <div className="space-y-3 lg:col-span-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? "معاينة حية للمظهر العام (الصورة 4)" : "Live Preview (Exact Visitor View)"}
                </span>
                <Link
                  href={`/${locale}/cv`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  <span>{isArabic ? "فتح الصفحة العامة" : "Open Public Page"}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* Exact Card Preview matching Image 4 */}
              <div
                dir={selectedLang === "ar" ? "rtl" : "ltr"}
                className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-7 dark:border-neutral-800/80 dark:bg-neutral-900"
              >
                <div className="space-y-3 text-start">
                  <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
                    <User className="h-3.5 w-3.5" />
                    <span>{currentAbout.badge || (selectedLang === "ar" ? "نبذة عني" : "About Me")}</span>
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
                    {currentAbout.name || "—"}
                  </h3>
                  <p className="text-sm font-semibold text-neutral-700 sm:text-base dark:text-neutral-300">
                    {currentAbout.headline || "—"}
                  </p>
                </div>

                <div className="space-y-3.5 text-xs leading-relaxed text-neutral-600 sm:text-sm sm:leading-7 dark:text-neutral-400 text-start">
                  {currentAbout.paragraphs.map((p, idx) => (
                    <p key={idx}>{p || (selectedLang === "ar" ? "(فقرة فارغة)" : "(Empty paragraph)")}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PDF UPLOAD & VERSIONS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === "pdf" && (
        <div className="space-y-6">
          {/* Active Version Highlight */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm">
                    {isArabic ? "النسخة المعتمدة حالياً للزوار" : "Active Published Resume"}
                  </Badge>
                  <span className="text-xs font-bold text-neutral-500">v{publishedCv.versionNumber}</span>
                </div>
                <h3 className="mt-1 text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {publishedCv.fileName}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isArabic ? "الحجم:" : "Size:"} {formatFileSize(publishedCv.fileSize)} •{" "}
                  {isArabic ? "تاريخ النشر:" : "Published:"}{" "}
                  {publishedCv.publishedAt
                    ? new Date(publishedCv.publishedAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")
                    : "—"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/api/cv/download?download=1">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    <span>{isArabic ? "تحميل الملف" : "Download PDF"}</span>
                  </Button>
                </Link>
                <Link href="/api/cv/download" target="_blank">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>{isArabic ? "فتح بنافذة" : "Open in New Tab"}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Upload New Version Form */}
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 p-5 dark:border-neutral-700 dark:bg-neutral-900/40">
            <div className="flex items-center gap-2 pb-3">
              <Upload className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {isArabic ? "رفع نسخة سيرة ذاتية جديدة (PDF)" : "Upload New CV Version (PDF)"}
              </h3>
            </div>

            <form onSubmit={handleUploadPdf} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "ملف الـ PDF" : "PDF File"}
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs file:me-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-neutral-800 dark:file:bg-neutral-100 dark:file:text-neutral-900"
                    required
                  />
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {isArabic ? "يقبل فقط ملفات PDF بحد أقصى 10 ميجابايت" : "Accepts PDF files up to 10MB"}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "سجل التعديلات / ملاحظات النسخة" : "Changelog / Release Notes"}
                  </label>
                  <input
                    type="text"
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    placeholder={
                      isArabic
                        ? "مثال: تحديث مشاريع 2026 وإضافة مسارات RAG"
                        : "e.g., Added latest 2026 RAG projects"
                    }
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              {pdfMessage && (
                <div
                  className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
                    pdfMessage.type === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300"
                  }`}
                >
                  {pdfMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{pdfMessage.text}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!selectedFile || isUploading}
                className="gap-2 text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{isArabic ? "جاري الرفع..." : "Uploading..."}</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isArabic ? "رفع النسخة الجديدة" : "Upload Version"}</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Versions History List */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {isArabic ? "سجل النسخ السابقة والمحفوظة" : "Version History"}
            </h3>

            {versions.length === 0 ? (
              <p className="text-xs text-neutral-500">
                {isArabic ? "لا توجد نسخ مسجلة حالياً." : "No versions recorded yet."}
              </p>
            ) : (
              <div className="divide-y divide-neutral-100 text-xs dark:divide-neutral-800">
                {versions.map((ver) => {
                  const isCurrent = ver.versionNumber === publishedCv.versionNumber;
                  return (
                    <div
                      key={ver.id}
                      className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">
                            v{ver.versionNumber} — {ver.fileName}
                          </span>
                          {isCurrent ? (
                            <Badge variant="default" size="sm" className="text-[10px]">
                              {isArabic ? "منشورة حالياً" : "Active"}
                            </Badge>
                          ) : (
                            <Badge variant="outline" size="sm" className="text-[10px]">
                              {isArabic ? "أرشيف" : "Archived"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {formatFileSize(ver.fileSize)} •{" "}
                          {new Date(ver.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}{" "}
                          {ver.changelog ? `• "${ver.changelog}"` : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPublishing === ver.id}
                            onClick={() => handlePublishVersion(ver.id)}
                            className="gap-1.5 text-xs text-neutral-800 dark:text-neutral-200"
                          >
                            {isPublishing === ver.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            )}
                            <span>{isArabic ? "نشر هذه النسخة" : "Publish This Version"}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live Document Preview with Multi-Page Navigation */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {isArabic ? "معاينة حية للمستند بدون أشرطة المتصفح" : "Live Canvas Document Preview"}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isArabic
                    ? "هكذا تظهر السيرة الذاتية للزائر: بدون شريط المتصفح المزعج وبكامل ملء الصفحة مع أزرار التنقل بين الصفحات."
                    : "Exact visitor rendering: eliminates browser PDF bar and empty margins, with clean page flipping."}
                </p>
              </div>
            </div>

            <CvDocumentViewer
              fileUrl="/api/cv/download"
              fileName={publishedCv.fileName}
              locale={locale}
            />
          </div>
        </div>
      )}
    </div>
  );
}
