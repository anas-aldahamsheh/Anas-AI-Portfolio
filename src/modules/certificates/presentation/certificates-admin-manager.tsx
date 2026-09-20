"use client";

import { useState } from "react";
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  MoveUp,
  MoveDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CertificateItem } from "../domain/types";
import { CertificateDetailModal } from "./certificate-detail-modal";

export interface CertificatesAdminManagerProps {
  initialCertificates: CertificateItem[];
  locale: string;
}

export function CertificatesAdminManager({
  initialCertificates,
  locale,
}: CertificatesAdminManagerProps) {
  const isArabic = locale === "ar";
  const [certificates, setCertificates] = useState<CertificateItem[]>(initialCertificates);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Editing state
  const [editingCert, setEditingCert] = useState<CertificateItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);

  // Form fields state
  const [formData, setFormData] = useState<{
    id: string;
    titleEn: string;
    titleAr: string;
    issuerEn: string;
    issuerAr: string;
    issueDate: string;
    descriptionEn: string;
    descriptionAr: string;
    imageUrl: string;
    credentialUrl: string;
    credentialId: string;
    skillsString: string;
    isFeatured: boolean;
  }>({
    id: "",
    titleEn: "",
    titleAr: "",
    issuerEn: "",
    issuerAr: "",
    issueDate: "",
    descriptionEn: "",
    descriptionAr: "",
    imageUrl: "",
    credentialUrl: "",
    credentialId: "",
    skillsString: "",
    isFeatured: false,
  });

  const openAddForm = () => {
    setEditingCert(null);
    setFormData({
      id: `cert-${Date.now()}`,
      titleEn: "",
      titleAr: "",
      issuerEn: "",
      issuerAr: "",
      issueDate: new Date().getFullYear().toString(),
      descriptionEn: "",
      descriptionAr: "",
      imageUrl: "/images/certificates/cert-rag-systems.svg",
      credentialUrl: "",
      credentialId: "",
      skillsString: "",
      isFeatured: false,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (cert: CertificateItem) => {
    setEditingCert(cert);
    setFormData({
      id: cert.id,
      titleEn: cert.title.en,
      titleAr: cert.title.ar,
      issuerEn: cert.issuer.en,
      issuerAr: cert.issuer.ar,
      issueDate: cert.issueDate,
      descriptionEn: cert.description.en,
      descriptionAr: cert.description.ar,
      imageUrl: cert.imageUrl,
      credentialUrl: cert.credentialUrl || "",
      credentialId: cert.credentialId || "",
      skillsString: (cert.skills || []).join(", "),
      isFeatured: Boolean(cert.isFeatured),
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = async () => {
    if (!formData.titleEn.trim() || !formData.titleAr.trim()) {
      setFeedback({
        type: "error",
        text: isArabic ? "يرجى كتابة اسم الدورة باللغتين" : "Please fill in course titles in both languages",
      });
      return;
    }

    const parsedSkills = formData.skillsString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedItem: CertificateItem = {
      id: formData.id || `cert-${Date.now()}`,
      title: {
        en: formData.titleEn.trim(),
        ar: formData.titleAr.trim(),
      },
      issuer: {
        en: formData.issuerEn.trim() || "DeepLearning.AI",
        ar: formData.issuerAr.trim() || "ديب ليرنينغ دوت إيه آي",
      },
      issueDate: formData.issueDate.trim() || "2024",
      description: {
        en: formData.descriptionEn.trim(),
        ar: formData.descriptionAr.trim(),
      },
      imageUrl: formData.imageUrl.trim() || "/images/certificates/cert-rag-systems.svg",
      credentialUrl: formData.credentialUrl.trim() || undefined,
      credentialId: formData.credentialId.trim() || undefined,
      skills: parsedSkills,
      isFeatured: formData.isFeatured,
      orderIndex: editingCert ? editingCert.orderIndex : (certificates.length + 1) * 10,
    };

    let updatedList: CertificateItem[];
    if (editingCert) {
      updatedList = certificates.map((c) => (c.id === editingCert.id ? updatedItem : c));
    } else {
      updatedList = [...certificates, updatedItem];
    }

    setCertificates(updatedList);
    setIsFormOpen(false);

    // Persist immediately to API
    await persistCertificates(updatedList);
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = isArabic
      ? "هل أنت متأكد من رغبتك في حذف هذه الشهادة نهائياً؟"
      : "Are you sure you want to delete this certificate?";
    if (!window.confirm(confirmMessage)) return;

    const filtered = certificates.filter((c) => c.id !== id);
    setCertificates(filtered);
    await persistCertificates(filtered);
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= certificates.length) return;

    const list = [...certificates];
    const temp = list[index]!;
    list[index] = list[targetIndex]!;
    list[targetIndex] = temp;

    // Re-index
    const reindexed = list.map((item, idx) => ({
      ...item,
      orderIndex: (idx + 1) * 10,
    }));

    setCertificates(reindexed);
    await persistCertificates(reindexed);
  };

  const persistCertificates = async (list: CertificateItem[]) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/certificates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.certificates) {
        setCertificates(data.certificates);
      }
      setFeedback({
        type: "success",
        text: isArabic
          ? "تم حفظ وتحديث بيانات الشهادات بنجاح!"
          : "Certificates catalog updated and persisted successfully!",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to persist certificates",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {isArabic ? "إدارة الدورات والشهادات" : "Manage Certificates & Courses"}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            {isArabic
              ? "تحكم مباشر وبسيط في إضافة، تعديل، حذف، وترتيب الشهادات والدورات التدريبية المعتمدة."
              : "Direct, authoritative control to add, edit, reorder, and manage verified certificates and courses."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={openAddForm} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>{isArabic ? "إضافة شهادة جديدة" : "Add New Certificate"}</span>
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-xs sm:text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span className="flex-1 font-medium">{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline opacity-75 hover:opacity-100"
          >
            {isArabic ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Saving Indicator */}
      {isSaving && (
        <div className="flex items-center gap-2 text-xs font-semibold text-primary animate-pulse">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>{isArabic ? "جاري مزامنة التغييرات وحفظها..." : "Synchronizing changes with database..."}</span>
        </div>
      )}

      {/* Certificates List & Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {isArabic ? `الشهادات الحالية (${certificates.length})` : `Existing Certificates (${certificates.length})`}
          </h2>
          <span className="text-xs text-neutral-500">
            {isArabic ? "يمكنك استخدام الأسهم للترتيب الفوري" : "Use arrows to reorder directly"}
          </span>
        </div>

        {certificates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800">
            <p className="text-sm text-neutral-500">
              {isArabic ? "لا توجد شهادات مسجلة حالياً." : "No certificates configured yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert, index) => (
              <div
                key={cert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-neutral-200/80 bg-white p-4 shadow-xs transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
              >
                {/* Image Thumbnail and Details */}
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cert.imageUrl}
                      alt={cert.title.en}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/certificates/cert-rag-systems.svg";
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {isArabic ? cert.title.ar : cert.title.en}
                      </h3>
                      {cert.isFeatured && (
                        <Badge variant="default" size="sm" className="text-[10px]">
                          {isArabic ? "مميزة" : "Featured"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {isArabic ? cert.issuer.ar : cert.issuer.en}
                      </span>
                      <span>•</span>
                      <span>{cert.issueDate}</span>
                      {cert.credentialId && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{cert.credentialId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Reorder, Preview, Edit, Delete */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || isSaving}
                    className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                    title={isArabic ? "تحريك لأعلى" : "Move up"}
                  >
                    <MoveUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === certificates.length - 1 || isSaving}
                    className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                    title={isArabic ? "تحريك لأسفل" : "Move down"}
                  >
                    <MoveDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewCert(cert)}
                    className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    title={isArabic ? "معاينة كما تظهر للزائر" : "Preview modal"}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditForm(cert)}
                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                    title={isArabic ? "تعديل الشهادة" : "Edit certificate"}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cert.id)}
                    disabled={isSaving}
                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30 dark:text-red-400 dark:hover:bg-red-950/50"
                    title={isArabic ? "حذف الشهادة" : "Delete certificate"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {editingCert
                  ? isArabic
                    ? "تعديل بيانات الدورة والشهادة"
                    : "Edit Certificate & Course"
                  : isArabic
                    ? "إضافة دورة وشهادة جديدة"
                    : "Add New Certificate & Course"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
              {/* Titles in EN and AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "اسم الدورة (بالإنجليزية) *" : "Course Title (English) *"}
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="e.g. Building Multimodal Search & Hybrid RAG"
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "اسم الدورة (بالعربية) *" : "Course Title (Arabic) *"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="مثال: بناء أنظمة البحث متعدد الوسائط والاسترجاع الهجين"
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                  />
                </div>
              </div>

              {/* Issuer in EN and AR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "الجهة المصدرة (بالإنجليزية)" : "Issuer / Organization (English)"}
                  </label>
                  <input
                    type="text"
                    value={formData.issuerEn}
                    onChange={(e) => setFormData({ ...formData, issuerEn: e.target.value })}
                    placeholder="e.g. DeepLearning.AI"
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "الجهة المصدرة (بالعربية)" : "Issuer / Organization (Arabic)"}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.issuerAr}
                    onChange={(e) => setFormData({ ...formData, issuerAr: e.target.value })}
                    placeholder="مثال: ديب ليرنينغ دوت إيه آي"
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                  />
                </div>
              </div>

              {/* Date & Credential ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "تاريخ الإصدار أو الإكمال *" : "Issue Date / Year *"}
                  </label>
                  <input
                    type="text"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    placeholder="e.g. 2024 or Oct 2024"
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? "معرف الاعتماد (اختياري)" : "Credential ID (optional)"}
                  </label>
                  <input
                    type="text"
                    value={formData.credentialId}
                    onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    placeholder="e.g. DLAI-RAG-2024-9981"
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-mono focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                  />
                </div>
              </div>

              {/* Certificate Image URL */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? "رابط أو مسار صورة الشهادة *" : "Certificate Image URL / Path *"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/images/certificates/cert-rag-systems.svg or https://..."
                    className="flex-1 rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  {isArabic
                    ? "يمكنك وضع مسار من مجلد public مثل /images/certificates/... أو رابط صورة خارجي مباشر."
                    : "You can use a public path like /images/certificates/... or any direct image URL."}
                </p>
              </div>

              {/* Credential Verification URL */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? "رابط التحقق الإلكتروني من الاعتماد (اختياري)" : "Credential Verification URL (optional)"}
                </label>
                <input
                  type="url"
                  value={formData.credentialUrl}
                  onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                  placeholder="https://www.coursera.org/verify/..."
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                />
              </div>

              {/* Skills string */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? "المهارات والتقنيات (مفصولة بفواصل)" : "Skills & Technologies (comma separated)"}
                </label>
                <input
                  type="text"
                  value={formData.skillsString}
                  onChange={(e) => setFormData({ ...formData, skillsString: e.target.value })}
                  placeholder="Hybrid RAG, Vector Databases, Python, BGE-M3"
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                />
              </div>

              {/* Descriptions */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? "الوصف ومحتوى الدورة (بالإنجليزية) *" : "Course Description (English) *"}
                </label>
                <textarea
                  rows={3}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  placeholder="Provide detailed description of what was learned and mastered..."
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 p-3 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {isArabic ? "الوصف ومحتوى الدورة (بالعربية) *" : "Course Description (Arabic) *"}
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder="اكتب وصفاً شاملاً لمحتوى الدورة والمخرجات التعليمية..."
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 p-3 text-sm focus:border-primary focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-850"
                />
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeaturedToggle"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isFeaturedToggle" className="cursor-pointer font-medium text-neutral-800 dark:text-neutral-200">
                  {isArabic ? "تمييز هذه الشهادة في الكتالوج (Featured)" : "Feature this certificate in the catalog"}
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                <span>{isArabic ? "إلغاء" : "Cancel"}</span>
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveForm}>
                <span>{isArabic ? "حفظ وتثبيت الشهادة" : "Save & Persist"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <CertificateDetailModal
        certificate={previewCert}
        locale={locale}
        onClose={() => setPreviewCert(null)}
      />
    </div>
  );
}
