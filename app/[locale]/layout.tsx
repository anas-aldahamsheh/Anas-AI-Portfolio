import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { LOCALES, dirOf, isLocale, type Locale } from "@/i18n/config";
import { I18nProvider } from "@/i18n/provider";
import { getMessages } from "@/server/content/ui-text";
import { getProfile } from "@/server/content/repository";
import { siteUrl } from "@/lib/site";
import { DocumentScript } from "@/ui/document-script";
import { MotionProvider } from "@/ui/motion/motion-provider";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#07101f" },
  ],
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const profile = await getProfile(locale);
  const name = profile?.t.name ?? (locale === "ar" ? "أنس الدحامشة" : "Anas Al Dahamsheh");
  const headline = profile?.t.headline ?? "AI Engineer";
  const description = profile?.t.tagline || profile?.t.summary || headline;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${name} — ${headline}`, template: `%s | ${name}` },
    description,
    applicationName: name,
    authors: [{ name }],
    creator: name,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", ar: "/ar", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      siteName: name,
      title: `${name} — ${headline}`,
      description,
      locale: locale === "ar" ? "ar_JO" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_JO"],
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title: `${name} — ${headline}`, description },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const messages = await getMessages(locale);

  return (
    <html lang={locale} dir={dirOf(locale)} className={fontVariables} suppressHydrationWarning>
      <head>
        <DocumentScript />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <I18nProvider locale={locale} messages={messages}>
          <MotionProvider>{children}</MotionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
