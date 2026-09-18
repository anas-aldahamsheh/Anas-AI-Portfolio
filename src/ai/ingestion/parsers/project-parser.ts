import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  projects,
  projectTranslations,
  projectTags,
  projectTagLinks,
  projectCategories,
  projectCategoryLinks,
} from "@/lib/db/schema";
import { RawDocument } from "@/ai/contracts/ingestion";

/**
 * Parses published projects and their multilingual deep-dive sections into RawDocuments.
 */
export async function parseProjects(targetProjectId?: string): Promise<RawDocument[]> {
  const documents: RawDocument[] = [];

  // Query published projects
  const query = db
    .select({
      id: projects.id,
      slug: projects.slug,
      isFeatured: projects.isFeatured,
      repoUrl: projects.repoUrl,
      demoUrl: projects.demoUrl,
      status: projects.status,
    })
    .from(projects)
    .where(
      targetProjectId
        ? and(eq(projects.id, targetProjectId), eq(projects.status, "PUBLISHED"))
        : eq(projects.status, "PUBLISHED"),
    );

  const projectRows = await query;
  if (projectRows.length === 0) return documents;

  // Fetch all tags and categories
  const tagRows = await db
    .select({
      projectId: projectTagLinks.projectId,
      tagName: projectTags.name,
    })
    .from(projectTagLinks)
    .innerJoin(projectTags, eq(projectTags.id, projectTagLinks.tagId));

  const tagsByProject = new Map<string, string[]>();
  for (const tr of tagRows) {
    const list = tagsByProject.get(tr.projectId) ?? [];
    list.push(tr.tagName);
    tagsByProject.set(tr.projectId, list);
  }

  const categoryRows = await db
    .select({
      projectId: projectCategoryLinks.projectId,
      categoryName: projectCategories.name,
    })
    .from(projectCategoryLinks)
    .innerJoin(projectCategories, eq(projectCategories.id, projectCategoryLinks.categoryId));

  const categoriesByProject = new Map<string, string[]>();
  for (const cr of categoryRows) {
    const list = categoriesByProject.get(cr.projectId) ?? [];
    list.push(cr.categoryName);
    categoriesByProject.set(cr.projectId, list);
  }

  for (const proj of projectRows) {
    // Fetch translations for this project
    const transRows = await db
      .select()
      .from(projectTranslations)
      .where(eq(projectTranslations.projectId, proj.id));

    const tags = tagsByProject.get(proj.id) ?? [];
    const categories = categoriesByProject.get(proj.id) ?? [];

    for (const trans of transRows) {
      const locale = trans.localeCode === "ar" ? "ar" : "en";
      const sections: string[] = [];

      sections.push(`# ${trans.title}`);
      if (trans.summary) {
        sections.push(
          `## ${locale === "ar" ? "ملخص المشروع" : "Project Summary"}\n${trans.summary}`,
        );
      }
      if (trans.problem) {
        sections.push(
          `## ${locale === "ar" ? "المشكلة والتحدي" : "Problem Statement"}\n${trans.problem}`,
        );
      }
      if (trans.constraints) {
        sections.push(
          `## ${locale === "ar" ? "القيود والمتطلبات" : "Constraints"}\n${trans.constraints}`,
        );
      }
      if (trans.solution) {
        sections.push(`## ${locale === "ar" ? "الحل المقترح" : "Solution"}\n${trans.solution}`);
      }
      if (trans.architecture) {
        sections.push(
          `## ${locale === "ar" ? "المعمارية التقنية" : "Architecture"}\n${trans.architecture}`,
        );
      }
      if (trans.implementation) {
        sections.push(
          `## ${locale === "ar" ? "التنفيذ التقني" : "Implementation"}\n${trans.implementation}`,
        );
      }
      if (trans.challenges) {
        sections.push(
          `## ${locale === "ar" ? "التحديات الهندسية" : "Engineering Challenges"}\n${trans.challenges}`,
        );
      }
      if (trans.decisionsTradeoffs) {
        sections.push(
          `## ${locale === "ar" ? "القرارات والمفاضلات" : "Decisions and Trade-offs"}\n${trans.decisionsTradeoffs}`,
        );
      }
      if (trans.results) {
        sections.push(
          `## ${locale === "ar" ? "النتائج والأثر" : "Results and Impact"}\n${trans.results}`,
        );
      }

      if (tags.length > 0) {
        sections.push(
          `## ${locale === "ar" ? "التقنيات المستخدمة" : "Technologies and Tags"}\n${tags.join(", ")}`,
        );
      }

      const content = sections.join("\n\n").trim();
      if (!content) continue;

      documents.push({
        sourceType: "project",
        sourceId: proj.id,
        title: trans.title,
        locale,
        content,
        metadata: {
          projectId: proj.id,
          slug: proj.slug,
          isFeatured: proj.isFeatured,
          tags,
          categories,
          repoUrl: proj.repoUrl,
          demoUrl: proj.demoUrl,
        },
      });
    }
  }

  return documents;
}
