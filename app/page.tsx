"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { Character } from "@/components/characters/Character";
import { BigButton } from "@/components/ui/Button";
import { CHARACTERS } from "@/content/characters";
import { AGE_BAND_INFO } from "@/lib/curriculum/schema";

export default function WelcomePage() {
  const { ready, data, setActiveProfile, createProfile, storageError } = useApp();
  const router = useRouter();

  const play = async (id: string) => { await setActiveProfile(id); router.push("/worlds"); };
  const startDemo = async () => { await createProfile("Demo Explorer", "little-explorer", true); router.push("/worlds"); };

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center gap-8 px-4 py-10 text-center">
      <div className="flex flex-wrap items-end justify-center gap-2" aria-hidden>
        {CHARACTERS.map((c, i) => <Character key={c.id} species={c.species} size={i === 2 ? 130 : 100} mood="cheer" />)}
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">Little Wonder World</h1>
      <p className="max-w-xl text-xl font-semibold text-ink-soft">Count, chat, puzzle, explore and imagine!</p>

      {!ready ? (
        <p role="status" className="text-xl font-bold text-ink-soft">Getting ready… ✨</p>
      ) : data.profiles.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <BigButton size="lg" id="start-demo" onClick={startDemo}>▶ Let&apos;s play!</BigButton>
          <p className="max-w-md rounded-2xl bg-white/80 px-4 py-3 text-base font-semibold">
            This starts with a <strong>demo explorer</strong> (fictional, saved only on this device). Grown-ups can set up a profile for their child first in the{" "}
            <Link href="/parent/setup" className="underline">Grown-ups area</Link>.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4" role="group" aria-label="Who is playing?">
          <p className="text-2xl font-bold">Who is playing?</p>
          <div className="flex flex-wrap justify-center gap-4">
            {data.profiles.map((p) => (
              <button key={p.id} type="button" onClick={() => play(p.id)} className="tap flex min-w-48 flex-col items-center gap-1 rounded-card border-2 border-line bg-white px-8 py-6 shadow-clay active:scale-95">
                <span aria-hidden className="text-5xl">{p.isDemo ? "🧪" : "🧒"}</span>
                <span className="text-2xl font-extrabold">{p.nickname}</span>
                <span className="text-sm font-semibold text-ink-soft">{p.isDemo ? "Demo (fictional)" : AGE_BAND_INFO[p.ageBand].label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {storageError && <p role="status" className="rounded-2xl bg-sun/40 px-4 py-2 text-sm font-semibold">Saving isn&apos;t available in this browser, so progress won&apos;t be kept. Playing still works.</p>}
      <Link href="/parent" className="tap flex items-center text-sm font-semibold text-ink-soft underline underline-offset-4">Grown-ups</Link>
    </main>
  );
}
