interface QuoteBlockProps {
  content: Record<string, unknown>;
}

export function QuoteBlock({ content }: QuoteBlockProps) {
  const quote = (content["quote"] as string) || "";
  const author = (content["author"] as string) || "";
  const role = content["role"] as string | undefined;
  const source = content["source"] as string | undefined;

  return (
    <blockquote className="border-s-4 border-neutral-300 py-1 ps-4 text-neutral-700 italic dark:border-neutral-700 dark:text-neutral-300">
      <p className="text-base sm:text-lg">&ldquo;{quote}&rdquo;</p>
      {(author || role) && (
        <footer className="mt-2 text-xs text-neutral-500 not-italic sm:text-sm dark:text-neutral-400">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{author}</span>
          {role && <span> — {role}</span>}
          {source && <span> ({source})</span>}
        </footer>
      )}
    </blockquote>
  );
}
