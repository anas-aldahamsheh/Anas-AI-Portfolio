"use client";

import { useEffect } from "react";
import { logger } from "@/lib/observability/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logger.error("unhandled_client_error", {
      errorCode: error.digest ?? "UNKNOWN_DIGEST",
      metadata: { message: error.message },
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="border-destructive/20 bg-destructive/5 max-w-md rounded-lg border p-8">
        <h2 className="text-destructive mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          An unexpected error occurred while processing your request.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
