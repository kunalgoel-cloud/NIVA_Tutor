"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useApp } from "@/components/AppProvider";
import { Badge, PBtn, Section } from "@/components/parent/ui";
import { AGE_BANDS, AGE_BAND_INFO, type AgeBand } from "@/lib/curriculum/schema";
import type { ParentSettings } from "@/lib/parent/settings";
import { hashPin, isValidPin } from "@/lib/parent/gate";
import { useScreenTime } from "@/components/ScreenTimeGuard";
import { detectSpeech } from "@/lib/speech/capabilities";

type Status = { ai: { configured: boolean; missing?: string[]; message?: string } } | null;
const INTERESTS = ["animals", "dinosaur", "fruit", "toys", "story", "shapes", "weather", "helpers"];
const box = "flex min-h-11 items-center gap-3 font-semibold";

export default function SettingsPage() {
  const { settings, saveSettings, profile, updateProfile, say, voices, resetGames, playedIds, visibleActivities } = useApp();
  const { status: screen, endBreak, resetTimer } = useScreenTime();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const speechKey = useSyncExternalStore(() => () => {}, () => { const d = detectSpeech(); return `${+d.synthesis}${+d.recognition}`; }, () => "");
  const speech = speechKey ? { synthesis: speechKey[0] === "1", recognition: speechKey[1] === "1" } : null;
  const [pin, setPin] = useState("");
  const [pinMsg, setPinMsg] = useState<string | null>(null);

  useEffect(() => { fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setStatus(null)); }, []);

  // Latest settings including a save still in flight, so two quick edits never overwrite each other.
  const latest = useRef(settings);
  useEffect(() => { latest.current = settings; }, [settings]);

  const update = async (next: ParentSettings) => { latest.current = next; await saveSettings(next); setSaved(true); setTimeout(() => setSaved(false), 1800); };

  return (
    <>
      <div className="mb-4 flex items-center gap-3"><h1 className="text-3xl font-extrabold">Settings</h1><span role="status" aria-live="polite" className="font-semibold text-good">{saved ? "✓ Saved" : ""}</span></div>

      {profile && (
        <Section title="Child profile" id="profile" hint="Use a nickname, never a full name.">
          <NicknameField key={`${profile.id}:${profile.nickname}`} initial={profile.nickname} onCommit={(n) => void updateProfile(profile.id, { nickname: n })} />
          <fieldset className="grid gap-2 sm:grid-cols-2"><legend className="mb-1 font-semibold">Age band (flexible, not a deadline)</legend>
            {AGE_BANDS.map((b) => (
              <label key={b} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${profile.ageBand === b ? "border-ink bg-cream" : "border-line"}`}>
                <input type="radio" name="band" className="size-5" checked={profile.ageBand === b} onChange={() => void updateProfile(profile.id, { ageBand: b as AgeBand })} />
                <span><strong>{AGE_BAND_INFO[b].label}</strong> · ages {AGE_BAND_INFO[b].ages}</span>
              </label>
            ))}
          </fieldset>
          <p className="mt-2 text-sm text-ink-soft">Activities are chosen from this band and earlier ones. Only Little Explorer (3–4) activities are published so far.</p>
        </Section>
      )}

      <Section title="Session preferences" id="session" hint="Suggestions only. Your child is never locked out or timed.">
        <label className="mb-3 flex max-w-xs flex-col gap-1 font-semibold">Activities in Today&apos;s Adventure
          <select value={settings.session.adventureLength} onChange={(e) => void update({ ...settings, session: { ...settings.session, adventureLength: Number(e.target.value) } })} className="min-h-11 rounded-lg border-2 border-line bg-white px-2">{[2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <label className={box}><input type="checkbox" className="size-5" checked={settings.session.showDurations} onChange={(e) => void update({ ...settings, session: { ...settings.session, showDurations: e.target.checked } })} /> Show &ldquo;about 3 min&rdquo; on activity cards</label>
        <label className="mt-2 flex max-w-xs flex-col gap-1 font-semibold">Gentle break reminder
          <select value={settings.session.gentleBreakReminderMinutes ?? ""} onChange={(e) => void update({ ...settings, session: { ...settings.session, gentleBreakReminderMinutes: e.target.value ? Number(e.target.value) : null } })} className="min-h-11 rounded-lg border-2 border-line bg-white px-2">
            <option value="">Off</option>{[10, 15, 20, 30].map((n) => <option key={n} value={n}>After {n} minutes of one game</option>)}</select></label>
      </Section>

      <Section title="Games" id="games" hint="Keep every game fresh: a finished game is not offered again until you reset.">
        <label className={box}><input type="checkbox" className="size-5" checked={settings.session.neverRepeat} onChange={(e) => void update({ ...settings, session: { ...settings.session, neverRepeat: e.target.checked } })} /> Don&apos;t repeat games (finished games disappear until reset)</label>
        {profile ? (
          <div className="mt-2 flex flex-col items-start gap-2">
            <p className="text-sm text-ink-soft">{profile.nickname} has finished {playedIds.size} of {visibleActivities.length} games. Resetting makes every game new again. Progress, history and the learning picture are kept.</p>
            {!confirmReset ? (
              <PBtn onClick={() => { setConfirmReset(true); setResetDone(false); }}>🔄 Reset all games</PBtn>
            ) : (
              <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Confirm reset">
                <span className="font-semibold">Make all games new again for {profile.nickname}?</span>
                <PBtn tone="primary" onClick={async () => { await resetGames(); setConfirmReset(false); setResetDone(true); }}>Yes, reset all games</PBtn>
                <PBtn onClick={() => setConfirmReset(false)}>Cancel</PBtn>
              </div>
            )}
            <p role="status" aria-live="polite" className="font-semibold text-good">{resetDone ? "✓ All games are new again." : ""}</p>
          </div>
        ) : <p className="mt-2 text-sm text-ink-soft">Choose a child profile first.</p>}
      </Section>

      <Section title="Screen time" id="screen-time" hint="After the play time is used up, the app rests for a few hours. The count is kept on this device and only runs while a child screen is open.">
        {(() => {
          const st = settings.session.screenTime;
          const setSt = (patch: Partial<typeof st>) => { const cur = latest.current; void update({ ...cur, session: { ...cur.session, screenTime: { ...cur.session.screenTime, ...patch } } }); };
          return (
            <>
              <label className={box}><input type="checkbox" className="size-5" checked={st.enabled} onChange={(e) => setSt({ enabled: e.target.checked })} /> Limit play time</label>
              <div className="my-2 flex flex-wrap gap-4">
                <label className="flex flex-col gap-1 font-semibold" htmlFor="play-min">Play time before resting
                  <select id="play-min" disabled={!st.enabled} value={st.playMinutes} onChange={(e) => setSt({ playMinutes: Number(e.target.value) })} className="min-h-11 rounded-lg border-2 border-line bg-white px-2 disabled:opacity-50">
                    {[10, 15, 20, 30, 45, 60, 90].map((n) => <option key={n} value={n}>{n} minutes</option>)}</select></label>
                <label className="flex flex-col gap-1 font-semibold" htmlFor="lock-hrs">Then the app rests for
                  <select id="lock-hrs" disabled={!st.enabled} value={st.lockHours} onChange={(e) => setSt({ lockHours: Number(e.target.value) })} className="min-h-11 rounded-lg border-2 border-line bg-white px-2 disabled:opacity-50">
                    {[1, 2, 3, 4, 6, 8, 12].map((n) => <option key={n} value={n}>{n} {n === 1 ? "hour" : "hours"}</option>)}</select></label>
              </div>
              {st.enabled && (
                <div className="flex flex-col items-start gap-2">
                  <p data-testid="screen-status" role="status" className="font-semibold">
                    {screen.locked && screen.lockedUntil
                      ? `🌙 Resting until ${new Date(screen.lockedUntil).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`
                      : `⏱ Played ${Math.floor(screen.usedSeconds / 60)} of ${st.playMinutes} minutes in this round.`}
                  </p>
                  {screen.locked ? <PBtn onClick={endBreak}>End the rest now</PBtn> : <PBtn onClick={resetTimer}>Restart the play timer</PBtn>}
                </div>
              )}
              <p className="mt-2 text-sm text-ink-soft">This is a gentle family boundary, not a lock that cannot be bypassed: it lives on this device and a grown-up can end the rest any time. Playing in another browser or device has its own timer.</p>
            </>
          );
        })()}
      </Section>

      <Section title="Audio" id="audio">
        <label className={box}><input type="checkbox" className="size-5" checked={!settings.audio.muted} onChange={(e) => void update({ ...settings, audio: { ...settings.audio, muted: !e.target.checked } })} /> Sound on</label>
        <label className={box}><input type="checkbox" className="size-5" checked={settings.audio.speakInstructions} onChange={(e) => void update({ ...settings, audio: { ...settings.audio, speakInstructions: e.target.checked } })} /> Read instructions and replies aloud</label>
        <label className={box}><input type="checkbox" className="size-5" checked={settings.audio.soundEffects} onChange={(e) => void update({ ...settings, audio: { ...settings.audio, soundEffects: e.target.checked } })} /> Gentle sound effects</label>
        <label className="my-2 flex max-w-xs flex-col gap-1 font-semibold" htmlFor="vol">Volume
          <input id="vol" type="range" min={0} max={1} step={0.1} value={settings.audio.volume} onChange={(e) => void update({ ...settings, audio: { ...settings.audio, volume: Number(e.target.value) } })} className="h-11" /></label>
        <label className="my-2 flex max-w-md flex-col gap-1 font-semibold" htmlFor="voice">Voice
          <select id="voice" value={settings.audio.voiceName ?? ""} onChange={(e) => void update({ ...settings, audio: { ...settings.audio, voiceName: e.target.value || null } })} className="min-h-11 rounded-lg border-2 border-line bg-white px-2">
            <option value="">Automatic: friendliest voice on this device</option>
            {voices().map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang}{v.local ? "" : ", online"})</option>)}
          </select>
          <span className="text-sm font-normal text-ink-soft">Voices come from your device or browser. Newer iPads and Macs have softer ones (look for Samantha, Karen or Siri, and under Settings → Accessibility → Spoken Content → Voices you can download Enhanced versions). Voices marked “online” may send the spoken text to the browser maker.</span></label>
        <PBtn onClick={() => void say("Hello! This is how I sound.")}>🔈 Test the voice</PBtn>
        <p className="mt-2 text-sm text-ink-soft">Voice support on this browser: {speech === null ? "checking…" : speech.synthesis ? "available" : "not available (games still work silently, with on-screen text)"}.</p>
      </Section>

      <Section title="Microphone (speech input)" id="mic" hint="Off by default. Audio is never recorded or stored by this app.">
        <label className={box}><input type="checkbox" className="size-5" checked={settings.speech.microphoneEnabled} onChange={(e) => void update({ ...settings, speech: { microphoneEnabled: e.target.checked } })} /> Let my child talk to characters using the microphone</label>
        <p className="text-sm">Speech recognition on this browser: {speech === null ? "checking…" : speech.recognition ? <Badge tone="good">available</Badge> : <Badge tone="warn">not available. Tap-to-answer is used instead</Badge>}</p>
        <p className="mt-2 text-sm text-ink-soft">Privacy note: browser speech recognition may send audio to the browser maker (for example Apple or Google) to be turned into text. If you are unsure, leave this off; every activity works with taps. Transcripts are used for the current reply only and are never saved.</p>
      </Section>

      <Section title="AI conversation" id="ai" hint="Optional. Every game works without it. Conversation games use a built-in responder when AI is off.">
        <label className={box}><input type="checkbox" className="size-5" checked={settings.ai.enabled} onChange={(e) => void update({ ...settings, ai: { ...settings.ai, enabled: e.target.checked } })} /> Allow AI-powered replies in conversation games</label>
        <p className="mb-2 text-sm" data-testid="ai-status">Server status: {status === null ? "checking…" : status.ai.configured ? <Badge tone="good">AI provider configured</Badge> : <Badge tone="warn">not configured</Badge>}</p>
        {status && !status.ai.configured && (
          <div role="note" className="mb-3 rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 p-3 text-sm">
            <p className="font-bold">AI chat is not set up yet. This is fine, nothing is broken.</p>
            <p>To turn it on, a developer or you (with help) must add these private settings on the server: {(status.ai.missing ?? []).join(", ") || "see .env.example"}. See <code>docs/deployment.md</code>. Until then the built-in conversation is used.</p>
          </div>
        )}
        <label className="flex max-w-xs flex-col gap-1 font-semibold">AI replies allowed per day
          <input type="number" min={0} max={500} value={settings.ai.dailyReplyLimit} onChange={(e) => void update({ ...settings, ai: { ...settings.ai, dailyReplyLimit: Math.max(0, Math.min(500, Number(e.target.value) || 0)) } })} className="min-h-11 rounded-lg border-2 border-line px-2" /></label>
        <p className="mt-2 text-sm text-ink-soft">What is sent to the AI provider: only the child&apos;s current short message (with phone numbers, emails and links removed), the last few turns of this one conversation, the activity id and the age band. Never the nickname, history or progress.</p>
      </Section>

      <Section title="Interests" id="interests" hint="Optional. Slightly prefers activities with these themes.">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
          {INTERESTS.map((i) => { const on = settings.interests.includes(i); return <button key={i} type="button" aria-pressed={on} onClick={() => void update({ ...settings, interests: on ? settings.interests.filter((x) => x !== i) : [...settings.interests, i] })} className={`min-h-11 rounded-full border-2 px-4 font-semibold ${on ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>{i}</button>; })}
        </div>
      </Section>

      <Section title="Privacy & grown-up PIN" id="privacy">
        <label className="mb-4 flex max-w-xs flex-col gap-1 font-semibold">Keep play history for
          <select value={settings.privacy.retentionDays} onChange={(e) => void update({ ...settings, privacy: { retentionDays: Number(e.target.value) } })} className="min-h-11 rounded-lg border-2 border-line bg-white px-2">
            {[[90, "3 months"], [365, "1 year"], [730, "2 years"], [1825, "5 years"]].map(([d, l]) => <option key={d} value={d}>{l}</option>)}</select></label>
        <form className="flex flex-wrap items-end gap-3" onSubmit={async (e) => { e.preventDefault(); if (!isValidPin(pin)) { setPinMsg("Use 4 to 8 digits."); return; } await update({ ...settings, parentPin: await hashPin(pin) }); setPin(""); setPinMsg("PIN saved."); }}>
          <label className="flex flex-col gap-1 font-semibold" htmlFor="pin">{settings.parentPin ? "Change grown-up PIN" : "Set a grown-up PIN (optional)"}
            <input id="pin" type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value)} className="min-h-11 w-48 rounded-lg border-2 border-line px-2" /></label>
          <PBtn type="submit" tone="primary">Save PIN</PBtn>
          {settings.parentPin && <PBtn onClick={async () => { await update({ ...settings, parentPin: null }); setPinMsg("PIN removed."); }}>Remove PIN</PBtn>}
        </form>
        {pinMsg && <p role="status" className="mt-2 font-semibold">{pinMsg}</p>}
        <p className="mt-3 text-sm text-ink-soft">The PIN stops a small child entering this area. It is stored only as a salted hash on this device and is <strong>not</strong> a security lock on your data. If you forget it, clear this site&apos;s data in the browser (which also erases local progress).</p>
      </Section>
    </>
  );
}

function NicknameField({ initial, onCommit }: { initial: string; onCommit: (n: string) => void }) {
  const [nick, setNick] = useState(initial);
  return (
    <label className="mb-3 flex max-w-sm flex-col gap-1 font-semibold" htmlFor="nick">Nickname
      <input id="nick" value={nick} maxLength={24} onChange={(e) => setNick(e.target.value)} onBlur={() => nick.trim() && nick !== initial && onCommit(nick)} className="min-h-12 rounded-xl border-2 border-line px-3 text-lg" />
    </label>
  );
}
