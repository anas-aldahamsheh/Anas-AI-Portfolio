"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Code2,
  Briefcase,
  GraduationCap,
  Cpu,
  ShieldCheck,
  Layers,
  Globe,
  Terminal,
  Database,
  Rocket,
  ExternalLink,
  Download,
  X,
  Layers as LayersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type CvBoxItem,
  type CvBoxType,
  type PublishedCv,
  type CvVersion,
  DEFAULT_CV_BOXES,
  formatFileSize,
} from "@/modules/cv/domain/cv";
import { CvDocumentViewer } from "@/modules/cv/presentation";

const ICON_OPTIONS = [
  { value: "sparkles", label: "Sparkles (ذكاء اصطناعي)", icon: Sparkles },
  { value: "code", label: "Code (كود / برمجة)", icon: Code2 },
  { value: "briefcase", label: "Briefcase (حقيبة أعمال / مسار مهني)", icon: Briefcase },
  { value: "graduation", label: "Graduation (تعليم / شهادة)", icon: GraduationCap },
  { value: "cpu", label: "CPU (معالجة / خوارزميات)", icon: Cpu },
  { value: "shield", label: "Shield (أمان / موثوقية)", icon: ShieldCheck },
  { value: "layers", label: "Layers (طبقات / بنية تحتية)", icon: Layers },
  { value: "globe", label: "Globe (شبكة / ويب)", icon: Globe },
  { value: "terminal", label: "Terminal (طرفية / نظام)", icon: Terminal },
  { value: "database", label: "Database (قواعد بيانات / RAG)", icon: Database },
  { value: "rocket", label: "Rocket (إطلاق / مشاريع)", icon: Rocket },
];

function getIconComponent(iconName?: string) {
  const found = ICON_OPTIONS.find((opt) => opt.value === iconName);
  return found ? found.icon : Sparkles;
}

export interface CvAdminManagerProps {
  initialPublishedCv: PublishedCv;
  initialVersions: CvVersion[];
  initialBoxes: CvBoxItem[];
  locale: string;
}

export function CvAdminManager({
  initialPublishedCv,
  initialVersions,
  initialBoxes,
  locale,
}: CvAdminManagerProps) {
  const isArabic = locale === "ar";

  const [activeTab, setActiveTab] = useState<"boxes" | "pdf">("boxes");

  // CV Boxes State
  const [boxes, setBoxes] = useState<CvBoxItem[]>(
    initialBoxes && initialBoxes.length > 0 ? initialBoxes : DEFAULT_CV_BOXES,
  );
  const [isSavingBoxes, setIsSavingBoxes] = useState(false);
  const [boxesMessage, setBoxesMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit/Add Box Modal State
  const [editingBox, setEditingBox] = useState<CvBoxItem | null>(null);
  const [isNewBox, setIsNewBox] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // PDF Versions State
  const [publishedCv, setPublishedCv] = useState<PublishedCv>(initialPublishedCv);
  const [versions, setVersions] = useState<CvVersion[]>(initialVersions);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changelog, setChangelog] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [pdfMessage, setPdfMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ==========================================
  // BOXES CRUD OPERATIONS
  // ==========================================

  const handleOpenAddBox = () => {
    const newBox: CvBoxItem = {
      id: `box-${Date.now()}`,
      type: "custom",
      title: isArabic ? "قسم جديد" : "New Section",
      subtitle: "",
      description: "",
      icon: "sparkles",
      items: [""],
      linkUrl: "",
      linkLabel: "",
      email: "",
      phone: "",
      showAiChat: false,
      colSpan: 1,
      orderIndex: boxes.length + 1,
    };
    setEditingBox(newBox);
    setIsNewBox(true);
    setModalOpen(true);
  };

  const handleOpenEditBox = (box: CvBoxItem) => {
    setEditingBox({ ...box, items: box.items ? [...box.items] : [] });
    setIsNewBox(false);
    setModalOpen(true);
  };

  const handleDeleteBox = (id: string) => {
    const boxToDelete = boxes.find((b) => b.id === id);
    const confirmMsg = isArabic
      ? `هل أنت متأكد من حذف البوكس "${boxToDelete?.title}" بالكامل؟`
      : `Are you sure you want to permanently delete box "${boxToDelete?.title}"?`;

    if (!window.confirm(confirmMsg)) return;

    const next = boxes.filter((b) => b.id !== id);
    // Re-index order
    const reindexed = next.map((b, idx) => ({ ...b, orderIndex: idx + 1 }));
    setBoxes(reindexed);
    saveBoxesDirectly(reindexed, isArabic ? "تم حذف البوكس بنجاح!" : "Box deleted successfully!");
  };

  const handleMoveBox = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= boxes.length) return;

    const newBoxes = [...boxes];
    const moved = newBoxes[index];
    if (!moved) return;
    newBoxes.splice(index, 1);
    newBoxes.splice(targetIndex, 0, moved);

    const reordered = newBoxes.map((b, idx) => ({ ...b, orderIndex: idx + 1 }));
    setBoxes(reordered);
    saveBoxesDirectly(reordered, isArabic ? "تم تحديث ترتيب الصناديق!" : "Boxes order updated!");
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBox || !editingBox.title.trim()) return;

    // Filter out empty items
    const cleanItems = (editingBox.items || []).map((i) => i.trim()).filter(Boolean);
    const updatedBox: CvBoxItem = {
      ...editingBox,
      title: editingBox.title.trim(),
      subtitle: editingBox.subtitle?.trim() || undefined,
      description: editingBox.description?.trim() || undefined,
      linkUrl: editingBox.linkUrl?.trim() || undefined,
      linkLabel: editingBox.linkLabel?.trim() || undefined,
      email: editingBox.email?.trim() || undefined,
      phone: editingBox.phone?.trim() || undefined,
      items: cleanItems.length > 0 ? cleanItems : undefined,
    };

    let nextBoxes: CvBoxItem[];
    if (isNewBox) {
      nextBoxes = [...boxes, updatedBox];
    } else {
      nextBoxes = boxes.map((b) => (b.id === updatedBox.id ? updatedBox : b));
    }

    const reindexed = nextBoxes.map((b, idx) => ({ ...b, orderIndex: idx + 1 }));
    setBoxes(reindexed);
    setModalOpen(false);
    setEditingBox(null);
    saveBoxesDirectly(
      reindexed,
      isArabic
        ? isNewBox
          ? "تمت إضافة البوكس وحفظه بنجاح!"
          : "تم تعديل البوكس وحفظه بنجاح!"
        : isNewBox
        ? "Box added and saved successfully!"
        : "Box updated and saved successfully!",
    );
  };

  const saveBoxesDirectly = async (boxesToSave: CvBoxItem[], successText?: string) => {
    setIsSavingBoxes(true);
    setBoxesMessage(null);
    try {
      const res = await fetch("/api/admin/cv/boxes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boxes: boxesToSave }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save boxes");
      }

      setBoxes(data.boxes);
      setBoxesMessage({
        type: "success",
        text: successText || (isArabic ? "تم حفظ جميع التعديلات بنجاح!" : "All changes saved successfully!"),
      });
    } catch (err) {
      setBoxesMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save boxes",
      });
    } finally {
      setIsSavingBoxes(false);
    }
  };

  const handleResetDefaults = () => {
    const confirmMsg = isArabic
      ? "هل تريد بالتأكيد استعادة الصناديق الافتراضية الأصلية (الخاصة بالصورة 3)؟"
      : "Are you sure you want to restore the original default boxes from Image 3?";
    if (!window.confirm(confirmMsg)) return;

    setBoxes(DEFAULT_CV_BOXES);
    saveBoxesDirectly(
      DEFAULT_CV_BOXES,
      isArabic ? "تمت استعادة الصناديق الافتراضية بنجاح!" : "Default boxes restored successfully!",
    );
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

      // Refresh versions
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
          ? "تم نشر هذه النسخة من السيرة الذاتية بنجاح وأصبحت معتمدة للزوار!"
          : "CV version published successfully and is now active for visitors!",
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
          onClick={() => setActiveTab("boxes")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === "boxes"
              ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          <LayersIcon className="h-4 w-4" />
          <span>{isArabic ? "صناديق ومحتوى السيرة الذاتية (الصورة 3)" : "CV Boxes & Profile Cards"}</span>
          <Badge variant="secondary" size="sm">
            {boxes.length}
          </Badge>
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
      {/* TAB 1: CV BOXES MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === "boxes" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {isArabic ? "التحكم الكامل بصناديق السيرة الذاتية" : "CV Profile & Competency Boxes"}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isArabic
                  ? "يمكنك حذف أي بوكس، تعديل محتواه، إضافة بوكس جديد، أو إعادة ترتيبها بسهولة."
                  : "Delete, edit, add, or reorder any section box displayed on the CV page."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                disabled={isSavingBoxes}
                className="gap-1.5 text-xs text-neutral-600 dark:text-neutral-400"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{isArabic ? "استعادة الافتراضي" : "Reset Defaults"}</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAddBox}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isArabic ? "إضافة بوكس جديد" : "Add New Box"}</span>
              </Button>
            </div>
          </div>

          {/* Feedback Message */}
          {boxesMessage && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
                boxesMessage.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/40 dark:text-rose-300"
              }`}
            >
              {boxesMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{boxesMessage.text}</span>
            </div>
          )}

          {/* List of Boxes */}
          <div className="space-y-3">
            {boxes.map((box, index) => {
              const IconComp = getIconComponent(box.icon);
              return (
                <div
                  key={box.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs transition-all hover:border-neutral-300 sm:flex-row sm:items-center dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3.5">
                    {/* Order buttons */}
                    <div className="flex flex-col gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveBox(index, "up")}
                        disabled={index === 0}
                        title={isArabic ? "تحريك لأعلى" : "Move Up"}
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-800"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveBox(index, "down")}
                        disabled={index === boxes.length - 1}
                        title={isArabic ? "تحريك لأسفل" : "Move Down"}
                        className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30 dark:hover:bg-neutral-800"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                      <IconComp className="h-5 w-5" />
                    </div>

                    {/* Content details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {box.title}
                        </span>
                        <Badge variant="outline" size="sm" className="text-[10px]">
                          {box.type === "profile"
                            ? isArabic ? "ملف تنفيذي" : "Executive Profile"
                            : box.type === "skills_grid"
                            ? isArabic ? "قائمة مهارات" : "Skills Grid"
                            : box.type === "info_card"
                            ? isArabic ? "بطاقة معلومات" : "Info Card"
                            : isArabic ? "مخصص" : "Custom"}
                        </Badge>
                        <Badge variant="secondary" size="sm" className="text-[10px]">
                          {box.colSpan === 3
                            ? isArabic ? "عرض كامل" : "Full Width"
                            : box.colSpan === 2
                            ? isArabic ? "عمودين" : "2 Columns"
                            : isArabic ? "عمود واحد" : "1 Column"}
                        </Badge>
                      </div>

                      {box.subtitle && (
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {box.subtitle}
                        </p>
                      )}

                      {box.description && (
                        <p className="line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                          {box.description}
                        </p>
                      )}

                      {box.items && box.items.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {box.items.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      {(box.email || box.phone || box.linkUrl) && (
                        <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-neutral-400">
                          {box.email && <span>📧 {box.email}</span>}
                          {box.phone && <span>📞 {box.phone}</span>}
                          {box.linkUrl && <span>🔗 {box.linkLabel || box.linkUrl}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditBox(box)}
                      className="gap-1 text-xs"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{isArabic ? "تعديل" : "Edit"}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBox(box.id)}
                      className="gap-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{isArabic ? "حذف بالكامل" : "Delete"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick link to view live page */}
          <div className="pt-2 text-end">
            <Link
              href={`/${locale}/cv`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 underline hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              <span>{isArabic ? "معاينة صفحة السيرة الذاتية الآن" : "Preview Live CV Page"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
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

      {/* ========================================================= */}
      {/* ADD / EDIT BOX MODAL */}
      {/* ========================================================= */}
      {modalOpen && editingBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {isNewBox
                  ? isArabic ? "إضافة بوكس جديد" : "Add New CV Box"
                  : isArabic ? "تعديل محتوى البوكس" : "Edit CV Box Content"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              {/* Type and ColSpan */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "نوع البوكس" : "Box Type"}
                  </label>
                  <select
                    value={editingBox.type}
                    onChange={(e) =>
                      setEditingBox({ ...editingBox, type: e.target.value as CvBoxType })
                    }
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <option value="profile">{isArabic ? "ملف تنفيذي (Profile)" : "Executive Profile"}</option>
                    <option value="skills_grid">{isArabic ? "قائمة مهارات (Skills)" : "Skills Grid"}</option>
                    <option value="info_card">{isArabic ? "بطاقة معلومات (Info Card)" : "Info Card"}</option>
                    <option value="custom">{isArabic ? "مخصص (Custom)" : "Custom"}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "الأيقونة" : "Icon"}
                  </label>
                  <select
                    value={editingBox.icon || "sparkles"}
                    onChange={(e) => setEditingBox({ ...editingBox, icon: e.target.value })}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "عرض البوكس" : "Column Span"}
                  </label>
                  <select
                    value={editingBox.colSpan || 1}
                    onChange={(e) =>
                      setEditingBox({
                        ...editingBox,
                        colSpan: Number(e.target.value) as 1 | 2 | 3,
                      })
                    }
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <option value={1}>{isArabic ? "عمود واحد (1/3)" : "1 Column"}</option>
                    <option value={2}>{isArabic ? "عمودين (2/3)" : "2 Columns"}</option>
                    <option value={3}>{isArabic ? "عرض كامل (3/3)" : "Full Width"}</option>
                  </select>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "العنوان الرئيسي *" : "Title *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBox.title}
                    onChange={(e) => setEditingBox({ ...editingBox, title: e.target.value })}
                    placeholder={isArabic ? "مثال: الذكاء الاصطناعي و RAG" : "e.g. AI & RAG Engineering"}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "العنوان الفرعي (اختياري)" : "Subtitle (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={editingBox.subtitle || ""}
                    onChange={(e) => setEditingBox({ ...editingBox, subtitle: e.target.value })}
                    placeholder={isArabic ? "مثال: بكالوريوس هندسة الحاسوب" : "e.g. B.S. in Computer Engineering"}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? "الوصف / المحتوى النصي" : "Description / Text Content"}
                </label>
                <textarea
                  rows={3}
                  value={editingBox.description || ""}
                  onChange={(e) => setEditingBox({ ...editingBox, description: e.target.value })}
                  placeholder={
                    isArabic
                      ? "اكتب تفاصيل أو نبذة عن هذا البوكس..."
                      : "Describe this competency or profile area..."
                  }
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              {/* Items / Bullet Points (Skills) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "عناصر ونقاط المهارات (Bullet Points)" : "Bullet Points / Skills"}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBox({
                        ...editingBox,
                        items: [...(editingBox.items || []), ""],
                      })
                    }
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{isArabic ? "إضافة نقطة" : "Add Bullet"}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(editingBox.items && editingBox.items.length > 0
                    ? editingBox.items
                    : [""]
                  ).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">{idx + 1}.</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const nextItems = [...(editingBox.items || [""])];
                          nextItems[idx] = e.target.value;
                          setEditingBox({ ...editingBox, items: nextItems });
                        }}
                        placeholder={
                          isArabic ? "مثال: Hybrid Search (Dense + BM25)" : "e.g. Hybrid Search (Dense + BM25)"
                        }
                        className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextItems = (editingBox.items || [""]).filter((_, i) => i !== idx);
                          setEditingBox({ ...editingBox, items: nextItems });
                        }}
                        className="rounded p-1 text-neutral-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Link URL and Link Label */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "رابط التوجيه (اختياري)" : "Link URL (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={editingBox.linkUrl || ""}
                    onChange={(e) => setEditingBox({ ...editingBox, linkUrl: e.target.value })}
                    placeholder="/experience أو https://..."
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "نص الرابط (اختياري)" : "Link Label (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={editingBox.linkLabel || ""}
                    onChange={(e) => setEditingBox({ ...editingBox, linkLabel: e.target.value })}
                    placeholder={isArabic ? "مثال: التفاصيل كاملة ←" : "e.g. Full Timeline →"}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              {/* Contact Fields (For Profile Box or Custom) */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 sm:grid-cols-3 dark:border-neutral-800 dark:bg-neutral-800/40">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <input
                    type="email"
                    value={editingBox.email || ""}
                    onChange={(e) => setEditingBox({ ...editingBox, email: e.target.value })}
                    placeholder="example@mail.com"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "رقم الهاتف" : "Phone"}
                  </label>
                  <input
                    type="text"
                    value={editingBox.phone || ""}
                    onChange={(e) => setEditingBox({ ...editingBox, phone: e.target.value })}
                    placeholder="+962 789 495 167"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="showAiChat"
                    checked={Boolean(editingBox.showAiChat)}
                    onChange={(e) =>
                      setEditingBox({ ...editingBox, showAiChat: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="showAiChat"
                    className="cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    {isArabic ? "زر التحدث مع المساعد الذكي" : "Show AI Assistant link"}
                  </label>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {isArabic ? "حفظ التغييرات" : "Save Box"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
