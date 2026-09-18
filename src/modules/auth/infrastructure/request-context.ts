import { getCurrentSession, type AuthenticatedContext } from "./server-auth";

export interface GuestContext {
  readonly isAuthenticated: false;
  readonly role: "GUEST";
  readonly isGuest: true;
  readonly user: null;
  readonly session: null;
}

export interface AuthenticatedRequestContext {
  readonly isAuthenticated: true;
  readonly role: "USER" | "ADMIN";
  readonly isGuest: false;
  readonly user: AuthenticatedContext["user"];
  readonly session: AuthenticatedContext["session"];
}

export type RequestContext = GuestContext | AuthenticatedRequestContext;

/**
 * Resolves the request context without throwing errors or gating access.
 * If unauthenticated, returns clean GuestContext.
 *
 * PRIVACY & GUEST-FIRST GUARANTEES:
 * - Does not create shadow accounts or database user records for guests.
 * - Does not set tracking cookies or browser fingerprinting identifiers.
 * - Ephemeral by default (NON_NEGOTIABLES #32).
 */
export async function resolveRequestContext(customHeaders?: Headers): Promise<RequestContext> {
  const session = await getCurrentSession(customHeaders);

  if (!session || session.role === "GUEST") {
    return {
      isAuthenticated: false,
      role: "GUEST",
      isGuest: true,
      user: null,
      session: null,
    };
  }

  return {
    isAuthenticated: true,
    role: session.role as "USER" | "ADMIN",
    isGuest: false,
    user: session.user,
    session: session.session,
  };
}
