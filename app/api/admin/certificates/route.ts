import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
} from "@/modules/auth/infrastructure/server-auth";
import { certificateService } from "@/modules/certificates/infrastructure/certificate-service";
import {
  certificateItemSchema,
  certificatesConfigSchema,
} from "@/modules/certificates/domain/types";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request.headers);
    const certificates = await certificateService.getCertificates();
    return NextResponse.json({ success: true, certificates });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: "Failed to retrieve certificates" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = certificateItemSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await certificateService.saveCertificate(
      parseResult.data,
      authContext.user.id,
    );

    return NextResponse.json({ success: true, certificates: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to create certificate" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    // Check if body is an array or object containing certificates array (bulk save)
    if (Array.isArray(body)) {
      const parseResult = certificatesConfigSchema.safeParse({ certificates: body });
      if (!parseResult.success) {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: parseResult.error.flatten() },
          { status: 400 },
        );
      }
      const updated = await certificateService.updateCertificates(
        parseResult.data.certificates,
        authContext.user.id,
      );
      return NextResponse.json({ success: true, certificates: updated });
    }

    if (body && typeof body === "object" && "certificates" in body) {
      const parseResult = certificatesConfigSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: parseResult.error.flatten() },
          { status: 400 },
        );
      }
      const updated = await certificateService.updateCertificates(
        parseResult.data.certificates,
        authContext.user.id,
      );
      return NextResponse.json({ success: true, certificates: updated });
    }

    // Single item update
    const parseResult = certificateItemSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await certificateService.saveCertificate(
      parseResult.data,
      authContext.user.id,
    );

    return NextResponse.json({ success: true, certificates: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update certificates" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authContext = await requireAdmin(request.headers);
    const searchParams = request.nextUrl.searchParams;
    let certificateId = searchParams.get("id");

    if (!certificateId) {
      try {
        const body = (await request.json()) as { id?: string };
        certificateId = body?.id ?? null;
      } catch {
        // No body provided
      }
    }

    if (!certificateId) {
      return NextResponse.json(
        { success: false, error: "Certificate id is required" },
        { status: 400 },
      );
    }

    const updated = await certificateService.deleteCertificate(
      certificateId,
      authContext.user.id,
    );

    return NextResponse.json({ success: true, certificates: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to delete certificate" },
      { status: 500 },
    );
  }
}
