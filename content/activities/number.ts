import { activity, CNT, GIVE, PAIRS, PAT, ORD, SORT, T } from "../builders";

const W = { world: "number-kingdom", domain: "mathematics", character: "dot" } as const;

export const NUMBER_ACTIVITIES = [
  activity({ ...W, id: "count-the-apples", title: "Count the Apples", description: "Touch each apple and count how many.", obj: ["MATH-CNT-01"],
    instructions: "Tap each apple to count it. Then tap the number.", audio: "Let's count the apples together! Tap each apple one at a time.", tags: ["fruit", "counting"],
    mission: "Count the spoons when you set the table." }, "count-collect", [
    CNT("r1", "How many apples?", "🍎", 2, [1, 2, 3], ["Touch each apple once.", "Count: one, two."]),
    CNT("r2", "How many apples?", "🍎", 3, [2, 3, 4], ["Touch each apple once.", "The last number you say tells how many."]),
    CNT("r3", "How many apples now?", "🍏", 3, [3, 4, 5], ["Touch each apple once."]),
  ]),
  activity({ ...W, id: "count-the-animal-friends", title: "Count the Animal Friends", description: "Count 4 and 5 animal friends.", obj: ["MATH-CNT-02"], difficulty: 2,
    instructions: "Tap each friend to count. Then tap the number.", tags: ["animals", "counting"] }, "count-collect", [
    CNT("r1", "How many ducks?", "🦆", 4, [3, 4, 5], ["Tap each duck once.", "Say the numbers slowly."]),
    CNT("r2", "How many sheep?", "🐑", 5, [4, 5, 6], ["Tap each sheep once.", "The last number you say is how many."]),
    CNT("r3", "How many bunnies?", "🐰", 4, [4, 5, 3], ["Tap each bunny once."]),
  ]),
  activity({ ...W, id: "count-to-ten-parade", title: "Count to Ten Parade", description: "Count bigger groups up to ten.", obj: ["MATH-CNT-03"], difficulty: 3, minutes: 4,
    instructions: "Tap each one to count. Take your time!", tags: ["counting"], mission: "Count the stairs as you climb." }, "count-collect", [
    CNT("r1", "How many balloons?", "🎈", 6, [5, 6, 7], ["Tap each balloon once.", "Count from left to right."]),
    CNT("r2", "How many stars?", "⭐", 8, [7, 8, 9], ["Tap each star once.", "Tap and count together."]),
    CNT("r3", "How many butterflies?", "🦋", 10, [9, 10, 11], ["Tap each one so you know it is counted."]),
  ]),
  activity({ ...W, id: "feed-the-dinosaur", title: "Feed the Dinosaur", description: "Give Dot exactly the number of snacks asked for.", obj: ["MATH-SUB-01"], difficulty: 2,
    instructions: "Tap snacks to give them to Dot. Stop at the right number!", audio: "Dot is hungry! Give Dot the number of snacks I ask for.", tags: ["dinosaur", "counting"] }, "count-collect", [
    GIVE("r1", "Give Dot 2 apples.", "🍎", 6, 2, "🦖|Dot the dinosaur", ["Count out loud as you give.", "Stop when you reach two."]),
    GIVE("r2", "Give Dot 3 bananas.", "🍌", 6, 3, "🦖|Dot the dinosaur", ["Count out loud as you give.", "Stop when you reach three."]),
    GIVE("r3", "Give Dot 4 carrots.", "🥕", 8, 4, "🦖|Dot the dinosaur", ["Count out loud as you give."]),
  ]),
  activity({ ...W, id: "which-group-has-more", title: "Which Group Has More?", description: "Compare two groups and choose the one with more.", obj: ["MATH-CMP-01"],
    instructions: "Look at both groups. Tap the group with more.", tags: ["compare"], mission: "Share snacks and ask: who has more?" }, "tap-choose", [
    T("r1", "Which group has more?", ["🍪🍪🍪🍪|four cookies", "🍪🍪|two cookies"], [0], { hints: ["Count each group.", "Line them up side by side."] }),
    T("r2", "Which group has more?", ["🐟🐟|two fish", "🐟🐟🐟🐟🐟|five fish"], [1], { hints: ["Count each group.", "Which group is longer?"] }),
    T("r3", "Which group has fewer?", ["🌸🌸🌸|three flowers", "🌸🌸🌸🌸🌸🌸|six flowers"], [0], { hints: ["Fewer means not as many."] }),
    T("r4", "Which group has more?", ["⚽⚽⚽|three balls", "⚽ ⚽ ⚽ ⚽|four balls, spread out", "⚽⚽|two balls"], [1], { hints: ["Spread out groups can trick us. Count them!"] }),
  ]),
  activity({ ...W, id: "match-the-number", title: "Match the Number", description: "Match each numeral to the right number of dots.", obj: ["MATH-NUM-01"],
    instructions: "Tap a number, then tap the dots that match.", tags: ["numerals"] }, "match-pair", [
    PAIRS("r1", "Match each number to its dots.", [["1|number one", "⚫|one dot"], ["2|number two", "⚫⚫|two dots"], ["3|number three", "⚫⚫⚫|three dots"]], ["Count the dots first."]),
    PAIRS("r2", "Match each number to its dots.", [["2|number two", "⚫⚫|two dots"], ["4|number four", "⚫⚫⚫⚫|four dots"], ["5|number five", "⚫⚫⚫⚫⚫|five dots"]], ["Count the dots first."]),
  ]),
  activity({ ...W, id: "build-a-number-train", title: "Build a Number Train", description: "Put the number carriages in order.", obj: ["MATH-NUM-02"], difficulty: 2,
    instructions: "Tap the carriages in order: start with 1.", tags: ["number order", "train"] }, "complete-pattern", [
    ORD("r1", "Tap the carriages in order, from 1.", ["1|number 1", "2|number 2", "3|number 3"], ["Which number comes first?"]),
    ORD("r2", "Tap the carriages in order, from 1.", ["1|number 1", "2|number 2", "3|number 3", "4|number 4", "5|number 5"], ["Which number comes after 2?"]),
  ]),
  activity({ ...W, id: "find-the-missing-number", title: "Find the Missing Number", description: "Find the number hiding in the line.", obj: ["MATH-NUM-02"], difficulty: 2,
    instructions: "One number is hiding. Which number is missing?", tags: ["number order"] }, "complete-pattern", [
    PAT("r1", "Which number is missing?", ["1", "2", "?", "4"], ["3", "5", "1"], 0, ["What comes after 2?"]),
    PAT("r2", "Which number is missing?", ["2", "?", "4", "5"], ["1", "3", "6"], 1, ["Count from 2."]),
    PAT("r3", "Which number is missing?", ["3", "4", "5", "?"], ["6", "2", "7"], 0, ["What comes after 5?"]),
  ]),
  activity({ ...W, id: "sort-by-size", title: "Sort by Size", description: "Sort big and small things into the right baskets.", obj: ["MATH-SRT-01"],
    instructions: "Tap a picture, then tap the basket where it belongs.", tags: ["sorting", "size"], mission: "Sort the laundry into big and small things." }, "match-pair", [
    SORT("r1", "Put big things in the big basket and small things in the small basket.", ["🧺|big basket", "👜|small basket"],
      [["🐘|big elephant", 0], ["🐭|small mouse", 1], ["🦒|big giraffe", 0], ["🐜|small ant", 1]], ["Is it big or small?"]),
    SORT("r2", "Sort again. Big or small?", ["🧺|big basket", "👜|small basket"],
      [["🐋|big whale", 0], ["🐞|small ladybird", 1], ["🚌|big bus", 0], ["🌰|small nut", 1]], ["Is it big or small?"]),
  ]),
  activity({ ...W, id: "complete-the-colour-pattern", title: "Complete the Colour Pattern", description: "Say what colour comes next.", obj: ["MATH-PAT-01"],
    instructions: "Look at the pattern. What comes next?", tags: ["pattern", "colour"], mission: "Make a bead pattern with beads or blocks." }, "complete-pattern", [
    PAT("r1", "What comes next?", ["🔴", "🔵", "🔴", "🔵", "?"], ["🔴|red", "🔵|blue", "🟡|yellow"], 0, ["Say the colours: red, blue, red, blue...", "What came after blue before?"]),
    PAT("r2", "What comes next?", ["🟡", "🟢", "🟡", "🟢", "🟡", "?"], ["🟢|green", "🔴|red", "🟡|yellow"], 0, ["Say the colours out loud."]),
    PAT("r3", "What comes next?", ["🔺", "🔵", "🔺", "🔵", "?"], ["🔵|blue circle", "🔺|red triangle", "⬛|black square"], 1, ["The pattern goes triangle, circle, triangle, circle."]),
  ]),
  activity({ ...W, id: "find-the-missing-object", title: "Find the Missing Object", description: "Watch what goes away and choose what is left.", obj: ["MATH-SUB-02"], difficulty: 2,
    instructions: "Look at the group. When you are ready, tap Hide. One goes away. What is left?", tags: ["take away"] }, "tap-choose", [
    T("r1", "One duck swam away. Which group shows what is left?", ["🦆🦆|two ducks", "🦆🦆🦆|three ducks", "🦆|one duck"], [0],
      { study: ["🦆", "🦆", "🦆"], hideLabel: "One duck swims away", hints: ["How many were there at first?", "One went away, so there is one fewer."] }),
    T("r2", "One cookie was eaten. Which group shows what is left?", ["🍪🍪🍪🍪|four cookies", "🍪🍪🍪|three cookies"], [1],
      { study: ["🍪", "🍪", "🍪", "🍪"], hideLabel: "Someone eats one", hints: ["How many cookies at first?"] }),
  ]),
  activity({ ...W, id: "shape-detective", title: "Shape Detective", description: "Find circles, squares and triangles in the world.", obj: ["MATH-SHP-01"],
    instructions: "Be a shape detective! Tap the shape I ask for.", tags: ["shapes"], mission: "Go on a shape hunt around your home." }, "tap-choose", [
    T("r1", "Which one is a circle?", ["⚪|circle", "🟥|square", "🔺|triangle"], [0], { hints: ["A circle is round with no corners."] }),
    T("r2", "Which one is a triangle?", ["🟦|square", "🔺|triangle", "⚪|circle"], [1], { hints: ["A triangle has three sides."] }),
    T("r3", "Which one is shaped like a circle?", ["🕐|clock", "📦|box", "⛺|tent"], [0], { hints: ["Which one is round?"] }),
    T("r4", "Which one is a square?", ["🔺|triangle", "🟩|square", "⚪|circle"], [1], { hints: ["A square has four equal sides."] }),
  ]),
];
