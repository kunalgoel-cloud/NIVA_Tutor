import type { Domain } from "@/lib/curriculum/schema";

// The eight CURRICULUM domains. (The five learning WORLDS are navigation categories, see worlds.ts.)
export const DOMAINS: Domain[] = [
  {
    id: "mathematics", slug: "mathematics", name: "Mathematics", displayOrder: 1,
    description: "Counting, quantity, number sense, shapes, patterns and early arithmetic.",
    progression: [
      "Physical quantities: handling and counting real things",
      "Visual quantities: counting pictures, comparing groups, subitising",
      "Number representations: numerals, number order, number lines",
      "Mental imagery: picturing quantities and small changes in the head",
      "Abstract calculation: addition, subtraction, bonds, place value, word problems",
    ],
  },
  {
    id: "spoken-english", slug: "spoken-english", name: "Spoken English & Vocabulary", displayOrder: 2,
    description: "Words, sentences, listening and describing the world aloud.",
    progression: [
      "Naming people, things and actions",
      "Describing with adjectives and action words",
      "Speaking in complete sentences",
      "Extending sentences with because, and, but",
      "Explaining, comparing and describing in connected speech",
    ],
  },
  {
    id: "conversation", slug: "conversation", name: "Conversation & Communication", displayOrder: 3,
    description: "Responding, taking turns, asking questions, giving reasons and narrating.",
    progression: [
      "Responding to a question on topic",
      "Taking turns and asking back",
      "Giving simple reasons and preferences",
      "Narrating events in order",
      "Sustaining a longer, connected conversation",
    ],
  },
  {
    id: "logic-puzzles", slug: "logic-puzzles", name: "Logic & Puzzles", displayOrder: 4,
    description: "Patterns, classification, memory, sequencing, cause and effect and planning.",
    progression: [
      "Matching and noticing sameness and difference",
      "Sorting and spotting the odd one out",
      "Patterns, sequences and visual memory",
      "Cause and effect and simple planning",
      "Hidden rules and multi-step problems",
    ],
  },
  {
    id: "early-literacy", slug: "early-literacy", name: "Early Literacy & Comprehension", displayOrder: 5,
    description: "Listening to stories, rhyme, first sounds, word recognition and recall.",
    progression: [
      "Enjoying and listening to stories and rhymes",
      "Hearing rhyme and first sounds",
      "Linking spoken words to pictures and print",
      "Recalling and retelling story events in order",
      "Blending sounds, reading simple words and answering questions about text",
    ],
  },
  {
    id: "science-knowledge", slug: "science-knowledge", name: "Science & General Knowledge", displayOrder: 6,
    description: "Animals, plants, weather, the body, community and how the world works.",
    progression: [
      "Noticing and naming things in the world",
      "Grouping living things and their needs",
      "Simple cause and effect in nature",
      "Observing change over time",
      "Asking questions and testing simple ideas",
    ],
  },
  {
    id: "creativity-storytelling", slug: "creativity-storytelling", name: "Creativity & Storytelling", displayOrder: 7,
    description: "Imagination, inventing and telling stories, with no single right answer.",
    progression: [
      "Playing with ideas and pretend",
      "Adding to a story with own ideas",
      "Inventing characters and settings",
      "Telling a story with a beginning, middle and end",
      "Creating and explaining original work",
    ],
  },
  {
    id: "social-emotional", slug: "social-emotional", name: "Social-Emotional & Life Skills", displayOrder: 8,
    description: "Feelings, empathy, cooperation, asking for help and staying safe.",
    progression: [
      "Naming basic feelings",
      "Noticing how others feel",
      "Choosing kind and safe responses",
      "Solving small problems with others",
      "Independence, resilience and perspective-taking",
    ],
  },
];
