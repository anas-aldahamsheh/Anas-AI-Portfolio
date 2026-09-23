"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CvDocumentViewerProps {
  fileUrl: string;
  fileName?: string | undefined;
  locale?: string | undefined;
}

// Global typing for window.pdfjsLib
declare global {
  interface Window {
    pdfjsLib?: {
      getDocument: (params: { url: string } | { data: Uint8Array }) => {
        promise: Promise<{
          numPages: number;
          getPage: (pageNumber: number) => Promise<{
            getViewport: (params: { scale: number; rotation?: number }) => {
              width: number;
              height: number;
            };
            render: (params: {
              canvasContext: CanvasRenderingContext2D;
              viewport: { width: number; height: number };
            }) => {
              promise: Promise<void>;
            };
          }>;
        }>;
      };
      GlobalWorkerOptions: {
        workerSrc: string;
      };
    };
  }
}

export function CvDocumentViewer({
  fileUrl,
  fileName = "Curriculum Vitae",
  locale = "en",
}: CvDocumentViewerProps) {
  const isArabic = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load PDF.js library
  useEffect(() => {
    let isMounted = true;

    const loadPdfJs = async () => {
      if (window.pdfjsLib) {
        return window.pdfjsLib;
      }

      return new Promise<any>((resolve, reject) => {
        const existingScript = document.getElementById("pdfjs-lib-script");
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(window.pdfjsLib));
          return;
        }

        const script = document.createElement("script");
        script.id = "pdfjs-lib-script";
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.async = true;
        script.onload = () => {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            resolve(window.pdfjsLib);
          } else {
            reject(new Error("pdfjsLib not available after script load"));
          }
        };
        script.onerror = () => reject(new Error("Failed to load PDF viewer engine"));
        document.head.appendChild(script);
      });
    };

    const fetchPdf = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const pdfjs = await loadPdfJs();
        if (!isMounted) return;

        const loadingTask = pdfjs.getDocument({ url: fileUrl });
        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
      } catch (err) {
        if (!isMounted) return;
        setErrorMessage(
          err instanceof Error
            ? err.message
            : isArabic
              ? "تعذر تحميل مستند الـ PDF للمعاينة"
              : "Failed to load PDF document for preview",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPdf();

    return () => {
      isMounted = false;
    };
  }, [fileUrl, isArabic]);

  // Render current page onto canvas
  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

      setIsRendering(true);
      try {
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Compute standard natural 100% scale (or fit to mobile viewport if narrower)
        const containerWidth = containerRef.current.clientWidth || 800;
        const unscaledViewport = page.getViewport({ scale: 1, rotation });
        const baseScale = Math.min(1.0, (containerWidth - 32) / unscaledViewport.width);
        const effectiveScale = Math.max(0.5, Math.min(2.5, baseScale * scale));

        // High-DPI crisp rendering
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: effectiveScale, rotation });

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        // Ignored if cancelled during fast page flipping
      } finally {
        setIsRendering(false);
      }
    },
    [pdfDoc, scale, rotation],
  );

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, rotation, renderPage]);

  // Page switching handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleZoomIn = () => setScale((prev) => Math.min(2.0, Math.round((prev + 0.1) * 10) / 10));
  const handleZoomOut = () => setScale((prev) => Math.max(0.6, Math.round((prev - 0.1) * 10) / 10));
  const handleResetZoom = () => setScale(1.0);
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white/90 text-neutral-900 shadow-sm backdrop-blur-md transition-all dark:border-white/[0.08] dark:bg-[#07101F]/85 dark:text-neutral-100"
    >
      {/* Custom Header Toolbar — Clean & Integrated matching Overview identity */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5EAF2] bg-[#F8FAFF]/90 p-3 sm:px-4 backdrop-blur-xs dark:border-white/[0.08] dark:bg-white/[0.03]">
        {/* Left: Page Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            aria-label={isArabic ? "الصفحة السابقة" : "Previous page"}
            className="h-8 w-8 p-0 rounded-lg border-[#E5EAF2] dark:border-white/[0.1] hover:bg-neutral-100 dark:hover:bg-white/[0.08]"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>

          <span className="min-w-[70px] text-center font-mono text-xs font-semibold select-none sm:text-sm text-[#173B6C] dark:text-[#F4F7FF]">
            {numPages > 0 ? (
              <>
                <span className="text-[#2F6FED] dark:text-indigo-400 font-bold">{currentPage}</span>
                <span className="text-[#6C7893] dark:text-[#9AA8C0] mx-1">/</span>
                <span>{numPages}</span>
              </>
            ) : (
              "—"
            )}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= numPages || isLoading}
            aria-label={isArabic ? "الصفحة التالية" : "Next page"}
            className="h-8 w-8 p-0 rounded-lg border-[#E5EAF2] dark:border-white/[0.1] hover:bg-neutral-100 dark:hover:bg-white/[0.08]"
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>

          {/* Quick Page Indicator Chips if multi-page */}
          {numPages > 1 && (
            <div className="ms-2 hidden items-center gap-1 sm:flex">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((pageIdx) => (
                <button
                  key={pageIdx}
                  type="button"
                  onClick={() => setCurrentPage(pageIdx)}
                  className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-[11px] font-bold transition-all ${
                    currentPage === pageIdx
                      ? "bg-[#EEF5FF] text-[#1E40AF] border border-[#D0E2FF] shadow-2xs dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-500/30"
                      : "text-[#6C7893] hover:bg-neutral-100 hover:text-[#173B6C] dark:text-[#9AA8C0] dark:hover:bg-white/[0.06] dark:hover:text-[#F4F7FF]"
                  }`}
                >
                  {pageIdx}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Zoom & Export Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.75 || isLoading}
            title={isArabic ? "تصغير" : "Zoom out"}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>

          <button
            type="button"
            onClick={handleResetZoom}
            title={isArabic ? "إعادة التعيين إلى 100%" : "Reset zoom to 100%"}
            className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#E5EAF2] bg-white text-[#173B6C] hover:bg-[#EEF5FF] hover:text-[#2F6FED] transition-colors cursor-pointer shadow-2xs dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-[#F4F7FF]"
          >
            {Math.round(scale * 100)}%
          </button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 2.2 || isLoading}
            title={isArabic ? "تكبير" : "Zoom in"}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            disabled={isLoading}
            title={isArabic ? "تدوير" : "Rotate"}
            className="hidden h-8 w-8 p-0 sm:inline-flex"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>

          <div className="mx-1 hidden h-4 w-px bg-[#E5EAF2] sm:block dark:bg-white/[0.1]" />

          {/* Direct Actions */}
          <a
            href={`${fileUrl}?download=1`}
            download={fileName || "cv.pdf"}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E5EAF2] bg-white px-2.5 text-xs font-medium text-[#173B6C] transition-colors hover:bg-neutral-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]"
            title={isArabic ? "تنزيل ملف الـ PDF" : "Download PDF file"}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{isArabic ? "تنزيل" : "Download"}</span>
          </a>

          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5EAF2] bg-white text-[#6C7893] transition-colors hover:bg-neutral-100 hover:text-[#173B6C] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-[#F4F7FF]"
            title={isArabic ? "فتح في نافذة كاملة" : "Open full document"}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Main Canvas Document Viewport — Centered, No Dark Side Gaps */}
      <div className="bg-neutral-100/70 dark:bg-neutral-950/80 relative flex min-h-[500px] w-full items-center justify-center overflow-auto p-4 sm:p-8">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="text-muted-foreground flex flex-col items-center gap-3 py-16">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-xs font-medium">
              {isArabic ? "جارٍ تحضير وعرض المستند..." : "Rendering document..."}
            </p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div className="max-w-md space-y-3 p-8 text-center">
            <AlertCircle className="text-destructive mx-auto h-8 w-8" />
            <p className="text-sm font-semibold">{errorMessage}</p>
            <div className="flex justify-center gap-2 pt-2">
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>{isArabic ? "فتح في المتصفح" : "Open in Browser"}</span>
                </Button>
              </a>
              <a href={`${fileUrl}?download=1`} download>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span>{isArabic ? "تحميل مباشر" : "Direct Download"}</span>
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Sharp High-DPI Canvas Rendering */}
        <canvas
          ref={canvasRef}
          className={`mx-auto rounded-lg bg-white shadow-xl transition-opacity duration-200 dark:shadow-2xl ${
            isLoading || errorMessage ? "hidden" : "block"
          } ${isRendering ? "opacity-75" : "opacity-100"}`}
        />
      </div>

      {/* Bottom Page Indicator Footer (for multi-page documents) */}
      {numPages > 1 && !isLoading && !errorMessage && (
        <div className="border-border bg-muted/30 flex items-center justify-between border-t px-4 py-2 text-xs">
          <span className="text-muted-foreground">
            {isArabic ? `الصفحة ${currentPage} من أصل ${numPages}` : `Page ${currentPage} of ${numPages}`}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="h-7 text-xs"
            >
              {isArabic ? "← السابقة" : "← Previous"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="h-7 text-xs"
            >
              {isArabic ? "التالية →" : "Next →"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
