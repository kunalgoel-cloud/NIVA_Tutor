// Suggested offline activities for parents. These are SUGGESTIONS and are never counted as completed digital activity.
export type OfflineMission = { id: string; title: string; description: string; domain: string; objectiveIds: string[]; supervision?: string };

export const OFFLINE_MISSIONS: OfflineMission[] = [
  { id: "count-toys", title: "Count toys together", description: "Line up some toys and count them. Ask 'how many?' at the end.", domain: "mathematics", objectiveIds: ["MATH-CNT-01", "MATH-CNT-02", "MATH-CNT-03"] },
  { id: "shape-hunt", title: "Find shapes around the house", description: "Hunt for circles, squares and triangles. Which is the most common?", domain: "mathematics", objectiveIds: ["MATH-SHP-01"] },
  { id: "describe-object", title: "Describe an object in the room", description: "Take turns describing something in the room without naming it. Can the other guess?", domain: "spoken-english", objectiveIds: ["SPE-VOC-02", "SPE-SNT-01"] },
  { id: "grandparent-chat", title: "Ask a grandparent about their childhood", description: "Help your child think of two questions to ask on a call or visit.", domain: "conversation", objectiveIds: ["CONV-QST-01", "CONV-TRN-01"] },
  { id: "invent-story", title: "Invent a story together", description: "Take turns adding one sentence each. Use three objects from your pocket.", domain: "creativity-storytelling", objectiveIds: ["CRE-STY-01"] },
  { id: "plant-watch", title: "Observe a plant and discuss what has changed", description: "Look at a plant every few days. What is bigger? What is new?", domain: "science-knowledge", objectiveIds: ["SCI-NAT-01"] },
  { id: "sort-laundry", title: "Sort the laundry", description: "Sort socks by colour or clothes by size.", domain: "logic-puzzles", objectiveIds: ["MATH-SRT-01", "LOG-MTC-01"] },
  { id: "feelings-chat", title: "Name feelings at bedtime", description: "Each name one happy and one tricky moment from the day.", domain: "social-emotional", objectiveIds: ["SEL-EMO-01"] },
  { id: "rhyme-time", title: "Rhyme time", description: "Sing a rhyme and pause before the last word. Let your child fill it in.", domain: "early-literacy", objectiveIds: ["LIT-RHY-01"] },
  { id: "kettle-clouds", title: "Steam and clouds", description: "Watch steam rise from a kettle and talk about how clouds form.", domain: "science-knowledge", objectiveIds: ["SCI-WTH-01"], supervision: "Adult only handles the kettle; keep the child well back from the steam." },
];
