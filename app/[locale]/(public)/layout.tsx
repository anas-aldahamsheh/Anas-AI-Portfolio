import React from "react";
import { navigationService } from "@/modules/navigation/infrastructure/navigation-service";
import { localizedTextService } from "@/modules/localization/infrastructure/localized-text-service";
import { LocalizationProvider } from "@/modules/localization/presentation/localization-provider";
import { getCurrentSession } from "@/modules/auth/infrastructure/server-auth";
import {
  AdminEditProvider,
  AdminToolbar,
  ContextualEditorDialog,
} from "@/modules/admin/presentation";
import { socialService } from "@/modules/social/infrastructure/social-service";
import { Navbar, Footer } from "@/modules/navigation/presentation";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;

  // Retrieve dynamic navigation items, dictionary, admin session, and social profiles concurrently
  const [headerItems, footerItems, dictionary, session, githubProfile, linkedinProfile] =
    await Promise.all([
      navigationService.getNavigationItems("header"),
      navigationService.getNavigationItems("footer"),
      localizedTextService.getDictionary(supportedLocale),
      getCurrentSession(),
      socialService.getProfile("github", supportedLocale),
      socialService.getProfile("linkedin", supportedLocale),
    ]);

  const isAdmin = session?.role === "ADMIN";

  return (
    <LocalizationProvider locale={supportedLocale} dictionary={dictionary}>
      <AdminEditProvider isAdmin={isAdmin}>
        <div className="bg-background text-foreground flex min-h-screen flex-col">
          <Navbar
            locale={supportedLocale}
            items={headerItems}
            githubProfile={githubProfile}
            linkedinProfile={linkedinProfile}
          />
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <Footer
            locale={supportedLocale}
            items={footerItems}
            githubProfile={githubProfile}
            linkedinProfile={linkedinProfile}
          />
        </div>
        <AdminToolbar locale={supportedLocale} />
        <ContextualEditorDialog />
      </AdminEditProvider>
    </LocalizationProvider>
  );
}
