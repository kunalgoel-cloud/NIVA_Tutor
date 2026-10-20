"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { Section, PBtn } from "@/components/parent/ui";
import { AGE_BANDS, AGE_BAND_INFO, type AgeBand } from "@/lib/curriculum/schema";

const INTERESTS = ["animals", "dinosaur", "fruit", "toys", "story", "shapes", "weather", "helpers"];

export default function ParentSetup() {
  const { createProfile, saveSettings, settings, data } = useApp();
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [band, setBand] = useState<AgeBand>("little-explorer");
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    await createProfile(nickname, band);
    if (interests.length) await saveSettings({ ...settings, interests });
    router.push("/parent");
  };
  const toggle = (i: string) => setInterests((x) => (x.includes(i) ? x.filter((y) => y !== i) : [...x, i]));

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold">Set up a child profile</h1>
      <form onSubmit={submit}>
        <Section title="Nickname" hint="Use a nickname, not a full name. It is shown on screen and kept only on this device.">
          <label className="flex max-w-sm flex-col gap-1 font-semibold" htmlFor="nick">Nickname
            <input id="nick" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={24} placeholder="e.g. Little Star" className="min-h-12 rounded-xl border-2 border-line px-3 text-lg" />
          </label>
        </Section>
        <Section title="Starting age band" hint="These are flexible content bands, not deadlines. You can change this any time in Settings.">
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">Age band</legend>
            {AGE_BANDS.map((b) => (
              <label key={b} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${band === b ? "border-ink bg-cream" : "border-line"}`}>
                <input type="radio" name="band" checked={band === b} onChange={() => setBand(b)} className="size-5" />
                <span><strong>{AGE_BAND_INFO[b].label}</strong> <span className="text-ink-soft">· ages {AGE_BAND_INFO[b].ages}</span>
                  {b !== "little-explorer" && <span className="block text-xs text-ink-soft">Library for this band is still being written; your child will mostly see Little Explorer activities.</span>}</span>
              </label>
            ))}
          </fieldset>
        </Section>
        <Section title="Interests (optional)" hint="Used only to gently prefer matching activities.">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
            {INTERESTS.map((i) => <button key={i} type="button" aria-pressed={interests.includes(i)} onClick={() => toggle(i)} className={`min-h-11 rounded-full border-2 px-4 font-semibold ${interests.includes(i) ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>{i}</button>)}
          </div>
        </Section>
        <div className="flex flex-wrap gap-3">
          <PBtn type="submit" tone="primary" disabled={busy}>Create profile</PBtn>
          {data.profiles.length === 0 && <PBtn onClick={async () => { await createProfile("Demo Explorer", "little-explorer", true); router.push("/parent"); }}>Use a demo profile instead</PBtn>}
        </div>
      </form>
    </>
  );
}
