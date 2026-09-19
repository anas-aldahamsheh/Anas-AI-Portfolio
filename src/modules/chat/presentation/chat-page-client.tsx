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
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900">
                <Sparkles className="h-5 w-5" />
              </span>
              <Badge variant="outline" className="text-xs">
                {isAr ? "مساعد التوظيف والخبرات" : "Recruiter Assistant"}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {isAr ? "بيانات موثقة بالأدلة" : "Verified Career Evidence"}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
              {t("chat.title") || (isAr ? "اسأل عن أنس" : "Ask About Anas")}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {t("chat.subtitle") ||
                (isAr
                  ? "مساعد تفاعلي موجه لمسؤولي التوظيف والمهندسين لاستكشاف خبرات ومشاريع أنس وملاءمته للأدوار التقنية."
                  : "Interactive assistant for recruiters and engineering leads to explore Anas's background, production projects, and role suitability.")}
            </p>
          </div>

          <Button
            onClick={() => handleLaunchChat()}
            size="lg"
            className="flex shrink-0 items-center gap-2 font-medium"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{isAr ? "بدء المحادثة" : "Start Conversation"}</span>
          </Button>
        </div>

        {/* Recruiter Focus Points */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-neutral-200/60 pt-6 text-xs text-neutral-600 dark:border-neutral-800/60 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {isAr ? "تقييم الملاءمة للأدوار الوظيفية" : "Role Fit & Competency Evaluation"}
            </span>
          </div>
          <span className="opacity-40">•</span>
          <div className="flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>
              {isAr
                ? "تفاصيل المعمارية والقرارات الهندسية"
                : "Architecture Decisions & Code Evidence"}
            </span>
          </div>
          <span className="opacity-40">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
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
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
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
                className="group flex flex-col items-start justify-between rounded-xl border border-neutral-200/80 bg-white p-5 text-start shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:hover:border-neutral-700"
              >
                <div className="space-y-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-800 transition-colors group-hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:group-hover:bg-neutral-700">
                    <IconComponent className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {item.prompt}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-neutral-900 group-hover:underline dark:text-neutral-100">
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
