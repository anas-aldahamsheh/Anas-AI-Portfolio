"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Code2,
  Briefcase,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ChatPageClient() {
  const { t, locale } = useLocalization();
  const searchParams = useSearchParams();
  const isAr = locale === "ar";

  const projectSlug = searchParams.get("project");
  const projectId = searchParams.get("projectId");
  const initialPrompt = searchParams.get("prompt");

  // Automatically trigger the chat drawer to open when visiting /chat
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("open-project-chat", {
          detail: {
            projectId: projectId || (projectSlug ? String(projectSlug) : undefined),
            projectTitle: projectSlug ? String(projectSlug) : undefined,
            prompt: initialPrompt ? String(initialPrompt) : undefined,
          },
        }),
      );
    }, 200);

    return () => clearTimeout(timer);
  }, [projectId, projectSlug, initialPrompt]);

  const handleLaunchChat = (prompt?: string) => {
    window.dispatchEvent(
      new CustomEvent("open-project-chat", {
        detail: {
          projectId: projectId || (projectSlug ? String(projectSlug) : undefined),
          projectTitle: projectSlug ? String(projectSlug) : undefined,
          prompt,
        },
      }),
    );
  };

  const starterPrompts = isAr
    ? [
        {
          title: "أبرز مهارات الذكاء الاصطناعي",
          prompt:
            "ما هي أقوى مهارات أنس في هندسة الذكاء الاصطناعي وتطوير مسارات الاسترجاع والتقييم؟",
          icon: Code2,
        },
        {
          title: "ملخص الملاءمة لأدوار الذكاء الاصطناعي",
          prompt:
            "لخص لي خبرات أنس ومؤهلاته التقنية ومدى ملاءمته لأدوار AI Engineer أو Senior Full-Stack.",
          icon: Briefcase,
        },
        {
          title: "المشاريع والأنظمة الإنتاجية",
          prompt:
            "ما هي أبرز الأنظمة والمشاريع البرمجية التي صممها وبناها أنس وما هي نتائجها وقراراتها المعمارية؟",
          icon: Zap,
        },
      ]
    : [
        {
          title: "Core AI Engineering Skills",
          prompt:
            "What are Anas's primary AI engineering strengths, evaluation skills, and architectural capabilities?",
          icon: Code2,
        },
        {
          title: "Recruiter & Role Fit Summary",
          prompt:
            "Summarize Anas's engineering experience, qualifications, and suitability for an AI Engineer role.",
          icon: Briefcase,
        },
        {
          title: "Production Systems Built",
          prompt:
            "What production AI systems, pipelines, or automation tools has Anas built, and what were the outcomes?",
          icon: Zap,
        },
      ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-b from-neutral-50 to-white p-6 shadow-xs sm:p-10 dark:border-neutral-800/80 dark:from-neutral-900/50 dark:to-neutral-950">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#173B6C]/10 via-[#2F6FED]/15 to-[#0891B2]/10 text-[#173B6C] ring-1 ring-[#173B6C]/15 dark:from-[#4F46E5]/20 dark:to-[#0891B2]/20 dark:text-[#67E8F9] dark:ring-white/10">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <Badge variant="outline" className="font-manrope text-xs">
                {isAr ? "مساعد التوظيف والخبرات" : "Recruiter Assistant"}
              </Badge>
              <Badge variant="secondary" className="font-manrope text-xs">
                {isAr ? "بيانات موثقة بالأدلة" : "Verified Career Evidence"}
              </Badge>
            </div>
            <h1 className="font-space-grotesk text-2xl font-bold tracking-tight text-[#173B6C] sm:text-3xl dark:text-[#F4F7FF]">
              {t("chat.title") || (isAr ? "اسأل عن أنس" : "Ask About Anas")}
            </h1>
            <p className="max-w-2xl font-manrope text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {t("chat.subtitle") ||
                (isAr
                  ? "مساعد تفاعلي موجه لمسؤولي التوظيف والمهندسين لاستكشاف خبرات ومشاريع أنس وملاءمته للأدوار التقنية."
                  : "Interactive assistant for recruiters and engineering leads to explore Anas's background, production projects, and role suitability.")}
            </p>
          </div>

          <Button
            onClick={() => handleLaunchChat()}
            size="lg"
            className="flex shrink-0 items-center gap-2 font-manrope font-semibold bg-gradient-to-r from-[#173B6C] via-[#2F6FED] to-[#0891B2] text-white shadow-md shadow-blue-500/20 hover:opacity-95 dark:from-[#4F46E5] dark:via-[#6366F1] dark:to-[#0891B2]"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{isAr ? "بدء المحادثة" : "Start Conversation"}</span>
          </Button>
        </div>

        {/* Recruiter Focus Points */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200/70 pt-6 font-manrope text-xs text-slate-600 dark:border-white/[0.08] dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-[#2F6FED] dark:text-cyan-400" />
            <span>
              {isAr ? "تقييم الملاءمة للأدوار الوظيفية" : "Role Fit & Competency Evaluation"}
            </span>
          </div>
          <span className="opacity-40">•</span>
          <div className="flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-[#173B6C] dark:text-indigo-400" />
            <span>
              {isAr
                ? "تفاصيل المعمارية والقرارات الهندسية"
                : "Architecture Decisions & Code Evidence"}
            </span>
          </div>
          <span className="opacity-40">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isAr
                ? "إجابات مبنية حصراً على بيانات موثقة"
                : "Strict Evidence Grounding (No Hallucinations)"}
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Starter Prompts */}
      <div className="mt-8 space-y-4">
        <h2 className="font-space-grotesk text-base font-bold text-[#173B6C] dark:text-[#F4F7FF]">
          {isAr ? "أسئلة مقترحة لمسؤولي التوظيف" : "Recommended Recruiter Inquiries"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {starterPrompts.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleLaunchChat(item.prompt)}
                className="group flex flex-col items-start justify-between rounded-xl border border-slate-200/80 bg-white/90 p-5 text-start shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[#2F6FED]/60 hover:shadow-md hover:shadow-blue-500/5 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-cyan-400/40 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                <div className="space-y-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#173B6C] transition-colors group-hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-cyan-300">
                    <IconComponent className="h-4 w-4" />
                  </span>
                  <h3 className="font-space-grotesk text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="font-manrope text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.prompt}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 font-manrope text-xs font-semibold text-[#2F6FED] group-hover:underline dark:text-cyan-400">
                  <span>{isAr ? "اسأل الآن" : "Ask Now"}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
