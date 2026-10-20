"use client";
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "soft" | "ghost" | "plain";
type Props = {
  children: ReactNode; href?: string; onClick?: () => void; variant?: Variant; size?: "md" | "lg"; disabled?: boolean;
  label?: string; className?: string; type?: "button" | "submit"; pressed?: boolean; id?: string;
};

const base = "tap inline-flex items-center justify-center gap-2 rounded-full font-bold transition active:scale-95 select-none disabled:opacity-50 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  primary: "bg-[var(--w-deep)] text-white shadow-clay hover:brightness-110",
  soft: "bg-white text-ink border-2 border-line shadow-clay hover:bg-cream",
  ghost: "bg-transparent text-ink hover:bg-white/60 border-2 border-transparent",
  plain: "",
};
const sizes = { md: "px-6 py-3 text-lg", lg: "px-10 py-4 text-2xl min-h-20" };

export function BigButton({ children, href, onClick, variant = "primary", size = "md", disabled, label, className = "", type = "button", pressed, id }: Props) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (href && !disabled) return <Link href={href} className={cls} aria-label={label} id={id}>{children}</Link>;
  return <button id={id} type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={label} aria-pressed={pressed}>{children}</button>;
}
