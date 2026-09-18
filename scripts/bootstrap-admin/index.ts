import { eq } from "drizzle-orm";
import { db, client } from "@/lib/db/client";
import { users, userRoles } from "@/lib/db/schema/auth";
import { auditEvents } from "@/lib/db/schema/admin";
import { logger } from "@/lib/observability/logger";

/**
 * Secure Admin Bootstrap CLI Script
 *
 * Usage:
 *   pnpm tsx scripts/bootstrap-admin/index.ts --email admin@example.com
 *
 * Conforms to:
 *   - docs/security/02_AUTH_AND_ADMIN_SECURITY.md
 *   - TECH_STACK_LOCK.md
 */
async function bootstrapAdmin() {
  const args = process.argv.slice(2);
  const emailIndex = args.indexOf("--email");
  const rawEmail = emailIndex !== -1 ? args[emailIndex + 1] : undefined;

  if (!rawEmail || rawEmail.trim().length === 0) {
    console.error("[ERROR] Missing required argument: --email <user_email>");
    console.info("Usage: pnpm tsx scripts/bootstrap-admin/index.ts --email admin@example.com");
    process.exit(1);
  }

  const targetEmail = rawEmail.trim().toLowerCase();

  logger.info("admin_bootstrap_started", {
    module: "admin_bootstrap",
    metadata: { targetEmail },
  });

  try {
    // 1. Find user by email
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, targetEmail))
      .limit(1);

    const user = existingUsers[0];
    if (!user) {
      console.error(`[ERROR] User with email '${targetEmail}' does not exist in the database.`);
      console.error(
        "Please register the user first via the sign-up page or API, then run this bootstrap command.",
      );
      process.exit(1);
    }

    // 2. Check if user already has a role entry
    const existingRoles = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, user.id))
      .limit(1);

    const existingRole = existingRoles[0];

    if (existingRole) {
      await db
        .update(userRoles)
        .set({
          role: "ADMIN",
          grantedAt: new Date(),
        })
        .where(eq(userRoles.id, existingRole.id));
    } else {
      await db.insert(userRoles).values({
        userId: user.id,
        role: "ADMIN",
      });
    }

    // 3. Record audit event
    await db.insert(auditEvents).values({
      userId: user.id,
      action: "ADMIN_BOOTSTRAP_ELEVATION",
      entityType: "user_role",
      entityId: user.id,
      newState: { role: "ADMIN", email: targetEmail },
    });

    logger.info("admin_bootstrap_completed", {
      module: "admin_bootstrap",
      userId: user.id,
      metadata: { targetEmail, role: "ADMIN" },
    });

    console.info(
      `[SUCCESS] User '${targetEmail}' (ID: ${user.id}) has been elevated to ADMIN role.`,
    );
  } catch (err) {
    logger.error("admin_bootstrap_failed", {
      module: "admin_bootstrap",
      metadata: { error: String(err) },
    });
    console.error("[ERROR] Failed to bootstrap admin:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

bootstrapAdmin();
