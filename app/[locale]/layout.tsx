import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import "../globals.css";
import { DirectionProvider } from "@/modules/localization/presentation/direction-provider";
import { ThemeProvider } from "@/modules/theme/presentation/theme-provider";
import { ThemeScript } from "@/modules/theme/presentation/theme-script";
import { getThemeFromCookie } from "@/modules/theme/infrastructure/theme-cookie";
import type { Theme } from "@/modules/theme/domain/theme";

import { MotionProvider } from "@/modules/motion/presentation/motion-provider";
import { SkipLink, AnnouncerProvider } from "@/modules/accessibility/presentation";
import { fontInter, fontIBMPlexSansArabic, fontSora, fontSpaceGrotesk, fontManrope } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "AI & Web Engineering Portfolio",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

export const dynamicParams = true;

const SUPPORTED_LOCALES = ["ar", "en"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  let serverTheme: Theme = "system";
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    serverTheme = getThemeFromCookie(cookieHeader);
  } catch {
    // Graceful fallback for static page generation and test environments
    serverTheme = "system";
  }

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${fontInter.variable} ${fontIBMPlexSansArabic.variable} ${fontSora.variable} ${fontSpaceGrotesk.variable} ${fontManrope.variable} ${serverTheme === "dark" ? "dark" : ""}`.trim()}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen font-sans antialiased">
        <ThemeProvider initialTheme={serverTheme}>
          <MotionProvider>
            <DirectionProvider dir={dir}>
              <AnnouncerProvider>
                <SkipLink locale={locale} />
                {children}
              </AnnouncerProvider>
            </DirectionProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
