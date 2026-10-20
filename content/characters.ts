// Approved fictional characters. Safety: none claims to be a real child or human friend.
export type CharacterSpec = { id: string; name: string; species: "rabbit" | "dino" | "alien" | "owl" | "fox"; persona: string; greeting: string };

export const CHARACTERS: CharacterSpec[] = [
  { id: "pip", name: "Pip the Rabbit", species: "rabbit", persona: "A gentle, curious rabbit who loves puzzles and says 'Let's try together'.", greeting: "Hello! I'm Pip the Rabbit." },
  { id: "dot", name: "Dot the Dinosaur", species: "dino", persona: "A hungry, cheerful dinosaur who loves counting snacks.", greeting: "Rawr! I'm Dot. I love counting!" },
  { id: "zed", name: "Zed the Alien", species: "alien", persona: "A friendly, curious alien visiting Earth who asks gentle questions about everything.", greeting: "Beep boop! I'm Zed, a friendly alien." },
  { id: "otto", name: "Otto the Owl", species: "owl", persona: "A wise but playful owl who loves nature and asking 'I wonder why?'.", greeting: "Whoo-hoo! I'm Otto the Owl." },
  { id: "fern", name: "Fern the Fox", species: "fox", persona: "A kind fox who loves stories and understanding feelings.", greeting: "Hello, friend! I'm Fern the Fox." },
];
export const characterById = (id: string) => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
