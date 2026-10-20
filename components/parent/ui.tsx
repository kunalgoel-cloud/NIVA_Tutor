import type { ReactNode } from "react";

export const Section = ({ title, children, id, hint }: { title: string; children: ReactNode; id?: string; hint?: string }) => (
  <section id={id} aria-labelledby={`${id ?? title}-h`} className="mb-6 rounded-2xl border-2 border-line bg-white p-5 shadow-sm">
    <h2 id={`${id ?? title}-h`} className="text-xl font-extrabold">{title}</h2>
    {hint && <p className="mb-3 text-sm text-ink-soft">{hint}</p>}
    <div className="mt-3">{children}</div>
  </section>
);

export const Stat = ({ label, value, note }: { label: string; value: ReactNode; note?: string }) => (
  <div className="rounded-xl bg-cream p-4"><p className="text-sm font-semibold text-ink-soft">{label}</p><p className="text-3xl font-extrabold">{value}</p>{note && <p className="text-xs text-ink-soft">{note}</p>}</div>
);

export const Badge = ({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "info" }) => {
  const t = { neutral: "bg-slate-100 text-ink", good: "bg-emerald-100 text-emerald-900", warn: "bg-amber-100 text-amber-900", info: "bg-violet-100 text-violet-900" }[tone];
  return <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-bold ${t}`}>{children}</span>;
};

export const PBtn = ({ children, onClick, disabled, tone = "default", type = "button", label }: { children: ReactNode; onClick?: () => void; disabled?: boolean; tone?: "default" | "primary" | "danger"; type?: "button" | "submit"; label?: string }) => {
  const t = { default: "border-line bg-white hover:bg-cream", primary: "border-ink bg-ink text-white hover:brightness-125", danger: "border-red-700 bg-red-700 text-white hover:brightness-110" }[tone];
  return <button type={type} onClick={onClick} disabled={disabled} aria-label={label} className={`min-h-11 rounded-full border-2 px-5 font-bold disabled:opacity-50 ${t}`}>{children}</button>;
};
