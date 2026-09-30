/**
 * Owner account management (sign-up is disabled on the site).
 *
 *   pnpm admin -- --email me@example.com --password "a strong password" [--name "Anas"]
 *
 * Creates the account if it doesn't exist, (re)sets its password, and grants the ADMIN role.
 */
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/security/auth";
import { client, db } from "@/lib/db/client";
import { accounts, userRoles, users } from "@/lib/db/schema/auth";

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = arg("email")?.trim().toLowerCase();
  const password = arg("password");
  const name = arg("name") ?? "Owner";
  if (!email || !password || password.length < 8) {
    console.error(
      'Usage: pnpm admin -- --email you@example.com --password "8+ characters" [--name "Your Name"]',
    );
    process.exitCode = 1;
    return;
  }

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    [user] = await db.insert(users).values({ email, name, emailVerified: true }).returning();
    console.info(`Created user ${email}`);
  }
  if (!user) throw new Error("Could not create the user");

  const [credential] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, user.id), eq(accounts.providerId, "credential")))
    .limit(1);
  if (credential) {
    await db
      .update(accounts)
      .set({ password: hash, updatedAt: new Date() })
      .where(eq(accounts.id, credential.id));
    console.info("Password updated");
  } else {
    await db
      .insert(accounts)
      .values({ userId: user.id, accountId: user.id, providerId: "credential", password: hash });
    console.info("Password set");
  }

  const [role] = await db.select().from(userRoles).where(eq(userRoles.userId, user.id)).limit(1);
  if (!role) await db.insert(userRoles).values({ userId: user.id, role: "ADMIN" });
  else if (role.role !== "ADMIN")
    await db.update(userRoles).set({ role: "ADMIN" }).where(eq(userRoles.id, role.id));
  console.info(`${email} is an administrator.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
