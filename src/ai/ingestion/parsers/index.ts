import { RawDocument, IngestionSourceType } from "@/ai/contracts/ingestion";
import { parseProjects } from "./project-parser";
import { parseCv } from "./cv-parser";
import { parseSections } from "./section-parser";

export * from "./project-parser";
export * from "./cv-parser";
export * from "./section-parser";

/**
 * Aggregates all authoritative portfolio knowledge sources into RawDocuments.
 */
export async function parseAllSources(options?: {
  sourceType?: IngestionSourceType | undefined;
  sourceId?: string | undefined;
}): Promise<RawDocument[]> {
  const documents: RawDocument[] = [];

  const type = options?.sourceType;
  const id = options?.sourceId;

  if (!type || type === "project") {
    const projectDocs = await parseProjects(type === "project" ? id : undefined);
    documents.push(...projectDocs);
  }

  if (!type || type === "cv") {
    const cvDocs = await parseCv();
    documents.push(...cvDocs);
  }

  if (!type || type === "section" || type === "block") {
    const sectionDocs = await parseSections(type === "section" ? id : undefined);
    documents.push(...sectionDocs);
  }

  return documents;
}
