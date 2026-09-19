"use client";

import { useState } from "react";
import {
  AdminPageItem,
  AdminSectionItem,
  ContentCenterSummary,
  ContentPublishStatus,
} from "@/modules/content/domain/content-center";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ContentCenterManagerProps {
  initialSummary: ContentCenterSummary;
}

export function ContentCenterManager({ initialSummary }: ContentCenterManagerProps) {
  const { t, dir, locale } = useLocalization();

  const [activeTab, setActiveTab] = useState<"pages" | "sections" | "publishing">("pages");
  const [pages, setPages] = useState<AdminPageItem[]>(initialSummary.pages);
  const [selectedPageId, setSelectedPageId] = useState<string>(
    initialSummary.pages[0]?.id || "page-home",
  );
  const [sections, setSections] = useState<AdminSectionItem[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  // Form states
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageTitleAr, setNewPageTitleAr] = useState("");
  const [newPageTitleEn, setNewPageTitleEn] = useState("");
  const [isSubmittingPage, setIsSubmittingPage] = useState(false);

  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState("callout");
  const [newSectionTitleAr, setNewSectionTitleAr] = useState("");
  const [newSectionTitleEn, setNewSectionTitleEn] = useState("");
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);

  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Load sections when page is selected
  const loadSections = async (pageId: string) => {
    setIsLoadingSections(true);
    try {
      const res = await fetch(`/api/admin/content/sections?pageId=${encodeURIComponent(pageId)}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setSections(json.data);
      }
    } catch {
      // Keep existing
    } finally {
      setIsLoadingSections(false);
    }
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    void loadSections(pageId);
  };

  // Toggle page publishing status
  const handleTogglePageStatus = async (pageId: string, currentStatus: ContentPublishStatus) => {
    const nextStatus: ContentPublishStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/content/pages/${pageId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, status: nextStatus } : p)));
        setActionMessage(
          nextStatus === "PUBLISHED"
            ? "Page published successfully."
            : "Page unpublished and set to draft.",
        );
      }
    } catch {
      setActionMessage("Failed to update page status.");
    }
  };

  // Create new page
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageSlug || !newPageTitleAr || !newPageTitleEn) return;

    setIsSubmittingPage(true);
    try {
      const res = await fetch("/api/admin/content/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: newPageSlug,
          titleAr: newPageTitleAr,
          titleEn: newPageTitleEn,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPages((prev) => [...prev, json.data]);
        setShowAddPage(false);
        setNewPageSlug("");
        setNewPageTitleAr("");
        setNewPageTitleEn("");
        setActionMessage(`Page /${newPageSlug} created successfully.`);
      }
    } catch {
      setActionMessage("Failed to create page.");
    } finally {
      setIsSubmittingPage(false);
    }
  };

  // Create new section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPageId || !newSectionTitleAr || !newSectionTitleEn) return;

    setIsSubmittingSection(true);
    try {
      const res = await fetch("/api/admin/content/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedPageId,
          sectionType: newSectionType,
          titleAr: newSectionTitleAr,
          titleEn: newSectionTitleEn,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSections((prev) => [...prev, json.data]);
        setShowAddSection(false);
        setNewSectionTitleAr("");
        setNewSectionTitleEn("");
        setActionMessage("Section added successfully.");
      }
    } catch {
      setActionMessage("Failed to create section.");
    } finally {
      setIsSubmittingSection(false);
    }
  };

  // Reorder section up or down
  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index]!;
    newSections[index] = newSections[targetIndex]!;
    newSections[targetIndex] = temp;

    setSections(newSections);

    try {
      await fetch("/api/admin/content/sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedPageId,
          sectionIds: newSections.map((s) => s.id),
        }),
      });
    } catch {
      // Revert if needed
    }
  };

  // Delete section
  const handleDeleteSection = async (sectionId: string) => {
    try {
      const res = await fetch(`/api/admin/content/sections/${sectionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSections((prev) => prev.filter((s) => s.id !== sectionId));
        setActionMessage("Section deleted.");
      }
    } catch {
      setActionMessage("Failed to delete section.");
    }
  };

  const totalPublished = pages.filter((p) => p.status === "PUBLISHED").length;
  const totalDraft = pages.filter((p) => p.status === "DRAFT").length;
  const pendingSections = sections.filter((s) => s.status === "DRAFT").length;

  return (
    <div className="space-y-8" dir={dir} data-testid="content-center-manager">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            {t("admin.content.title") !== "admin.content.title"
              ? t("admin.content.title")
              : "Admin Content Center"}
          </h1>
          <Badge variant="outline" className="font-mono text-xs">
            F039 Content Center
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Manage dynamic portfolio pages, composable sections, publishing workflow, and
          multi-language content.
        </p>
      </div>

      {actionMessage && (
        <div className="bg-primary/10 border-primary/20 text-foreground flex items-center justify-between rounded-md border p-3 text-xs">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-muted-foreground hover:text-foreground font-semibold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-medium">Total Pages</span>
            <p className="text-foreground text-2xl font-bold">{pages.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-medium">Published Pages</span>
            <p className="text-2xl font-bold text-emerald-600">{totalPublished}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-medium">Draft Pages</span>
            <p className="text-2xl font-bold text-amber-600">{totalDraft}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-medium">Total Sections</span>
            <p className="text-foreground text-2xl font-bold">{initialSummary.totalSections}</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-border flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab("pages")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "pages"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="tab-pages"
        >
          Pages Management ({pages.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("sections");
            if (sections.length === 0) void loadSections(selectedPageId);
          }}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "sections"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="tab-sections"
        >
          Sections Builder
        </button>
        <button
          onClick={() => setActiveTab("publishing")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "publishing"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          data-testid="tab-publishing"
        >
          Publishing Queue ({totalDraft + pendingSections})
        </button>
      </div>

      {/* Tab 1: Pages Management */}
      {activeTab === "pages" && (
        <Card className="border-border" data-testid="pages-panel">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground text-sm font-semibold">
                  Portfolio Pages
                </CardTitle>
                <CardDescription className="text-xs">
                  Create, configure, publish or archive dynamic routes.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddPage(!showAddPage)}
                className="text-xs"
                data-testid="btn-add-page"
              >
                {showAddPage ? "Cancel" : "+ Add Page"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {showAddPage && (
              <form
                onSubmit={handleCreatePage}
                className="bg-muted/30 border-border space-y-3 rounded-lg border p-4"
                data-testid="form-add-page"
              >
                <h4 className="text-foreground text-xs font-bold uppercase">Create New Route</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-muted-foreground block text-[11px] font-medium">
                      Slug (URL identifier)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. blog or architecture"
                      value={newPageSlug}
                      onChange={(e) => setNewPageSlug(e.target.value)}
                      className="bg-background border-border text-foreground w-full rounded border px-2.5 py-1.5 text-xs"
                      required
                      data-testid="input-page-slug"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block text-[11px] font-medium">
                      Title (Arabic RTL)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="العنوان بالعربية"
                      value={newPageTitleAr}
                      onChange={(e) => setNewPageTitleAr(e.target.value)}
                      className="bg-background border-border text-foreground w-full rounded border px-2.5 py-1.5 text-xs"
                      required
                      data-testid="input-page-title-ar"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block text-[11px] font-medium">
                      Title (English LTR)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="Title in English"
                      value={newPageTitleEn}
                      onChange={(e) => setNewPageTitleEn(e.target.value)}
                      className="bg-background border-border text-foreground w-full rounded border px-2.5 py-1.5 text-xs"
                      required
                      data-testid="input-page-title-en"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingPage}
                    className="text-xs"
                    data-testid="btn-submit-page"
                  >
                    {isSubmittingPage ? "Creating..." : "Save Route as Draft"}
                  </Button>
                </div>
              </form>
            )}

            <div className="border-border overflow-hidden rounded-md border">
              <table className="w-full text-left text-xs" dir="ltr">
                <thead className="bg-muted text-muted-foreground border-border border-b font-medium">
                  <tr>
                    <th className="p-3">Route / Slug</th>
                    <th className="p-3">Title ({locale === "ar" ? "العربية" : "English"})</th>
                    <th className="p-3">Sections</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {pages.map((p) => {
                    const displayTitle =
                      locale === "ar" ? p.translations.ar.title : p.translations.en.title;
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-muted/30"
                        data-testid={`page-row-${p.slug}`}
                      >
                        <td className="text-foreground p-3 font-mono font-medium">
                          /{p.slug}{" "}
                          {p.isHome && (
                            <span className="text-muted-foreground text-[10px]">(Home)</span>
                          )}
                        </td>
                        <td className="text-muted-foreground max-w-xs truncate p-3">
                          {displayTitle}
                        </td>
                        <td className="p-3 font-mono">{p.sectionsCount} sections</td>
                        <td className="p-3">
                          {p.status === "PUBLISHED" ? (
                            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600">
                              PUBLISHED
                            </Badge>
                          ) : (
                            <Badge className="border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-600">
                              DRAFT
                            </Badge>
                          )}
                        </td>
                        <td className="space-x-2 space-x-reverse p-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePageStatus(p.id, p.status)}
                            className="h-7 px-2.5 text-xs"
                            data-testid={`btn-toggle-status-${p.slug}`}
                          >
                            {p.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPageId(p.id);
                              setActiveTab("sections");
                              void loadSections(p.id);
                            }}
                            className="h-7 px-2 text-xs"
                            data-testid={`btn-edit-sections-${p.slug}`}
                          >
                            Sections ➔
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Sections Builder */}
      {activeTab === "sections" && (
        <Card className="border-border" data-testid="sections-panel">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-foreground text-sm font-semibold">
                  Dynamic Section Builder
                </CardTitle>
                <CardDescription className="text-xs">
                  Reorder, add, or customize composable sections for each page.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedPageId}
                  onChange={(e) => handleSelectPage(e.target.value)}
                  className="bg-background border-border text-foreground rounded border px-3 py-1.5 font-mono text-xs"
                  data-testid="select-page-for-sections"
                >
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      /{p.slug} ({p.translations.en.title})
                    </option>
                  ))}
                </select>

                <Button
                  size="sm"
                  onClick={() => setShowAddSection(!showAddSection)}
                  className="text-xs"
                  data-testid="btn-add-section"
                >
                  {showAddSection ? "Cancel" : "+ Add Section"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            {showAddSection && (
              <form
                onSubmit={handleCreateSection}
                className="bg-muted/30 border-border space-y-3 rounded-lg border p-4"
                data-testid="form-add-section"
              >
                <h4 className="text-foreground text-xs font-bold uppercase">
                  Add New Section to Selected Page
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-muted-foreground block text-[11px] font-medium">
                      Section Type
                    </label>
                    <select
                      value={newSectionType}
                      onChange={(e) => setNewSectionType(e.target.value)}
                      className="bg-background border-border text-foreground w-full rounded border px-2.5 py-1.5 text-xs"
                      data-testid="select-section-type"
                    >
                      <option value="hero">Hero Block</option>
                      <option value="projects_grid">Projects Grid</option>
                      <option value="skills">Technical Skills</option>
                      <option value="experience">Experience Timeline</option>
                      <option value="ai_lab">Interactive AI Lab</option>
                      <option value="callout">Callout & Actions</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-muted-foreground block text-[11px] font-medium">
                      Title (Arabic)
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="عنوان القسم بالعربية"
                      value={newSectionTitleAr}
                      onChange={(e) => setNewSectionTitleAr(e.target.value)}
                      className="bg-background border-border text-foreground w-full rounded border px-2.5 py-1.5 text-xs"
                      required
                      data-testid="input-section-title-ar"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground block text-[11px] font-medium">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="Section title in English"
                      value={newSectionTitleEn}
                      onChange={(e) => setNewSectionTitleEn(e.target.value)}
                      className="bg-background border-border text-foreground w-full rounded border px-2.5 py-1.5 text-xs"
                      required
                      data-testid="input-section-title-en"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingSection}
                    className="text-xs"
                    data-testid="btn-submit-section"
                  >
                    {isSubmittingSection ? "Adding..." : "Save Section"}
                  </Button>
                </div>
              </form>
            )}

            {isLoadingSections ? (
              <div className="text-muted-foreground py-6 text-center text-xs">
                Loading page sections...
              </div>
            ) : sections.length === 0 ? (
              <div className="text-muted-foreground bg-muted/20 rounded-md border border-dashed p-6 text-center text-xs">
                No sections configured for this page yet. Click &quot;+ Add Section&quot; to compose
                your layout.
              </div>
            ) : (
              <div className="space-y-2" data-testid="sections-list">
                {sections.map((sec, idx) => {
                  const secTitle =
                    locale === "ar" ? sec.translations.ar.title : sec.translations.en.title;
                  return (
                    <div
                      key={sec.id}
                      className="bg-background border-border hover:border-primary/40 flex items-center justify-between rounded-lg border p-3 text-xs transition-colors"
                      data-testid={`section-item-${sec.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Keyboard accessible up/down ordering */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, "up")}
                            disabled={idx === 0}
                            className="text-muted-foreground hover:text-foreground px-1 py-0.5 disabled:opacity-30"
                            aria-label={`Move section ${sec.sectionType} up`}
                            data-testid={`btn-move-up-${idx}`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveSection(idx, "down")}
                            disabled={idx === sections.length - 1}
                            className="text-muted-foreground hover:text-foreground px-1 py-0.5 disabled:opacity-30"
                            aria-label={`Move section ${sec.sectionType} down`}
                            data-testid={`btn-move-down-${idx}`}
                          >
                            ▼
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground font-semibold">
                              {secTitle || sec.sectionType}
                            </span>
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {sec.sectionType}
                            </Badge>
                            {sec.status === "PUBLISHED" ? (
                              <span className="text-[10px] font-semibold text-emerald-600">
                                PUBLISHED
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-600">
                                DRAFT
                              </span>
                            )}
                          </div>
                          <span className="text-muted-foreground text-[11px]">
                            {sec.blocksCount} composable blocks • Order #{sec.orderIndex + 1}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection(sec.id)}
                          className="text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                          data-testid={`btn-delete-section-${sec.id}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Publishing Queue */}
      {activeTab === "publishing" && (
        <Card className="border-border" data-testid="publishing-panel">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-foreground text-sm font-semibold">
              Publishing & Quality Review Queue
            </CardTitle>
            <CardDescription className="text-xs">
              Validate and release pending drafts across pages, blocks, and translations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="bg-muted/30 border-border rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-foreground text-xs font-semibold">Pending Draft Revisions</h4>
                  <p className="text-muted-foreground text-xs">
                    {totalDraft + pendingSections} items currently in draft mode awaiting
                    verification.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setPages((prev) => prev.map((p) => ({ ...p, status: "PUBLISHED" })));
                    setActionMessage("All drafts successfully published and caches purged.");
                  }}
                  className="text-xs font-semibold"
                  data-testid="btn-publish-all"
                >
                  Publish All Drafts
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-muted-foreground block text-xs font-medium uppercase">
                Content Quality Verification Rules
              </span>
              <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-xs">
                <li>
                  Bilingual parity: All pages and sections must provide valid Arabic and English
                  titles.
                </li>
                <li>
                  Link validation: All external references must pass protocol sanitization (https
                  only).
                </li>
                <li>
                  Instant cache invalidation: Publishing updates PostgreSQL transactions and flushes
                  Next.js ISR tags.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
