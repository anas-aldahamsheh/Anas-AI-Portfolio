import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/modules/projects/infrastructure/project-service";
import type { PublishStatus } from "@/modules/projects/domain/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get("locale") || "en";
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const search = searchParams.get("search") || undefined;
    const featuredOnly = searchParams.get("featured") === "true";
    const sortBy = (searchParams.get("sort") as "order" | "latest" | "title") || "order";

    const result = await projectService.listProjects({
      locale,
      category,
      tag,
      search,
      featuredOnly,
      sortBy,
      status: "PUBLISHED" as PublishStatus,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to retrieve projects" }, { status: 500 });
  }
}
