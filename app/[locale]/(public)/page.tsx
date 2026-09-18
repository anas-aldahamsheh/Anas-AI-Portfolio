interface PublicPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PublicHomePage({ params }: PublicPageProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-12">
      <header className="w-full max-w-4xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {isArabic ? "منصة المحفظة الذكية" : "AI Portfolio Platform"}
        </h1>
        <p className="text-muted-foreground mt-4 text-base sm:text-lg">
          {isArabic
            ? "نظام ديناميكي متعدد اللغات للمشاريع والذكاء الاصطناعي"
            : "Production-ready modular bilingual portfolio & AI engineering platform"}
        </p>
      </header>
    </main>
  );
}
