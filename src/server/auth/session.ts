import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/security/auth";
import { db } from "@/lib/db/client";
import { userRoles } from "@/lib/db/schema/auth";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export class NotAdminError extends Error {
  constructor() {
    super("Administrator access required");
    this.name = "NotAdminError";
  }
}

/** The signed-in owner, or null. Role is read from the database on every call (never trusted from the client). */
export async function getAdmin(requestHeaders?: Headers): Promise<AdminUser | null> {
  try {
    const session = await auth.api.getSession({ headers: requestHeaders ?? (await headers()) });
    if (!session?.user) return null;
    const [role] = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(and(eq(userRoles.userId, session.user.id), eq(userRoles.role, "ADMIN")))
      .limit(1);
    if (!role) return null;
    return { id: session.user.id, email: session.user.email, name: session.user.name ?? "" };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) throw new NotAdminError();
  return admin;
}
