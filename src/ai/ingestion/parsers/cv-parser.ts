import { RawDocument } from "@/ai/contracts/ingestion";
import { cvService } from "@/modules/cv/infrastructure/cv-service";

/**
 * Parses approved/published CV data into RawDocuments for RAG ingestion.
 */
export async function parseCv(): Promise<RawDocument[]> {
  const documents: RawDocument[] = [];

  try {
    const publishedCv = await cvService.getPublishedCv();
    if (!publishedCv) return documents;

    // English CV representation
    const enContent = [
      `# Curriculum Vitae - Anas AI & Software Engineer`,
      `## Document Overview`,
      `Version: ${publishedCv.versionNumber}`,
      `File: ${publishedCv.fileName}`,
      `Changelog: ${publishedCv.changelog ?? "Production baseline"}`,
      `Published Date: ${publishedCv.publishedAt}`,
      `## Professional Summary`,
      `Senior Full-Stack AI Engineer specializing in production RAG systems, multilingual Arabic/English search architectures, TypeScript, Next.js, and autonomous agent workflows.`,
      `## Core Competencies`,
      `- Software Architecture & Clean Architecture`,
      `- Multilingual Retrieval-Augmented Generation (RAG) with Dense + Sparse Hybrid Search`,
      `- Next.js App Router, React 19, TypeScript Strict Mode`,
      `- Vector Databases: Qdrant, Cosine Similarity, BGE-M3 Embeddings, BGE Reranker`,
      `- Automated Evaluation: RAG Triad (Faithfulness, Answer Relevance, Context Precision)`,
      `- PostgreSQL, Drizzle ORM, Row Level Security (RLS), RBAC`,
    ].join("\n\n");

    // Arabic CV representation
    const arContent = [
      `# السيرة الذاتية - أنس مهندس برمجيات وذكاء اصطناعي`,
      `## بيانات الوثيقة`,
      `رقم الإصدار: ${publishedCv.versionNumber}`,
      `اسم الملف: ${publishedCv.fileName}`,
      `سجل التغييرات: ${publishedCv.changelog ?? "النسخة المعتمدة للإنتاج"}`,
      `تاريخ الاعتماد: ${publishedCv.publishedAt}`,
      `## نبذة مهنية`,
      `مهندس برمجيات وذكاء اصطناعي متخصص في بناء وتصميم أنظمة RAG الإنتاجية المتقدمة، ومحركات البحث الهجين متعدد اللغات (عربي/إنجليزي)، وهندسة البرمجيات المتكاملة بـ TypeScript و Next.js.`,
      `## المهارات والقدرات الأساسية`,
      `- المعمارية البرمجية النظيفة Clean Architecture وتصميم الأنظمة القابلة للتوسع`,
      `- منظومات استرجاع وتوليد RAG متقدمة مع دمج البحث الدلالي واللفظي (Hybrid Search)`,
      `- تطوير تطبيقات الويب الحديثة بـ Next.js و React 19 و TypeScript بنمط التدقيق الصارم`,
      `- قواعد البيانات المتجهية: Qdrant، ومتجهات BGE-M3 متعددة اللغات، ونماذج إعادة الترتيب BGE Reranker`,
      `- أنظمة التقييم الآلي RAG Triad (الأمانة العلمية، صلة الإجابة، دقة السياق)`,
      `- قواعد بيانات PostgreSQL، مع Drizzle ORM وسياسات الأمان RBAC`,
    ].join("\n\n");

    documents.push({
      sourceType: "cv",
      sourceId: publishedCv.id,
      title: "Curriculum Vitae - Professional Resume",
      locale: "en",
      content: enContent,
      metadata: {
        cvVersionId: publishedCv.cvVersionId,
        versionNumber: publishedCv.versionNumber,
        fileName: publishedCv.fileName,
        fileUrl: publishedCv.fileUrl,
      },
    });

    documents.push({
      sourceType: "cv",
      sourceId: publishedCv.id,
      title: "السيرة الذاتية المهنية الرسمية",
      locale: "ar",
      content: arContent,
      metadata: {
        cvVersionId: publishedCv.cvVersionId,
        versionNumber: publishedCv.versionNumber,
        fileName: publishedCv.fileName,
        fileUrl: publishedCv.fileUrl,
      },
    });
  } catch {
    // If CV service cannot find published CV, return empty
  }

  return documents;
}
