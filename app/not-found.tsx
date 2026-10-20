import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl bg-white p-8 shadow-clay">
        <p aria-hidden className="text-6xl">🧭</p>
        <h1 className="text-3xl font-extrabold">We took a wrong turn!</h1>
        <p className="text-lg text-ink-soft">That page doesn&apos;t exist.</p>
        <Link href="/" className="tap inline-flex items-center rounded-full bg-ink px-8 text-xl font-bold text-white">Go home</Link>
      </div>
    </main>
  );
}
