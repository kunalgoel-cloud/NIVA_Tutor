"use client";
import { motion } from "motion/react";

export type TileState = "neutral" | "selected" | "tried" | "correct" | "dim" | "placed" | "glow";

/** A big, touch-friendly picture card. State is shown by badge/shape as well as colour. */
export function Tile({
  visual, label, alt, state = "neutral", onClick, disabled, shadow, size = "lg", shake, badge, id, className = "", textOnly,
}: {
  visual: string; label?: string; alt: string; textOnly?: boolean; state?: TileState; onClick?: () => void; disabled?: boolean;
  shadow?: boolean; size?: "md" | "lg"; shake?: boolean; badge?: string; id?: string; className?: string;
}) {
  const multi = [...visual].length > 3;
  const ring =
    state === "selected" ? "ring-4 ring-[var(--w-deep)] -translate-y-1" :
    state === "correct" ? "ring-4 ring-good bg-emerald-50" :
    state === "tried" ? "opacity-60 border-dashed" :
    state === "placed" ? "bg-emerald-50 border-good" :
    state === "glow" ? "ring-4 ring-[var(--w-deep)] bg-amber-50 anim-bob" : "";
  return (
    <motion.button
      id={id} type="button" onClick={onClick} disabled={disabled} aria-label={alt} aria-pressed={state === "selected"}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className={`tap relative flex flex-col items-center justify-center gap-1 rounded-card border-2 border-line bg-white shadow-clay transition ${size === "lg" ? "min-h-32 px-3 py-4" : "min-h-24 px-2 py-3"} ${ring} ${state === "dim" ? "opacity-40" : ""} ${shake ? "anim-shake" : ""} ${className} disabled:cursor-default`}
    >
      {textOnly ? (
        <span aria-hidden className="px-1 text-center text-2xl font-extrabold leading-snug">{alt}</span>
      ) : (
        <span aria-hidden className={`${multi ? "text-4xl" : size === "lg" ? "text-6xl" : "text-5xl"} leading-none`} style={shadow ? { filter: "brightness(0) opacity(.8)" } : undefined}>{visual}</span>
      )}
      {label && !textOnly && <span aria-hidden className="text-lg font-bold">{label}</span>}
      {state === "glow" && <span aria-hidden className="absolute -right-2 -top-2 grid size-9 place-items-center rounded-full bg-sun text-xl">✨</span>}
      {state === "correct" && <span aria-hidden className="absolute -right-2 -top-2 grid size-9 place-items-center rounded-full bg-good text-xl font-black text-white">✓</span>}
      {state === "placed" && <span aria-hidden className="absolute -right-2 -top-2 grid size-9 place-items-center rounded-full bg-good text-xl font-black text-white">{badge ?? "✓"}</span>}
      {state === "tried" && <span aria-hidden className="absolute -right-2 -top-2 grid size-9 place-items-center rounded-full bg-sun text-xl">🤔</span>}
    </motion.button>
  );
}
