import { redirect } from "next/navigation";

interface ChatPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const { locale } = await params;
  const search = await searchParams;
  const targetLocale = locale === "ar" ? "ar" : "en";

  const query = new URLSearchParams();
  query.set("chat", "open");

  if (search) {
    for (const [key, val] of Object.entries(search)) {
      if (key !== "chat" && typeof val === "string" && val.trim().length > 0) {
        query.set(key, val);
      }
    }
  }

  redirect(`/${targetLocale}?${query.toString()}`);
}
