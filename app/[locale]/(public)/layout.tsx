import React from "react";
import { navigationService } from "@/modules/navigation/infrastructure/navigation-service";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import { LocalizationProvider } from "@/modules/localization/presentation/localization-provider";
import { Navbar, Footer } from "@/modules/navigation/presentation";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;

  // Retrieve dynamic navigation items for header and footer
  const [headerItems, footerItems, dictionary] = await Promise.all([
    navigationService.getNavigationItems("header"),
    navigationService.getNavigationItems("footer"),
    localizedTextService.getDictionary(supportedLocale),
  ]);

  return (
    <LocalizationProvider locale={supportedLocale} dictionary={dictionary}>
      <div className="bg-background text-foreground flex min-h-screen flex-col">
        <Navbar locale={supportedLocale} items={headerItems} />
        <div id="main-content" className="flex-1">
          {children}
        </div>
        <Footer locale={supportedLocale} items={footerItems} />
      </div>
    </LocalizationProvider>
  );
}
