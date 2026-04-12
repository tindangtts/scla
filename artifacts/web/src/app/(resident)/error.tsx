"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-sm w-full rounded-2xl bg-card border border-card-border p-6 shadow-sm text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest ? (
            <p className="text-[11px] text-muted-foreground/70 mt-2 font-mono">
              Ref: {error.digest}
            </p>
          ) : null}
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>
  );
}
