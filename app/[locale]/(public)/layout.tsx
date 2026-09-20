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
import { ChatDrawer } from "@/modules/chat/presentation";
import type { SupportedLocale } from "@/modules/localization/domain/locales";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { locale } = await params;
  const supportedLocale = (locale === "en" ? "en" : "ar") as SupportedLocale;

  // Retrieve active session to determine user permissions
  const session = await getCurrentSession();
  const isAdmin = session?.role === "ADMIN";
  const userRole = session?.role || "GUEST";

  // Retrieve dynamic navigation items, dictionary, and social profiles concurrently
  const [headerItems, footerItems, dictionary, githubProfile, linkedinProfile] = await Promise.all([
    navigationService.getNavigationItems("header", userRole),
    navigationService.getNavigationItems("footer", userRole),
    localizedTextService.getDictionary(supportedLocale),
    socialService.getProfile("github", supportedLocale),
    socialService.getProfile("linkedin", supportedLocale),
  ]);

  return (
    <LocalizationProvider locale={supportedLocale} dictionary={dictionary}>
      <AdminEditProvider isAdmin={isAdmin}>
        <div className="bg-background text-foreground flex min-h-screen flex-col dark:bg-[#07101F] transition-colors duration-300">
          <Navbar
            locale={supportedLocale}
            items={headerItems}
            githubProfile={githubProfile}
            linkedinProfile={linkedinProfile}
            currentUser={
              session
                ? {
                    id: session.user.id,
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image,
                    role: session.role,
                  }
                : null
            }
          />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer
            locale={supportedLocale}
            items={footerItems}
            githubProfile={githubProfile}
            linkedinProfile={linkedinProfile}
          />
        </div>
        <AdminToolbar locale={supportedLocale} />
        <ContextualEditorDialog />
        <ChatDrawer />
      </AdminEditProvider>
    </LocalizationProvider>
  );
}
