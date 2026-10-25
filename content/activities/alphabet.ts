// Alphabet, letter sounds and early word building for ages 3 to 7, in four levels.
// Letters are shown as letters (they are what is being learned); the pictures are real things, never symbols for ideas.
import { activity, ORD, PAIRS, PAT, T } from "../builders";

const L = { world: "conversation-cafe", domain: "early-literacy", character: "otto" } as const;

const SHAPE: Record<string, string> = {
  A: "A looks like a little tent: two slanted lines with a bar across.", B: "B has a tall straight line and two round bumps.",
  C: "C is round and open, like a mouth saying ah.", D: "D has a tall straight line and one big round bump.",
  E: "E has a tall line with three short lines pointing right.", F: "F has a tall line with two short lines. It has no bottom line.",
  G: "G is round like a C, with a little shelf inside.", H: "H looks like a ladder: two tall lines with a bar between them.",
  I: "I is one tall straight line.", J: "J is a tall line with a hook at the bottom.",
  K: "K has a tall line and two arms.", L: "L has a tall line and one foot pointing right.",
  M: "M has two tall lines joined by two peaks, like mountains.", N: "N is like a gate: two tall lines with a slanted line between.",
  O: "O is a round circle.", P: "P has a tall line and one round bump at the top.",
  Q: "Q is a circle with a little tail.", R: "R is like P, with a leg kicking out.",
  S: "S is a curvy snake.", T: "T has a tall line with a flat hat on top.",
  U: "U is a cup that is open at the top.", V: "V is a pointy valley.",
  W: "W is like two Vs side by side.", X: "X is two lines that cross.",
  Y: "Y has two arms and a tall body.", Z: "Z has a line on top, a slanted line, and a line at the bottom.",
};
// How each letter sounds at the start of a word (written so a text-to-speech voice can say it).
const SOUND: Record<string, string> = {
  A: "a, as in apple", B: "buh", C: "kuh", D: "duh", E: "eh, as in egg", F: "fff", G: "guh", H: "huh", J: "juh", K: "kuh", L: "lll", M: "mmm",
  N: "nnn", O: "o, as in orange", P: "puh", Q: "kwuh", R: "rrr", S: "sss", T: "tuh", U: "uh, as in umbrella", V: "vvv", W: "wuh", Y: "yuh", Z: "zzz",
};
// One clear picture per letter sound. I and X are left out because their sounds are easy to confuse in a picture.
const PIC: Record<string, [string, string]> = {
  A: ["🍎", "apple"], B: ["⚽", "ball"], C: ["🐱", "cat"], D: ["🐶", "dog"], E: ["🥚", "egg"], F: ["🐟", "fish"], G: ["🍇", "grapes"], H: ["🐴", "horse"],
  J: ["🧃", "juice"], K: ["🪁", "kite"], L: ["🦁", "lion"], M: ["🌙", "moon"], N: ["🥜", "nut"], O: ["🍊", "orange"], P: ["🐷", "pig"], Q: ["👸", "queen"],
  R: ["🐰", "rabbit"], S: ["☀️", "sun"], T: ["🐯", "tiger"], U: ["☂️", "umbrella"], V: ["🚐", "van"], W: ["⌚", "watch"], Y: ["🪀", "yo-yo"], Z: ["🦓", "zebra"],
};

// Letters that look alike are never offered together to the youngest children.
const LOOKALIKES = ["BDPR", "MNWH", "OQCG", "EF", "ILTJ", "UVY", "KXZ"];
const POOL = "AMSOTLKEBZUHJ".split("");
const others = (ch: string): string[] => {
  const bad = LOOKALIKES.find((g) => g.includes(ch)) ?? "";
  const ok = POOL.filter((x) => x !== ch && !bad.includes(x));
  const start = ch.charCodeAt(0) % ok.length;
  return [ok[start % ok.length], ok[(start + 3) % ok.length]];
};
const lt = (ch: string) => `${ch}|the letter ${ch}`;

const findLetter = (rid: string, ch: string) => T(rid, `Find the letter ${ch}.`, [lt(ch), ...others(ch).map(lt)], [0], { hints: [SHAPE[ch], `It is called ${ch}. ${SHAPE[ch]}`] });
const findLetters = (letters: string, prefix = "r") => [...letters].map((ch, i) => findLetter(`${prefix}${i + 1}`, ch));

const startsWith = (rid: string, ch: string, distractors: [string, string]) => {
  const [e, w] = PIC[ch];
  const opts = [`${e}|${w}`, ...distractors.map((d) => `${PIC[d][0]}|${PIC[d][1]}`)];
  return T(rid, `Which picture starts with the letter ${ch}?`, opts, [0], { display: ch, hints: [`Say the word ${w} slowly. What sound do you hear first? ${SOUND[ch]}.`, `${ch} says ${SOUND[ch]}. Which picture starts like that?`] });
};

export const ALPHABET_ACTIVITIES = [
  // ---------------- Little Explorer: know the letters ----------------
  ...(["ABCDEF", "GHJKLM", "NOPQRS", "TUVWXY"] as const).map((g) =>
    activity({ ...L, id: `find-the-letters-${g[0].toLowerCase()}-to-${g.at(-1)!.toLowerCase()}`, title: `Find the Letters ${g[0]} to ${g.at(-1)}`, description: `Find and name the letters ${[...g].join(", ")}.`, obj: ["LIT-ALP-01"], difficulty: 1,
      instructions: "I will say a letter. Tap it!", tags: ["alphabet", "letters"], mission: "Look for these letters on signs, packets and books today." }, "tap-choose", findLetters(g))),
  activity({ ...L, id: "find-the-letters-z-and-friends", title: "Find the Letters Z and Friends", description: "Find Z, and practise some tricky letters.", obj: ["LIT-ALP-01"], difficulty: 1,
    instructions: "I will say a letter. Tap it!", tags: ["alphabet", "letters"] }, "tap-choose", [findLetter("r1", "Z"), findLetter("r2", "I"), findLetter("r3", "Q"), findLetter("r4", "B")]),

  // ---------------- Curious Thinker: capital and small, order, letter sounds ----------------
  ...([
    ["a-b-c-d-e-f", "A, B, C, D, E, F", [["A", "B", "C"], ["D", "E", "F"]]],
    ["g-h-i-j-k-l", "G, H, I, J, K, L", [["G", "H", "I"], ["J", "K", "L"]]],
    ["m-n-o-p-q-r", "M, N, O, P, Q, R", [["M", "N", "O"], ["P", "Q", "R"]]],
    ["s-t-u-v-w-x", "S, T, U, V, W, X", [["S", "T", "U"], ["V", "W", "X"]]],
    ["y-z-and-friends", "Y, Z and some friends", [["Y", "Z", "B"], ["M", "S", "T"]]],
  ] as const).map(([slug, label, rounds]) =>
    activity({ ...L, id: `match-capital-and-small-${slug}`, title: `Capital and Small Letters: ${label.split(",")[0]} to ${label.split(",").at(-1)!.trim().replace("some friends", "friends")}`.replace("Y to Z and friends", "Y, Z and Friends"),
      description: "Match each capital letter with its small letter.", obj: ["LIT-ALP-02"], band: "curious-thinker", difficulty: 2,
      instructions: "Tap a capital letter, then tap its small letter.", tags: ["alphabet", "letters"] }, "match-pair",
      (rounds as readonly (readonly string[])[]).map((r, i) => PAIRS(`r${i + 1}`, "Match each capital letter to its small letter.", r.map((c) => [`${c}|capital ${c}`, `${c.toLowerCase()}|small ${c.toLowerCase()}`] as [string, string]), ["Look at the shape. Which small letter looks like this capital?"])))),

  activity({ ...L, id: "what-letter-comes-next-a-to-h", title: "What Letter Comes Next? A to H", description: "Say which letter comes next in the alphabet.", obj: ["LIT-ALP-03"], band: "curious-thinker", difficulty: 2,
    instructions: "Find the missing letter.", tags: ["alphabet", "order"] }, "complete-pattern", [
    PAT("r1", "Which letter is missing?", ["A", "B", "?", "D"], [lt("C"), lt("F"), lt("E")], 0, ["Sing the alphabet song: A, B, ... What comes next?"]),
    PAT("r2", "Which letter is missing?", ["C", "D", "E", "?"], [lt("F"), lt("H"), lt("B")], 0, ["After E in the alphabet song comes..."]),
    PAT("r3", "Which letter is missing?", ["E", "?", "G", "H"], [lt("F"), lt("D"), lt("J")], 0, ["E, then ?, then G. What is in between?"]),
    PAT("r4", "Which letter is missing?", ["?", "F", "G", "H"], [lt("E"), lt("A"), lt("K")], 0, ["What comes just before F?"]),
  ]),
  activity({ ...L, id: "what-letter-comes-next-i-to-p", title: "What Letter Comes Next? I to P", description: "Say which letter comes next in the alphabet.", obj: ["LIT-ALP-03"], band: "curious-thinker", difficulty: 2,
    instructions: "Find the missing letter.", tags: ["alphabet", "order"] }, "complete-pattern", [
    PAT("r1", "Which letter is missing?", ["I", "J", "?", "L"], [lt("K"), lt("M"), lt("H")], 0, ["Sing the alphabet song: I, J, ... What comes next?"]),
    PAT("r2", "Which letter is missing?", ["L", "M", "N", "?"], [lt("O"), lt("Q"), lt("K")], 0, ["After N in the alphabet song comes..."]),
    PAT("r3", "Which letter is missing?", ["M", "?", "O", "P"], [lt("N"), lt("L"), lt("R")], 0, ["M, then ?, then O. What is in between?"]),
    PAT("r4", "Which letter is missing?", ["?", "N", "O", "P"], [lt("M"), lt("T"), lt("B")], 0, ["What comes just before N?"]),
  ]),
  activity({ ...L, id: "what-letter-comes-next-q-to-z", title: "What Letter Comes Next? Q to Z", description: "Say which letter comes next in the alphabet.", obj: ["LIT-ALP-03"], band: "curious-thinker", difficulty: 2,
    instructions: "Find the missing letter.", tags: ["alphabet", "order"] }, "complete-pattern", [
    PAT("r1", "Which letter is missing?", ["Q", "R", "?", "T"], [lt("S"), lt("U"), lt("P")], 0, ["Sing the alphabet song: Q, R, ... What comes next?"]),
    PAT("r2", "Which letter is missing?", ["T", "U", "V", "?"], [lt("W"), lt("Y"), lt("S")], 0, ["After V in the alphabet song comes..."]),
    PAT("r3", "Which letter is missing?", ["W", "?", "Y", "Z"], [lt("X"), lt("V"), lt("A")], 0, ["W, then ?, then Y. What is in between?"]),
    PAT("r4", "Which letter is missing?", ["?", "X", "Y", "Z"], [lt("W"), lt("B"), lt("M")], 0, ["What comes just before X?"]),
  ]),
  activity({ ...L, id: "put-the-letters-in-order-a-to-h", title: "Put the Letters in Order: A to H", description: "Put four letters in alphabet order.", obj: ["LIT-ALP-03"], band: "curious-thinker", difficulty: 2,
    instructions: "Tap the letters in alphabet order.", tags: ["alphabet", "order", "sequence"] }, "complete-pattern", [
    ORD("r1", "Tap the letters in order: A, B, C, D.", ["A|the letter A", "B|the letter B", "C|the letter C", "D|the letter D"], ["Sing the alphabet song. Which letter comes first?"]),
    ORD("r2", "Tap the letters in order: E, F, G, H.", ["E|the letter E", "F|the letter F", "G|the letter G", "H|the letter H"], ["Sing the alphabet song from E."]),
  ]),
  activity({ ...L, id: "put-the-letters-in-order-i-to-p", title: "Put the Letters in Order: I to P", description: "Put four letters in alphabet order.", obj: ["LIT-ALP-03"], band: "curious-thinker", difficulty: 2,
    instructions: "Tap the letters in alphabet order.", tags: ["alphabet", "order", "sequence"] }, "complete-pattern", [
    ORD("r1", "Tap the letters in order: I, J, K, L.", ["I|the letter I", "J|the letter J", "K|the letter K", "L|the letter L"], ["Sing the alphabet song. Which letter comes first?"]),
    ORD("r2", "Tap the letters in order: M, N, O, P.", ["M|the letter M", "N|the letter N", "O|the letter O", "P|the letter P"], ["Sing the alphabet song from M."]),
  ]),

  ...([
    ["a-to-f", "A to F", [["A", ["B", "C"]], ["B", ["D", "S"]], ["C", ["F", "T"]], ["D", ["A", "M"]], ["E", ["B", "L"]], ["F", ["C", "H"]]]],
    ["g-to-m", "G to M", [["G", ["A", "B"]], ["H", ["D", "L"]], ["J", ["C", "M"]], ["K", ["F", "P"]], ["L", ["H", "S"]], ["M", ["B", "J"]]]],
    ["n-to-s", "N to S", [["N", ["D", "G"]], ["O", ["K", "M"]], ["P", ["C", "L"]], ["Q", ["F", "N"]], ["R", ["H", "B"]], ["S", ["J", "D"]]]],
    ["t-to-z", "T to Z", [["T", ["A", "G"]], ["U", ["P", "K"]], ["V", ["O", "H"]], ["W", ["R", "C"]], ["Y", ["B", "M"]], ["Z", ["J", "L"]]]],
  ] as const).map(([slug, label, rounds]) =>
    activity({ ...L, id: `letter-sounds-${slug}`, title: `Letter Sounds: ${label}`, description: "Match each letter to a picture that starts with its sound.", obj: ["LIT-PHN-02"], band: "curious-thinker", difficulty: 2,
      instructions: "Look at the letter. Tap the picture that starts with it.", tags: ["alphabet", "letters", "phonics"], mission: "Play I spy using letter sounds." }, "tap-choose",
      (rounds as readonly (readonly [string, readonly [string, string]])[]).map(([ch, d], i) => startsWith(`r${i + 1}`, ch, d as [string, string])))),

  // ---------------- Confident Learner: build three-letter words ----------------
  activity({ ...L, id: "finish-the-word-last-letter", title: "Finish the Word: Last Letter", description: "Choose the last letter to finish each word.", obj: ["LIT-SPL-01"], band: "confident-learner", difficulty: 2,
    instructions: "Look at the picture. Which letter finishes the word?", tags: ["alphabet", "letters", "spelling"] }, "complete-pattern", [
    PAT("r1", "Finish the word.", ["c", "a", "?"], [lt("t"), lt("p"), lt("n")], 0, ["Say the word slowly: c, a, ... What sound comes last?"]),
    PAT("r2", "Finish the word.", ["h", "a", "?"], [lt("t"), lt("g"), lt("m")], 0, ["A hat goes on your head. h, a, ... What sound comes last?"]),
    PAT("r3", "Finish the word.", ["p", "i", "?"], [lt("g"), lt("t"), lt("b")], 0, ["Say the word slowly: p, i, ... What sound comes last?"]),
    PAT("r4", "Finish the word.", ["d", "o", "?"], [lt("g"), lt("m"), lt("p")], 0, ["Say the word slowly: d, o, ... What sound comes last?"]),
  ].map((r, i) => ({ ...r, display: ["🐱", "🎩", "🐷", "🐶"][i] }))),
  activity({ ...L, id: "finish-the-word-middle-letter", title: "Finish the Word: Middle Letter", description: "Choose the middle letter to finish each word.", obj: ["LIT-SPL-01"], band: "confident-learner", difficulty: 2,
    instructions: "Look at the picture. Which letter goes in the middle?", tags: ["alphabet", "letters", "spelling"] }, "complete-pattern", [
    PAT("r1", "Finish the word.", ["s", "?", "n"], [lt("u"), lt("a"), lt("i")], 0, ["The sun is up in the sky. s, ... , n. Which vowel sound is in the middle?"]),
    PAT("r2", "Finish the word.", ["b", "?", "d"], [lt("e"), lt("o"), lt("u")], 0, ["You sleep in a bed. b, ... , d. Which vowel sound is in the middle?"]),
    PAT("r3", "Finish the word.", ["h", "?", "n"], [lt("e"), lt("a"), lt("o")], 0, ["A hen says cluck. h, ... , n. Which vowel sound is in the middle?"]),
    PAT("r4", "Finish the word.", ["b", "?", "s"], [lt("u"), lt("i"), lt("a")], 0, ["A bus goes on the road. b, ... , s. Which vowel sound is in the middle?"]),
  ].map((r, i) => ({ ...r, display: ["☀️", "🛏️", "🐔", "🚌"][i] }))),
  activity({ ...L, id: "finish-the-word-first-letter", title: "Finish the Word: First Letter", description: "Choose the first letter to finish each word.", obj: ["LIT-SPL-01"], band: "confident-learner", difficulty: 3,
    instructions: "Look at the picture. Which letter starts the word?", tags: ["alphabet", "letters", "spelling"] }, "complete-pattern", [
    PAT("r1", "Finish the word.", ["?", "a", "t"], [lt("c"), lt("m"), lt("s")], 0, ["A cat says meow. What sound does cat start with?"]),
    PAT("r2", "Finish the word.", ["?", "u", "p"], [lt("c"), lt("m"), lt("b")], 0, ["You drink from a cup. What sound does cup start with?"]),
    PAT("r3", "Finish the word.", ["?", "e", "n"], [lt("p"), lt("t"), lt("m")], 0, ["You write with a pen. What sound does pen start with?"]),
    PAT("r4", "Finish the word.", ["?", "o", "x"], [lt("f"), lt("b"), lt("t")], 0, ["A fox is orange and clever. What sound does fox start with?"]),
  ].map((r, i) => ({ ...r, display: ["🐱", "☕", "🖊️", "🦊"][i] }))),

  // ---------------- Young Problem Solver: spell, read and recognise words ----------------
  activity({ ...L, id: "spell-the-word-four-letters", title: "Spell the Word: Four Letters", description: "Choose the missing letter in a four-letter word.", obj: ["LIT-WRD-02"], band: "young-problem-solver", difficulty: 3,
    instructions: "Look at the picture. Which letter is missing?", tags: ["alphabet", "letters", "spelling"] }, "complete-pattern", [
    PAT("r1", "Which letter is missing?", ["f", "r", "o", "?"], [lt("g"), lt("d"), lt("t")], 0, ["A frog says ribbit. f, r, o, ... What sound comes last?"]),
    PAT("r2", "Which letter is missing?", ["f", "i", "?", "h"], [lt("s"), lt("t"), lt("n")], 0, ["A fish swims in water. f, i, ... , h. Which sound is missing?"]),
    PAT("r3", "Which letter is missing?", ["d", "u", "c", "?"], [lt("k"), lt("t"), lt("p")], 0, ["A duck says quack. d, u, c, ... What sound comes last?"]),
    PAT("r4", "Which letter is missing?", ["m", "o", "?", "n"], [lt("o"), lt("a"), lt("e")], 0, ["The moon shines at night. m, o, ... , n. Which letter is missing?"]),
  ].map((r, i) => ({ ...r, display: ["🐸", "🐟", "🦆", "🌙"][i] }))),
  activity({ ...L, id: "which-word-says-it", title: "Which Word Says It?", description: "Read the words and pick the one that matches the picture.", obj: ["LIT-WRD-02"], band: "young-problem-solver", difficulty: 3, words: true,
    instructions: "Look at the picture. Tap the word that says what it is.", tags: ["alphabet", "reading", "words"] }, "tap-choose", [
    T("r1", "Which word says what this is?", ["dog", "dig", "dot"], [0], { display: "🐶", hints: ["Sound it out one letter at a time: d, o, g."] }),
    T("r2", "Which word says what this is?", ["sun", "sin", "sob"], [0], { display: "☀️", hints: ["It starts with sss and ends with nnn."] }),
    T("r3", "Which word says what this is?", ["bed", "bad", "bud"], [0], { display: "🛏️", hints: ["The middle sound is eh, as in egg."] }),
    T("r4", "Which word says what this is?", ["fish", "fist", "dish"], [0], { display: "🐟", hints: ["It starts with fff, like fan."] }),
  ]),
  activity({ ...L, id: "sight-words-the-and-said", title: "Words We See Often", description: "Find common words that we see in books all the time.", obj: ["LIT-WRD-02"], band: "young-problem-solver", difficulty: 3, words: true,
    instructions: "I will say a word. Tap it.", tags: ["alphabet", "reading", "words"] }, "tap-choose", [
    T("r1", "Tap the word: the", ["the", "he", "she"], [0], { hints: ["It begins with t and h together."] }),
    T("r2", "Tap the word: and", ["and", "an", "any"], [0], { hints: ["It begins with a and ends with d."] }),
    T("r3", "Tap the word: said", ["said", "sad", "say"], [0], { hints: ["It sounds like sed, but it has the letters a and i."] }),
    T("r4", "Tap the word: was", ["was", "saw", "has"], [0], { hints: ["It begins with w."] }),
  ]),
];
