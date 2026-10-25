// Puzzles for older children: longer sequences, number patterns, riddles and clue puzzles.
import { activity, ORD, PAT, T } from "../builders";

const P = { world: "puzzle-planet", domain: "logic-puzzles", character: "pip" } as const;
const n = (v: string) => `${v}|the number ${v}`;

export const LEVEL_PUZZLE_ACTIVITIES = [
  // ---------------- Curious Thinker: five steps in order ----------------
  activity({ ...P, id: "five-steps-grow-a-plant", title: "Five Steps: Grow a Plant", description: "Put five steps in the right order.", obj: ["LOG-SEQ-02"], band: "curious-thinker", difficulty: 2,
    instructions: "Tap the pictures in the order they happen.", tags: ["puzzle", "sequence"] }, "complete-pattern", [
    ORD("r1", "Growing a flower. Tap in order.", ["🌰|plant the seed", "💧|water it", "🌱|a sprout comes up", "🌿|it grows leaves", "🌸|a flower opens"], ["What do we do first with a seed?"]),
    ORD("r2", "Baking a cake. Tap in order.", ["🥚|crack the eggs", "🥣|mix everything", "🔥|bake it in the oven", "🎂|decorate it", "🍰|eat and share"], ["What do we need to do before we mix?"]),
  ]),
  activity({ ...P, id: "five-steps-bedtime", title: "Five Steps: Getting Ready for Bed", description: "Put the bedtime steps in the right order.", obj: ["LOG-SEQ-02"], band: "curious-thinker", difficulty: 2,
    instructions: "Tap the pictures in the order they happen.", tags: ["puzzle", "sequence", "routine"] }, "complete-pattern", [
    ORD("r1", "Bedtime. Tap in order.", ["🛁|have a bath", "🪥|brush your teeth", "👕|put on pyjamas", "📖|read a story", "😴|go to sleep"], ["What do we do last of all?"]),
    ORD("r2", "Washing hands. Tap in order.", ["🚰|wet your hands", "🧼|add soap", "🙌|rub your hands together", "🚿|rinse the soap off", "🧻|dry your hands"], ["What comes after the soap?"]),
  ]),
  activity({ ...P, id: "five-steps-trip-to-the-park", title: "Five Steps: A Trip to the Park", description: "Put the steps of a trip in the right order.", obj: ["LOG-SEQ-02"], band: "curious-thinker", difficulty: 2,
    instructions: "Tap the pictures in the order they happen.", tags: ["puzzle", "sequence"] }, "complete-pattern", [
    ORD("r1", "A trip to the park. Tap in order.", ["🎒|pack a bag", "🚶|walk to the park", "🛝|play on the slide", "🍎|have a snack", "🏠|go home"], ["What do we do before we set off?"]),
  ]),

  // ---------------- Confident Learner: number patterns and riddles ----------------
  activity({ ...P, id: "count-in-twos-puzzle", title: "Count in Twos", description: "Find the missing number when counting in twos.", obj: ["LOG-PAT-02"], band: "confident-learner", difficulty: 2,
    instructions: "Find the missing number.", tags: ["puzzle", "pattern", "numbers"] }, "complete-pattern", [
    PAT("r1", "Which number is missing?", ["2", "4", "6", "?"], [n("8"), n("7"), n("9")], 0, ["Each number goes up by two: 2, 4, 6, ..."]),
    PAT("r2", "Which number is missing?", ["2", "4", "?", "8"], [n("6"), n("5"), n("7")], 0, ["Count in twos: 2, 4, ... , 8."]),
    PAT("r3", "Which number is missing?", ["4", "6", "8", "?"], [n("10"), n("9"), n("12")], 0, ["Add two each time. What is 8 and two more?"]),
    PAT("r4", "Which number is missing?", ["?", "4", "6", "8"], [n("2"), n("1"), n("3")], 0, ["Take two away from 4. What is left?"]),
  ]),
  activity({ ...P, id: "count-in-fives-puzzle", title: "Count in Fives", description: "Find the missing number when counting in fives.", obj: ["LOG-PAT-02"], band: "confident-learner", difficulty: 2,
    instructions: "Find the missing number.", tags: ["puzzle", "pattern", "numbers"] }, "complete-pattern", [
    PAT("r1", "Which number is missing?", ["5", "10", "15", "?"], [n("20"), n("16"), n("25")], 0, ["Each number goes up by five. Count your fingers: 5, 10, 15, ..."]),
    PAT("r2", "Which number is missing?", ["10", "15", "?", "25"], [n("20"), n("30"), n("17")], 0, ["Go up by five each time."]),
    PAT("r3", "Which number is missing?", ["5", "?", "15", "20"], [n("10"), n("12"), n("7")], 0, ["5, then five more is..."]),
    PAT("r4", "Which number is missing?", ["20", "25", "30", "?"], [n("35"), n("40"), n("31")], 0, ["30 and five more is..."]),
  ]),
  activity({ ...P, id: "growing-and-shrinking-patterns", title: "Growing and Shrinking Patterns", description: "Work out how a number pattern changes.", obj: ["LOG-PAT-02"], band: "confident-learner", difficulty: 3,
    instructions: "Find the missing number.", tags: ["puzzle", "pattern", "numbers"] }, "complete-pattern", [
    PAT("r1", "Which number is missing?", ["1", "2", "2", "3", "3", "?"], [n("4"), n("3"), n("5")], 0, ["Each number comes twice. What is the next new number?"]),
    PAT("r2", "Which number is missing?", ["10", "8", "6", "?"], [n("4"), n("5"), n("2")], 0, ["The numbers go down by two each time."]),
    PAT("r3", "Which number is missing?", ["1", "3", "5", "?"], [n("7"), n("6"), n("8")], 0, ["Each number goes up by two."]),
    PAT("r4", "Which number is missing?", ["12", "10", "8", "?"], [n("6"), n("7"), n("4")], 0, ["Take away two each time."]),
  ]),

  activity({ ...P, id: "riddles-animals", title: "Riddles: Animals", description: "Use the clues to work out which animal it is.", obj: ["LOG-RID-01"], band: "confident-learner", difficulty: 2, words: true,
    instructions: "Listen to all the clues. Then tap the answer.", tags: ["puzzle", "riddle", "animals"] }, "tap-choose", [
    T("r1", "I have four legs. I say woof. I like to chase sticks. What am I?", ["a dog", "a cat", "a cow"], [0], { hints: ["Which animal says woof?"] }),
    T("r2", "I live in the sea. I have eight long arms. What am I?", ["an octopus", "a crab", "a dolphin"], [0], { hints: ["Count the arms: eight. Which sea animal has so many?"] }),
    T("r3", "I am yellow and long. Monkeys love to eat me. What am I?", ["a banana", "a lemon", "a carrot"], [0], { hints: ["Use both clues: yellow and long."] }),
    T("r4", "I have a very long trunk and big ears. What am I?", ["an elephant", "a giraffe", "a rabbit"], [0], { hints: ["Which animal has a trunk?"] }),
  ]),
  activity({ ...P, id: "riddles-things", title: "Riddles: Things Around Us", description: "Use the clues to work out what the thing is.", obj: ["LOG-RID-01"], band: "confident-learner", difficulty: 2, words: true,
    instructions: "Listen to all the clues. Then tap the answer.", tags: ["puzzle", "riddle"] }, "tap-choose", [
    T("r1", "I have a face and two hands, but no feet. I tell you the time. What am I?", ["a clock", "a shoe", "a book"], [0], { hints: ["Which thing tells the time?"] }),
    T("r2", "I am wet. I fall from the clouds. What am I?", ["rain", "sand", "a leaf"], [0], { hints: ["What falls from the clouds and is wet?"] }),
    T("r3", "You wear me on your feet, and I come in a pair. What am I?", ["shoes", "a hat", "a scarf"], [0], { hints: ["Where do you wear these? On your feet."] }),
    T("r4", "I have pages and a story inside. What am I?", ["a book", "a cup", "a ball"], [0], { hints: ["Which thing has pages?"] }),
  ]),
  activity({ ...P, id: "riddles-food", title: "Riddles: Food", description: "Use the clues to work out which food it is.", obj: ["LOG-RID-01"], band: "confident-learner", difficulty: 2, words: true,
    instructions: "Listen to all the clues. Then tap the answer.", tags: ["puzzle", "riddle", "food"] }, "tap-choose", [
    T("r1", "I am a crunchy fruit. I grow on trees. I can be red or green. What am I?", ["an apple", "a carrot", "a potato"], [0], { hints: ["Which one is a fruit that grows on trees?"] }),
    T("r2", "I am cold and sweet. I melt in the sun. What am I?", ["ice cream", "bread", "rice"], [0], { hints: ["Which food is cold and melts?"] }),
    T("r3", "I come from cows. You can drink me. I am white. What am I?", ["milk", "juice", "water"], [0], { hints: ["Which drink comes from cows?"] }),
    T("r4", "I am made from flour. You can make toast with me. What am I?", ["bread", "rice", "an egg"], [0], { hints: ["What do you put in the toaster?"] }),
  ]),

  // ---------------- Young Problem Solver: clue puzzles ----------------
  activity({ ...P, id: "clue-detective-shapes", title: "Clue Detective: Shapes", description: "Use the clues to work out which shape it is.", obj: ["LOG-DED-01"], band: "young-problem-solver", difficulty: 3, words: true,
    instructions: "Read all the clues. Rule out what it cannot be.", tags: ["puzzle", "clues", "shapes"] }, "tap-choose", [
    T("r1", "It has no corners. It is perfectly round. Which shape is it?", ["a circle", "a square", "a triangle"], [0], { hints: ["Which shape has no corners at all?"] }),
    T("r2", "It has three sides. Which shape is it?", ["a triangle", "a square", "a circle"], [0], { hints: ["Count the sides: one, two, three."] }),
    T("r3", "It has four sides, and all four sides are the same. Which shape is it?", ["a square", "a rectangle", "a triangle"], [0], { hints: ["Four equal sides. Which shape has that?"] }),
    T("r4", "It has four sides. Two sides are long and two sides are short. Which shape is it?", ["a rectangle", "a square", "a circle"], [0], { hints: ["Not all the sides are the same."] }),
  ]),
  activity({ ...P, id: "clue-detective-who-is-it", title: "Clue Detective: Who Is It?", description: "Use clues that say what it is not, to rule things out.", obj: ["LOG-DED-01"], band: "young-problem-solver", difficulty: 3, words: true,
    instructions: "Read all the clues. Cross out what it cannot be.", tags: ["puzzle", "clues", "logic"] }, "tap-choose", [
    T("r1", "Mia, Sam and Lily each have one pet: a cat, a dog or a fish. Sam has the dog. Mia does not have the cat. Who has the cat?", ["Lily", "Mia", "Sam"], [0], { hints: ["Sam has the dog, and Mia does not have the cat. Who is left?"] }),
    T("r2", "A ball is in one of three boxes: red, blue or green. It is not in the red box. It is not in the blue box. Which box is it in?", ["the green box", "the red box", "the blue box"], [0], { hints: ["Cross out the red box and the blue box."] }),
    T("r3", "Ana is taller than Ben. Ben is taller than Cy. Who is the tallest?", ["Ana", "Ben", "Cy"], [0], { hints: ["Ana is taller than Ben, and Ben is taller than Cy."] }),
    T("r4", "It is not a dog. It is not a cat. It has fins and swims. What is it?", ["a fish", "a dog", "a cat"], [0], { hints: ["Cross out the dog and the cat."] }),
  ]),
  activity({ ...P, id: "clue-detective-mystery-number", title: "Clue Detective: Mystery Number", description: "Use number clues to work out the mystery number.", obj: ["LOG-DED-01"], band: "young-problem-solver", difficulty: 3, words: true,
    instructions: "Read all the clues. Which number fits every one?", tags: ["puzzle", "clues", "numbers"] }, "tap-choose", [
    T("r1", "I am more than 3 and less than 5. What number am I?", ["4", "3", "6"], [0], { hints: ["Count: 3, then the number between 3 and 5, then 5."] }),
    T("r2", "I am bigger than 6 and smaller than 8. What number am I?", ["7", "6", "9"], [0], { hints: ["Which number comes between 6 and 8?"] }),
    T("r3", "I am an odd number. I am bigger than 4 and smaller than 7. What number am I?", ["5", "6", "4"], [0], { hints: ["The numbers between 4 and 7 are 5 and 6. Which is odd?"] }),
    T("r4", "If you add 2 to me, you get 9. What number am I?", ["7", "8", "6"], [0], { hints: ["What number plus 2 makes 9? Count back 2 from 9."] }),
  ]),
];
