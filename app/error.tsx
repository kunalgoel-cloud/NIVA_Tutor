"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("App error:", error.message); }, [error]);
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div role="alert" className="flex max-w-md flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-clay">
        <p aria-hidden className="text-6xl">🛠️</p>
        <h1 className="text-3xl font-extrabold">Something went a little wrong</h1>
        <p className="text-lg text-ink-soft">Nothing was lost. A grown-up can try again.</p>
        <button type="button" onClick={reset} className="tap rounded-full bg-ink px-8 text-xl font-bold text-white">Try again</button>
      </div>
    </main>
  );
}
