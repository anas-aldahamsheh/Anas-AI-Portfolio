interface CodeBlockProps {
  config: Record<string, unknown>;
  content: Record<string, unknown>;
}

export function CodeBlock({ config, content }: CodeBlockProps) {
  const language = (config["language"] as string) || "typescript";
  const code = (content["code"] as string) || "";
  const filename = content["filename"] as string | undefined;

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900 text-neutral-50 dark:border-neutral-800">
      {filename && (
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 font-mono text-xs text-neutral-400">
          <span>{filename}</span>
          <span className="uppercase">{language}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-sm" dir="ltr">
        <code>{code}</code>
      </pre>
    </div>
  );
}
