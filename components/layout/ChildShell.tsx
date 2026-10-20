"use client";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";

/** Frame for child-facing pages: big home button, sound toggle, a quiet grown-ups link. No external links. */
export function ChildShell({ children, world, title }: { children: React.ReactNode; world?: string; title?: string }) {
  const { settings, saveSettings, storageError } = useApp();
  const muted = settings.audio.muted;
  return (
    <div data-world={world} className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-8 pt-3 sm:px-8">
      <header className="flex items-center justify-between gap-3 py-2">
        <Link href="/worlds" aria-label="Home" className="tap flex items-center gap-2 rounded-full border-2 border-line bg-white px-5 text-2xl shadow-clay">
          <span aria-hidden>🏠</span><span className="hidden text-base font-bold sm:inline">Home</span>
        </Link>
        {title && <h1 className="truncate text-center text-xl font-extrabold sm:text-3xl">{title}</h1>}
        <div className="flex items-center gap-2">
          <button
            type="button" aria-pressed={muted} aria-label={muted ? "Sound is off. Turn sound on" : "Sound is on. Turn sound off"}
            onClick={() => saveSettings({ ...settings, audio: { ...settings.audio, muted: !muted } })}
            className="tap rounded-full border-2 border-line bg-white px-4 text-2xl shadow-clay"
          ><span aria-hidden>{muted ? "🔇" : "🔊"}</span></button>
          <Link href="/parent" aria-label="Grown-ups area" className="tap flex items-center rounded-full px-3 text-sm font-semibold text-ink-soft underline-offset-4 hover:underline">Grown-ups</Link>
        </div>
      </header>
      {storageError && (
        <p role="status" className="mb-3 rounded-2xl bg-sun/40 px-4 py-2 text-sm font-semibold">
          Progress can&apos;t be saved on this device right now, but you can keep playing. (A grown-up can check Settings.)
        </p>
      )}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
