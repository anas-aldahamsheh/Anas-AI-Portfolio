import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { cvService } from "@/modules/cv/infrastructure/cv-service";
import { cvPublishInputSchema } from "@/modules/cv/domain/cv";
import { logger } from "@/lib/observability/logger";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const [versions, current] = await Promise.all([
      cvService.listVersions(),
      cvService.getPublishedCv(),
    ]);

    return NextResponse.json({ success: true, versions, current });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: "Failed to list CV versions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const changelog = (formData.get("changelog") as string) || undefined;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Invalid file type: PDF required" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const version = await cvService.createVersion(
      file.name,
      buffer,
      changelog,
      authContext.user.id,
    );

    return NextResponse.json({ success: true, version }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }

    logger.error("admin_cv_upload_error", {
      module: "cv_admin",
      metadata: { error: String(err) },
    });

    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to upload CV" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = cvPublishInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    await cvService.publishVersion(parseResult.data.versionId, authContext.user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update CV version" },
      { status: 500 },
    );
  }
}
