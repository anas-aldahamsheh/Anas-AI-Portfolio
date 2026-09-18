import { SearchFilter } from "@/lib/qdrant/vector-store";
import { RetrievalFilter } from "@/ai/contracts/retrieval";

/**
 * Builds Qdrant/vector-store compatible SearchFilter from high-level RetrievalFilter.
 */
export function buildVectorSearchFilter(filter?: RetrievalFilter): SearchFilter | undefined {
  if (!filter) return undefined;

  const must: Array<{ key: string; match: { value: unknown } }> = [];

  if (filter.locale) {
    must.push({ key: "locale", match: { value: filter.locale } });
  }

  if (filter.sourceType) {
    must.push({ key: "sourceType", match: { value: filter.sourceType } });
  }

  if (filter.sourceId) {
    must.push({ key: "sourceId", match: { value: filter.sourceId } });
  }

  if (filter.sectionScope) {
    must.push({ key: "sectionScope", match: { value: filter.sectionScope } });
  }

  if (filter.customFilters) {
    for (const [key, val] of Object.entries(filter.customFilters)) {
      if (val !== undefined && val !== null) {
        must.push({ key, match: { value: val } });
      }
    }
  }

  return must.length > 0 ? { must } : undefined;
}

/**
 * Evaluates whether an arbitrary metadata record satisfies a RetrievalFilter in-memory.
 */
export function matchesRetrievalFilter(
  record: Record<string, unknown>,
  filter?: RetrievalFilter,
): boolean {
  if (!filter) return true;

  if (filter.locale && record["locale"] !== filter.locale) {
    return false;
  }

  if (filter.sourceType) {
    const recordType = record["sourceType"];
    if (Array.isArray(filter.sourceType)) {
      if (!filter.sourceType.includes(recordType as never)) return false;
    } else if (recordType !== filter.sourceType) {
      return false;
    }
  }

  if (filter.sourceId) {
    const recordId = record["sourceId"];
    if (Array.isArray(filter.sourceId)) {
      if (!filter.sourceId.includes(recordId as string)) return false;
    } else if (recordId !== filter.sourceId) {
      return false;
    }
  }

  if (filter.sectionScope && record["sectionScope"] !== filter.sectionScope) {
    return false;
  }

  if (filter.tags && filter.tags.length > 0) {
    const recordTags = (record["tags"] as string[]) ?? [];
    const hasAnyTag = filter.tags.some((tag) => recordTags.includes(tag));
    if (!hasAnyTag) return false;
  }

  if (filter.customFilters) {
    for (const [key, val] of Object.entries(filter.customFilters)) {
      if (val !== undefined && record[key] !== val) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Creates a scoped filter targeting a specific project by ID.
 */
export function createProjectScopeFilter(projectId: string, locale?: "ar" | "en"): RetrievalFilter {
  return {
    sourceType: "project",
    sourceId: projectId,
    ...(locale ? { locale } : {}),
  };
}

/**
 * Creates a filter targeting approved CV content.
 */
export function createCvFilter(locale?: "ar" | "en"): RetrievalFilter {
  return {
    sourceType: "cv",
    ...(locale ? { locale } : {}),
  };
}

/**
 * Creates a filter targeting a specific UI or content section scope.
 */
export function createSectionScopeFilter(
  sectionScope: string,
  locale?: "ar" | "en",
): RetrievalFilter {
  return {
    sourceType: "section",
    sectionScope,
    ...(locale ? { locale } : {}),
  };
}
