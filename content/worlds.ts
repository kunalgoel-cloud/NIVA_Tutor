import type { WorldSlug } from "@/lib/curriculum/schema";

export type World = { slug: WorldSlug; name: string; tagline: string; emoji: string; characterId: string; hue: string; description: string };

// Navigation categories. An activity belongs to exactly one world AND exactly one domain.
export const WORLDS: World[] = [
  { slug: "number-kingdom", name: "Number Kingdom", tagline: "Count, compare and build!", emoji: "🔢", characterId: "dot", hue: "sun", description: "Counting, shapes, patterns and number fun with Dot the Dinosaur." },
  { slug: "conversation-cafe", name: "Conversation Café", tagline: "Chat, listen and play with words", emoji: "☕", characterId: "zed", hue: "coral", description: "Talk with friendly characters, hear stories and play with sounds." },
  { slug: "puzzle-planet", name: "Puzzle Planet", tagline: "Spot, match and solve", emoji: "🧩", characterId: "pip", hue: "grape", description: "Patterns, matching, memory and little puzzles with Pip the Rabbit." },
  { slug: "wonder-world", name: "Wonder World", tagline: "Discover how the world works", emoji: "🌍", characterId: "otto", hue: "leaf", description: "Animals, plants, weather and helpers with Otto the Owl." },
  { slug: "creativity-forest", name: "Creativity Forest", tagline: "Imagine, feel and invent", emoji: "🌳", characterId: "fern", hue: "rose", description: "Stories, feelings and imagination with Fern the Fox." },
];
export const worldBySlug = (s: string) => WORLDS.find((w) => w.slug === s);
