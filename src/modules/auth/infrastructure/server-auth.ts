import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/security/auth";
import { db } from "@/lib/db/client";
import { userRoles } from "@/lib/db/schema/auth";
import { type Role, isAdmin } from "../domain/roles";
import { logger } from "@/lib/observability/logger";

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Administrator privilege required") {
    super(message);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export interface AuthenticatedContext {
  user: {
    id: string;
    email: string;
    name?: string | null | undefined;
    image?: string | null | undefined;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
  role: Role;
}

/**
 * Retrieves the active role for a user directly from authoritative PostgreSQL database.
 */
export async function getUserRole(userId: string): Promise<Role> {
  try {
    const roles = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    const firstRole = roles[0];
    if (firstRole) {
      return firstRole.role as Role;
    }
    return "USER";
  } catch (err) {
    logger.error("failed_to_fetch_user_role", {
      module: "auth",
      userId,
      metadata: { error: String(err) },
    });
    return "USER";
  }
}

/**
 * Retrieves the current session if authenticated, or null if guest.
 */
export async function getCurrentSession(
  customHeaders?: Headers,
): Promise<AuthenticatedContext | null> {
  let reqHeaders: Headers;

  try {
    reqHeaders = customHeaders ?? (await headers());
  } catch {
    // Gracefully handle test environments where next/headers is not mounted
    reqHeaders = new Headers();
  }

  try {
    const sessionRes = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!sessionRes || !sessionRes.user || !sessionRes.session) {
      return null;
    }

    const role = await getUserRole(sessionRes.user.id);

    return {
      user: {
        id: sessionRes.user.id,
        email: sessionRes.user.email,
        name: sessionRes.user.name,
        image: sessionRes.user.image,
      },
      session: {
        id: sessionRes.session.id,
        userId: sessionRes.session.userId,
        expiresAt: new Date(sessionRes.session.expiresAt),
        token: sessionRes.session.token,
      },
      role,
    };
  } catch (err) {
    logger.error("session_retrieval_error", {
      module: "auth",
      metadata: { error: String(err) },
    });
    return null;
  }
}

/**
 * Server guard: requires authenticated user (USER or ADMIN).
 * Throws UnauthorizedError if unauthenticated.
 */
export async function requireUser(customHeaders?: Headers): Promise<AuthenticatedContext> {
  const context = await getCurrentSession(customHeaders);
  if (!context) {
    throw new UnauthorizedError("You must be logged in to perform this action");
  }
  return context;
}

/**
 * Server guard: requires authenticated ADMIN.
 * Throws UnauthorizedError if unauthenticated, or ForbiddenError if role is not ADMIN.
 */
export async function requireAdmin(customHeaders?: Headers): Promise<AuthenticatedContext> {
  const context = await requireUser(customHeaders);

  if (!isAdmin(context.role)) {
    logger.warn("unauthorized_admin_access_attempt", {
      module: "auth",
      userId: context.user.id,
      metadata: { attemptedRole: context.role },
    });
    throw new ForbiddenError("Administrator privilege required");
  }

  return context;
}
