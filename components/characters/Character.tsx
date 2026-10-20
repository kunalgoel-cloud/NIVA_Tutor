"use client";
import type { CharacterSpec } from "@/content/characters";

type Props = { species: CharacterSpec["species"]; size?: number; mood?: "happy" | "cheer" | "think"; speaking?: boolean; label?: string; className?: string };

const Eyes = ({ y = 62, gap = 17, r = 6 }: { y?: number; gap?: number; r?: number }) => (
  <g className="anim-blink">
    <circle cx={60 - gap} cy={y} r={r} fill="#26244a" /><circle cx={60 + gap} cy={y} r={r} fill="#26244a" />
    <circle cx={60 - gap + 2} cy={y - 2} r={2} fill="#fff" /><circle cx={60 + gap + 2} cy={y - 2} r={2} fill="#fff" />
  </g>
);
const Cheeks = ({ y = 74, gap = 28 }: { y?: number; gap?: number }) => (
  <g opacity=".55"><circle cx={60 - gap} cy={y} r={6} fill="#ff8fa3" /><circle cx={60 + gap} cy={y} r={6} fill="#ff8fa3" /></g>
);
const Mouth = ({ y = 78, mood }: { y?: number; mood: Props["mood"] }) =>
  mood === "think" ? <path d={`M52 ${y} q8 3 16 0`} stroke="#26244a" strokeWidth="3" fill="none" strokeLinecap="round" />
  : mood === "cheer" ? <path d={`M48 ${y - 2} q12 18 24 0 z`} fill="#c2415d" stroke="#26244a" strokeWidth="2.5" strokeLinejoin="round" />
  : <path d={`M50 ${y} q10 10 20 0`} stroke="#26244a" strokeWidth="3" fill="none" strokeLinecap="round" />;

export function Character({ species, size = 140, mood = "happy", speaking = false, label, className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={label ?? `${species} character`} className={`${speaking ? "anim-bob" : ""} ${className}`}>
      {species === "rabbit" && (<>
        <ellipse cx="42" cy="26" rx="10" ry="26" fill="#f4eefc" stroke="#d8cdf0" strokeWidth="2" /><ellipse cx="42" cy="28" rx="5" ry="18" fill="#ffc2d4" />
        <ellipse cx="78" cy="26" rx="10" ry="26" fill="#f4eefc" stroke="#d8cdf0" strokeWidth="2" /><ellipse cx="78" cy="28" rx="5" ry="18" fill="#ffc2d4" />
        <circle cx="60" cy="70" r="40" fill="#f4eefc" stroke="#d8cdf0" strokeWidth="2" /><ellipse cx="60" cy="70" rx="6" ry="4" fill="#ff8fa3" transform="translate(0 2)" />
        <Eyes y={62} /><Cheeks /><Mouth y={80} mood={mood} />
      </>)}
      {species === "dino" && (<>
        <path d="M30 40 l8 -14 l8 14 M50 32 l8 -16 l8 16 M70 34 l8 -14 l8 14" fill="#2f9e6a" />
        <circle cx="60" cy="68" r="42" fill="#5fd39a" stroke="#2f9e6a" strokeWidth="2" />
        <ellipse cx="60" cy="86" rx="26" ry="16" fill="#b8f0d2" /><circle cx="52" cy="84" r="2.5" fill="#2f9e6a" /><circle cx="68" cy="84" r="2.5" fill="#2f9e6a" />
        <Eyes y={58} /><Cheeks y={72} gap={32} />{mood === "cheer" ? <Mouth y={92} mood="cheer" /> : <path d="M48 94 q12 8 24 0" stroke="#26244a" strokeWidth="3" fill="none" strokeLinecap="round" />}
      </>)}
      {species === "alien" && (<>
        <path d="M44 28 q-8 -14 -16 -14 M76 28 q8 -14 16 -14" stroke="#1a8f86" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="28" cy="14" r="5" fill="#ffc83d" /><circle cx="92" cy="14" r="5" fill="#ffc83d" />
        <ellipse cx="60" cy="68" rx="44" ry="42" fill="#6ee0d3" stroke="#1a8f86" strokeWidth="2" />
        <ellipse cx="42" cy="62" rx="12" ry="16" fill="#fff" /><ellipse cx="78" cy="62" rx="12" ry="16" fill="#fff" />
        <circle cx="44" cy="64" r="7" fill="#26244a" /><circle cx="76" cy="64" r="7" fill="#26244a" /><circle cx="46" cy="61" r="2.5" fill="#fff" /><circle cx="78" cy="61" r="2.5" fill="#fff" />
        <Cheeks y={84} gap={30} /><Mouth y={90} mood={mood} />
      </>)}
      {species === "owl" && (<>
        <path d="M24 38 l10 -14 l10 14 M76 38 l10 -14 l10 14" fill="#a06a3b" />
        <ellipse cx="60" cy="70" rx="42" ry="44" fill="#c58a52" stroke="#a06a3b" strokeWidth="2" />
        <ellipse cx="60" cy="86" rx="22" ry="22" fill="#f4dbb8" />
        <circle cx="42" cy="58" r="16" fill="#fff" stroke="#a06a3b" strokeWidth="2" /><circle cx="78" cy="58" r="16" fill="#fff" stroke="#a06a3b" strokeWidth="2" />
        <circle cx="42" cy="58" r="7" fill="#26244a" className="anim-blink" /><circle cx="78" cy="58" r="7" fill="#26244a" className="anim-blink" />
        <circle cx="44" cy="56" r="2.2" fill="#fff" /><circle cx="80" cy="56" r="2.2" fill="#fff" />
        <path d="M54 70 l6 10 l6 -10 z" fill="#ff9f1c" stroke="#d9780b" strokeWidth="1.5" strokeLinejoin="round" />
      </>)}
      {species === "fox" && (<>
        <path d="M22 50 l6 -34 l26 20 z M98 50 l-6 -34 l-26 20 z" fill="#f08a3c" stroke="#c9631a" strokeWidth="2" strokeLinejoin="round" />
        <path d="M30 40 l2 -14 l12 10 z M90 40 l-2 -14 l-12 10 z" fill="#3b2a2a" opacity=".7" />
        <path d="M60 106 C20 104 12 66 24 50 C40 36 80 36 96 50 C108 66 100 104 60 106 z" fill="#f08a3c" stroke="#c9631a" strokeWidth="2" />
        <path d="M60 106 C36 104 34 80 44 72 C54 66 66 66 76 72 C86 80 84 104 60 106 z" fill="#fff6ea" />
        <Eyes y={64} gap={20} /><ellipse cx="60" cy="78" rx="6" ry="4.5" fill="#26244a" />
        {mood === "cheer" ? <path d="M52 88 q8 10 16 0 z" fill="#c2415d" stroke="#26244a" strokeWidth="2" /> : <path d="M52 86 q8 7 16 0" stroke="#26244a" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      </>)}
    </svg>
  );
}
