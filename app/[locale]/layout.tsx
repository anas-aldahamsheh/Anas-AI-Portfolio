import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "AI & Web Engineering Portfolio",
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

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
