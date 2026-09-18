interface AdminDashboardProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({ params }: AdminDashboardProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <div className="space-y-6">
      <header className="border-border border-b pb-4">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          {isArabic ? "مركز التحكم الإداري" : "Control Plane Overview"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isArabic
            ? "إدارة المحتوى، المشاريع، نماذج الذكاء الاصطناعي، ومراقبة النظام بشكل ديناميكي كامل."
            : "Manage content, projects, AI models, and system observability dynamically."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-border bg-card rounded-lg border p-5 shadow-xs">
          <div className="text-muted-foreground text-sm font-medium">
            {isArabic ? "نظام المصادقة (RBAC)" : "Access Control"}
          </div>
          <div className="text-foreground mt-2 text-2xl font-bold">ACTIVE</div>
          <p className="text-muted-foreground mt-1 text-xs">
            {isArabic ? "الحماية الإدارية مفعلة" : "Server authorization enforced"}
          </p>
        </div>

        <div className="border-border bg-card rounded-lg border p-5 shadow-xs">
          <div className="text-muted-foreground text-sm font-medium">
            {isArabic ? "حالة قاعدة البيانات" : "Authoritative Database"}
          </div>
          <div className="text-foreground mt-2 text-2xl font-bold">READY</div>
          <p className="text-muted-foreground mt-1 text-xs">
            {isArabic ? "50 جدولاً مفهرسًا" : "50 schema tables indexed"}
          </p>
        </div>

        <div className="border-border bg-card rounded-lg border p-5 shadow-xs">
          <div className="text-muted-foreground text-sm font-medium">
            {isArabic ? "اللغات النشطة" : "Active Locales"}
          </div>
          <div className="text-foreground mt-2 text-2xl font-bold">AR / EN</div>
          <p className="text-muted-foreground mt-1 text-xs">
            {isArabic ? "نظام RTL / LTR تلقائي" : "Automatic direction layout"}
          </p>
        </div>

        <div className="border-border bg-card rounded-lg border p-5 shadow-xs">
          <div className="text-muted-foreground text-sm font-medium">
            {isArabic ? "المساعد الذكي (RAG)" : "AI Pipeline"}
          </div>
          <div className="text-foreground mt-2 text-2xl font-bold">STANDBY</div>
          <p className="text-muted-foreground mt-1 text-xs">
            {isArabic ? "جاهز لربط النماذج" : "Provider registry ready"}
          </p>
        </div>
      </div>
    </div>
  );
}
