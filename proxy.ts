import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["en", "ar"] as const;
const LOCALE_COOKIE = "pf_locale";

function preferredLocale(request: NextRequest): (typeof LOCALES)[number] {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved === "en" || saved === "ar") return saved;
  const header = request.headers.get("accept-language") ?? "";
  // Pick the first listed language we support (quality ordering is how browsers send it).
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase() ?? "";
    if (tag.startsWith("ar")) return "ar";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}

/**
 * Sends locale-less URLs (`/`, `/projects`, `/cv?x=1`) to the visitor's language,
 * keeping the rest of the path, the query and the hash.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1] ?? "";
  if ((LOCALES as readonly string[]).includes(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Everything except API routes, Next internals, uploaded media and files with an extension.
  matcher: ["/((?!api|_next|media|images|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
