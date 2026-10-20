"use client";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Badge, PBtn, Section } from "@/components/parent/ui";

export default function AccountPage() {
  const { cloud, signIn, signUp, signOut, importLocalToCloud, data, storageError } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const field = "min-h-12 rounded-xl border-2 border-line px-3 text-lg";

  const submit = async (mode: "in" | "up") => {
    if (busy) return;
    setBusy(true); setMsg(null);
    const r = await (mode === "in" ? signIn : signUp)(email, password);
    setMsg({ ok: r.ok, text: r.message }); setBusy(false);
    if (r.ok) setPassword("");
  };

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold">Account &amp; cloud storage</h1>
      <Section title="Where progress is saved" id="mode">
        {!cloud.configured ? (
          <p>Cloud storage is <Badge tone="warn">not set up</Badge> in this copy of the app. Progress is saved only on this device. (A developer sets it up with <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>; see docs/deployment.md.)</p>
        ) : cloud.signedIn ? (
          <p>Saved in your <Badge tone="good">cloud account</Badge> ({cloud.email}). Your child&apos;s progress is available on any device where you sign in. It is protected so only your account can read it.</p>
        ) : (
          <p>Saved <Badge tone="info">on this device only</Badge>. Sign in below to keep progress in the cloud instead. Your child can keep playing either way; no sign-in is needed to play.</p>
        )}
        {storageError && <p role="alert" className="mt-2 font-semibold text-try">{storageError}</p>}
      </Section>

      {cloud.configured && !cloud.signedIn && (
        <Section title="Parent sign-in" id="signin" hint="This is for you, the parent. Your child never needs an account.">
          <form className="flex max-w-md flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void submit("in"); }}>
            <label className="flex flex-col gap-1 font-semibold" htmlFor="acct-email">Email
              <input id="acct-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} required /></label>
            <label className="flex flex-col gap-1 font-semibold" htmlFor="acct-pass">Password (at least 8 characters)
              <input id="acct-pass" type="password" autoComplete="current-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={field} required /></label>
            <div className="flex flex-wrap gap-3">
              <PBtn type="submit" tone="primary" disabled={busy}>Sign in</PBtn>
              <PBtn disabled={busy || !email || password.length < 8} onClick={() => void submit("up")}>Create account</PBtn>
            </div>
          </form>
          {msg && <p role="status" className={`mt-3 font-semibold ${msg.ok ? "text-good" : "text-try"}`}>{msg.text}</p>}
          <p className="mt-3 max-w-xl text-sm text-ink-soft">Your email and a password are used only to sign you in. Do not use your child&apos;s name. After you create an account you may need to confirm your email address before signing in.</p>
        </Section>
      )}

      {cloud.signedIn && (
        <>
          <Section title="Copy this device's progress to the cloud" id="import" hint="Optional and one-way. Real profiles and their history are copied; demo data is never copied. Do this once, or you will get duplicates.">
            <p className="mb-3 text-sm">This copies what is saved on <em>this device</em> into your cloud account. The device copy is not changed or deleted.</p>
            <PBtn onClick={async () => { setBusy(true); const r = await importLocalToCloud(); setMsg({ ok: r.ok, text: r.message }); setBusy(false); }} disabled={busy}>Copy device data to cloud</PBtn>
            {msg && <p role="status" className={`mt-3 font-semibold ${msg.ok ? "text-good" : "text-try"}`}>{msg.text}</p>}
          </Section>
          <Section title="Sign out" id="signout">
            <PBtn onClick={() => void signOut()}>Sign out of {cloud.email}</PBtn>
            <p className="mt-2 text-sm text-ink-soft">After signing out the app uses the on-device copy again. Cloud data is not deleted. Currently loaded: {data.profiles.length} profile(s).</p>
          </Section>
        </>
      )}
    </>
  );
}
