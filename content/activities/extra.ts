// Additional activities for Number Kingdom, Puzzle Planet and Creativity Forest (ages 3-4).
import { activity, CNT, GIVE, LR, ORD, PAIRS, PAT, SORT, T } from "../builders";

const N = { world: "number-kingdom", domain: "mathematics", character: "dot" } as const;
const P = { world: "puzzle-planet", domain: "logic-puzzles", character: "pip" } as const;
const CRE = { world: "creativity-forest", domain: "creativity-storytelling", character: "fern" } as const;
const SEL = { world: "creativity-forest", domain: "social-emotional", character: "fern" } as const;

export const EXTRA_NUMBER_ACTIVITIES = [
  activity({ ...N, id: "count-the-toy-cars", title: "Count the Toy Cars", description: "Count little groups of toy cars.", obj: ["MATH-CNT-01"],
    instructions: "Tap each car to count it. Then tap the number.", tags: ["counting", "vehicles"], mission: "Count the cars you see on a walk." }, "count-collect", [
    CNT("r1", "How many cars?", "🚗", 2, [1, 2, 3], ["Touch each car once.", "Count: one, two."]),
    CNT("r2", "How many buses?", "🚌", 3, [2, 3, 4], ["Touch each bus once."]),
    CNT("r3", "How many trucks?", "🚚", 3, [3, 4, 2], ["Touch each truck once."]),
  ]),
  activity({ ...N, id: "count-the-sea-friends", title: "Count the Sea Friends", description: "Count fish, shells and other sea friends up to five.", obj: ["MATH-CNT-02"], difficulty: 2,
    instructions: "Tap each sea friend to count. Then tap the number.", tags: ["counting", "sea"] }, "count-collect", [
    CNT("r1", "How many fish?", "🐟", 4, [3, 4, 5], ["Tap each fish once.", "Say the numbers slowly."]),
    CNT("r2", "How many shells?", "🐚", 5, [4, 5, 6], ["Tap each shell once.", "The last number you say is how many."]),
    CNT("r3", "How many crabs?", "🦀", 4, [4, 3, 5], ["Tap each crab once."]),
  ]),
  activity({ ...N, id: "count-the-garden-bugs", title: "Count the Garden Bugs", description: "Count bigger groups of garden bugs up to ten.", obj: ["MATH-CNT-03"], difficulty: 3, minutes: 4,
    instructions: "Tap each bug to count it. Take your time!", tags: ["counting", "garden"], mission: "Count flowers or leaves in the garden." }, "count-collect", [
    CNT("r1", "How many ladybirds?", "🐞", 7, [6, 7, 8], ["Tap each one once.", "Count from left to right."]),
    CNT("r2", "How many bees?", "🐝", 9, [8, 9, 10], ["Tap each bee so you know it is counted."]),
    CNT("r3", "How many snails?", "🐌", 6, [5, 6, 7], ["Tap each snail once."]),
  ]),
  activity({ ...N, id: "feed-the-bunny", title: "Feed the Bunny", description: "Give the bunny exactly the number of treats asked for.", obj: ["MATH-SUB-01"], difficulty: 2,
    instructions: "Tap treats to give them to the bunny. Stop at the right number!", audio: "The bunny is hungry! Give the bunny the number of treats I ask for.", tags: ["rabbit", "counting"] }, "count-collect", [
    GIVE("r1", "Give the bunny 2 carrots.", "🥕", 5, 2, "🐰|the bunny", ["Count as you give.", "Stop when you reach two."]),
    GIVE("r2", "Give the bunny 4 lettuce leaves.", "🥬", 7, 4, "🐰|the bunny", ["Count as you give."]),
    GIVE("r3", "Give the bunny 1 strawberry.", "🍓", 5, 1, "🐰|the bunny", ["One is just a single one."]),
  ]),
  activity({ ...N, id: "pack-the-picnic", title: "Pack the Picnic", description: "Put the right number of treats in the picnic basket.", obj: ["MATH-SUB-01"], difficulty: 3,
    instructions: "Tap to put things in the basket. Stop at the right number!", tags: ["picnic", "counting"], mission: "Ask your child to get you 3 spoons." }, "count-collect", [
    GIVE("r1", "Put 3 sandwiches in the basket.", "🥪", 6, 3, "🧺|the picnic basket", ["Count out loud as you put them in."]),
    GIVE("r2", "Put 5 grapes in the basket.", "🍇", 8, 5, "🧺|the picnic basket", ["Count out loud as you put them in."]),
    GIVE("r3", "Put 4 cookies in the basket.", "🍪", 7, 4, "🧺|the picnic basket", ["Count out loud as you put them in."]),
  ]),
  activity({ ...N, id: "more-or-fewer-on-the-farm", title: "More or Fewer on the Farm", description: "Compare groups of farm animals.", obj: ["MATH-CMP-01"],
    instructions: "Look at both groups. Tap the one asked for.", tags: ["compare", "farm"] }, "tap-choose", [
    T("r1", "Which group has more?", ["🐔🐔🐔🐔|four hens", "🐔🐔|two hens"], [0], { hints: ["Count each group.", "Line them up side by side."] }),
    T("r2", "Which group has fewer?", ["🐄🐄🐄🐄🐄|five cows", "🐄🐄|two cows"], [1], { hints: ["Fewer means not as many."] }),
    T("r3", "Which group has more?", ["🐑🐑🐑|three sheep", "🐑🐑🐑🐑🐑🐑|six sheep"], [1], { hints: ["Count each group."] }),
    T("r4", "Which group has fewer?", ["🐖🐖🐖🐖|four pigs", "🐖|one pig", "🐖🐖🐖|three pigs"], [1], { hints: ["Which group has the smallest number?"] }),
  ]),
  activity({ ...N, id: "find-the-same-number", title: "Find the Same Number", description: "Find the group with the same number of things.", obj: ["MATH-CMP-01"], difficulty: 2,
    instructions: "Count the first group. Tap the group with the same number.", tags: ["compare", "same"] }, "tap-choose", [
    T("r1", "Which group has the same number as this one?", ["🍎🍎🍎|three apples", "🍎🍎|two apples", "🍎🍎🍎🍎🍎|five apples"], [0], { display: "🍌🍌🍌", hints: ["Count the bananas first: how many?"] }),
    T("r2", "Which group has the same number as this one?", ["⭐⭐⭐⭐|four stars", "⭐⭐|two stars", "⭐⭐⭐|three stars"], [0], { display: "🌙🌙🌙🌙", hints: ["Count the moons first."] }),
    T("r3", "Which group has the same number as this one?", ["🐟🐟🐟|three fish", "🐟🐟|two fish", "🐟🐟🐟🐟|four fish"], [1], { display: "🐠🐠", hints: ["Count the first group, then look for the same."] }),
  ]),
  activity({ ...N, id: "match-the-numbers-to-dots", title: "Match the Numbers to Dots", description: "Match numerals 3, 4 and 5 to the right number of dots.", obj: ["MATH-NUM-01"], difficulty: 2,
    instructions: "Tap a number, then tap the dots that match.", tags: ["numerals"] }, "match-pair", [
    PAIRS("r1", "Match each number to its dots.", [["3|number three", "⚫⚫⚫|three dots"], ["4|number four", "⚫⚫⚫⚫|four dots"], ["5|number five", "⚫⚫⚫⚫⚫|five dots"]], ["Count the dots first."]),
    PAIRS("r2", "Match each number to its dots.", [["1|number one", "⚫|one dot"], ["2|number two", "⚫⚫|two dots"], ["4|number four", "⚫⚫⚫⚫|four dots"]], ["Count the dots first."]),
  ]),
  activity({ ...N, id: "number-line-gaps", title: "Number Line Gaps", description: "Find the missing number in a short number line.", obj: ["MATH-NUM-02"], difficulty: 2,
    instructions: "A number is hiding. Tap the one that fits.", tags: ["numbers", "order"] }, "complete-pattern", [
    PAT("r1", "Which number is missing?", ["1", "2", "?", "4"], ["3", "5", "1"], 0, ["Say them in order: one, two, ...", "What comes after two?"]),
    PAT("r2", "Which number is missing?", ["2", "3", "4", "?"], ["5", "2", "7"], 0, ["Count on: two, three, four, ..."]),
    PAT("r3", "Which number is missing?", ["3", "?", "5", "6"], ["4", "2", "7"], 0, ["What comes after three?"]),
  ]),
  activity({ ...N, id: "one-fewer-snack", title: "One Fewer Snack", description: "Work out how many are left when one is taken away.", obj: ["MATH-SUB-02"], difficulty: 2,
    instructions: "Watch what is taken away. How many are left?", tags: ["take away"] }, "tap-choose", [
    T("r1", "There were 3 cookies. One was eaten. How many are left?", ["🍪🍪|two", "🍪🍪🍪|three", "🍪|one"], [0], { display: "🍪🍪🍪", hints: ["Cover one cookie with your hand. Count what is left."] }),
    T("r2", "There were 4 strawberries. One was eaten. How many are left?", ["🍓🍓🍓|three", "🍓🍓🍓🍓|four", "🍓🍓|two"], [0], { display: "🍓🍓🍓🍓", hints: ["Take one away and count again."] }),
    T("r3", "There were 2 balloons. One floated away. How many are left?", ["🎈|one", "🎈🎈|two", "🎈🎈🎈|three"], [0], { display: "🎈🎈", hints: ["Two take one away leaves... count it!"] }),
  ]),
  activity({ ...N, id: "sort-by-colour", title: "Sort by Colour", description: "Sort things into red and yellow baskets.", obj: ["MATH-SRT-01"],
    instructions: "Tap a thing, then tap the basket with its colour.", tags: ["sorting", "colour"] }, "match-pair", [
    SORT("r1", "Which things are red and which are yellow?", ["🔴|red basket", "🟡|yellow basket"],
      [["🍎|apple", 0], ["🍌|banana", 1], ["🍓|strawberry", 0], ["🌻|sunflower", 1]], ["Look at the colour of each one."]),
    SORT("r2", "Which things are green and which are blue?", ["🟢|green basket", "🔵|blue basket"],
      [["🐸|frog", 0], ["🐳|whale", 1], ["🥦|broccoli", 0], ["🧢|blue cap", 1]], ["Look at the colour of each one."]),
  ]),
  activity({ ...N, id: "pattern-parade", title: "Pattern Parade", description: "Say what comes next in a repeating pattern.", obj: ["MATH-PAT-01"],
    instructions: "Look at the pattern. What comes next?", tags: ["pattern"] }, "complete-pattern", [
    PAT("r1", "What comes next?", ["🔴", "🔵", "🔴", "🔵", "?"], ["🔴|red", "🔵|blue", "🟢|green"], 0, ["Say it: red, blue, red, blue...", "What comes after blue?"]),
    PAT("r2", "What comes next?", ["🟡", "🟡", "🟢", "🟡", "🟡", "?"], ["🟢|green", "🟡|yellow", "🔴|red"], 0, ["Two yellows, then a green."]),
    PAT("r3", "What comes next?", ["🌸", "🌼", "🌸", "🌼", "?"], ["🌸|pink flower", "🌼|yellow flower", "🌷|tulip"], 0, ["Pink, yellow, pink, yellow..."]),
  ]),
];

export const EXTRA_PUZZLE_ACTIVITIES = [
  activity({ ...P, id: "odd-one-out-animals", title: "Odd One Out: Animals", description: "Find the animal that does not belong.", obj: ["LOG-ODD-01"],
    instructions: "One of these does not belong. Can you find it?", tags: ["classification", "animals"] }, "tap-choose", [
    T("r1", "Which one is the odd one out?", ["🐟|fish", "🐬|dolphin", "🐘|elephant", "🐙|octopus"], [2], { hints: ["Which one does not live in the sea?"] }),
    T("r2", "Which one is the odd one out?", ["🐦|bird", "🦋|butterfly", "🐝|bee", "🐕|dog"], [3], { hints: ["Which one cannot fly?"] }),
    T("r3", "Which one is the odd one out?", ["🐄|cow", "🐖|pig", "🐑|sheep", "🦈|shark"], [3], { hints: ["Which one does not live on a farm?"] }),
  ]),
  activity({ ...P, id: "odd-one-out-things", title: "Odd One Out: Things", description: "Spot the thing that is different from the others.", obj: ["LOG-ODD-01"], difficulty: 2,
    instructions: "Three of these go together. Which one is different?", tags: ["classification"] }, "tap-choose", [
    T("r1", "Which one is the odd one out?", ["👕|shirt", "👖|trousers", "🧦|sock", "🍞|bread"], [3], { hints: ["Which one can we not wear?"] }),
    T("r2", "Which one is the odd one out?", ["🪑|chair", "🛏️|bed", "🛋️|sofa", "🌧️|rain"], [3], { hints: ["Which one is not furniture in a house?"] }),
    T("r3", "Which one is the odd one out?", ["🥄|spoon", "🍴|fork", "🔪|knife", "🧸|teddy"], [3], { hints: ["Which one do we not eat with?"] }),
  ]),
  activity({ ...P, id: "match-the-opposites", title: "Match the Opposites", description: "Match each thing to its opposite.", obj: ["LOG-MTC-01"], difficulty: 2,
    instructions: "Tap a picture, then tap its opposite.", tags: ["opposites", "matching"] }, "match-pair", [
    PAIRS("r1", "Match the opposites.", [["☀️|hot", "❄️|cold"], ["⬆️|up", "⬇️|down"], ["🌞|day", "🌙|night"]], ["What is the opposite of this?"]),
    PAIRS("r2", "Match the opposites.", [["😊|happy", "😢|sad"], ["🐘|big", "🐭|small"], ["🚪|open", "🔒|closed"]], ["Think: if this is big, what is not big?"]),
  ]),
  activity({ ...P, id: "match-the-tools", title: "Match the Tools", description: "Match tools to the things they are used with.", obj: ["LOG-MTC-01"],
    instructions: "Tap a picture, then tap the one that goes with it.", tags: ["matching", "tools"] }, "match-pair", [
    PAIRS("r1", "Match the things that go together.", [["🖌️|paintbrush", "🎨|paint"], ["✂️|scissors", "📄|paper"], ["🪣|bucket", "🏖️|sand"]], ["Which one goes with this?"]),
    PAIRS("r2", "Match the things that go together.", [["🧽|sponge", "🛁|bath"], ["🧹|broom", "🗑️|dustbin"], ["🔑|key", "🔒|lock"]]),
  ]),
  activity({ ...P, id: "sort-the-fruit-and-veg", title: "Sort the Fruit and Veg", description: "Sort foods into fruit and vegetable baskets.", obj: ["LOG-CLS-01"], difficulty: 2,
    instructions: "Tap a food, then tap the right basket.", tags: ["sorting", "food"] }, "match-pair", [
    SORT("r1", "Which are fruits and which are vegetables?", ["🍎|fruit", "🥕|vegetable"],
      [["🍌|banana", 0], ["🥦|broccoli", 1], ["🍇|grapes", 0], ["🌽|corn", 1]], ["Fruits are sweet and grow on trees or bushes."]),
  ]),
  activity({ ...P, id: "sort-day-and-night", title: "Sort Day and Night", description: "Sort things we see in the day and at night.", obj: ["LOG-CLS-01"],
    instructions: "Tap a picture, then tap day or night.", tags: ["sorting", "day and night"] }, "match-pair", [
    SORT("r1", "What do we see in the day and what at night?", ["☀️|day", "🌙|night"],
      [["🌈|rainbow", 0], ["⭐|stars", 1], ["🦉|owl", 1], ["🏖️|beach", 0]], ["Is the sun out, or the moon?"]),
  ]),
  activity({ ...P, id: "colour-pattern-puzzles", title: "Colour Pattern Puzzles", description: "Work out harder repeating patterns.", obj: ["LOG-PAT-01"], difficulty: 3,
    instructions: "Look carefully. What comes next in the pattern?", tags: ["pattern"] }, "complete-pattern", [
    PAT("r1", "What comes next?", ["🔴", "🟡", "🟡", "🔴", "🟡", "?"], ["🟡|yellow", "🔴|red", "🔵|blue"], 0, ["Red, yellow, yellow, then it starts again."]),
    PAT("r2", "What comes next?", ["🐸", "🐟", "🐸", "🐟", "🐸", "?"], ["🐟|fish", "🐸|frog", "🐢|turtle"], 0, ["Frog, fish, frog, fish..."]),
    PAT("r3", "What comes next?", ["🔺", "🔺", "⬛", "🔺", "🔺", "?"], ["⬛|square", "🔺|triangle", "🔵|circle"], 0, ["Two triangles, then a square."]),
  ]),
  activity({ ...P, id: "watch-it-grow", title: "Watch It Grow", description: "Put pictures of a growing plant in order.", obj: ["LOG-SEQ-01"], difficulty: 2,
    instructions: "Tap the pictures in the order they happen.", tags: ["sequence", "plants"] }, "complete-pattern", [
    ORD("r1", "A plant grows. Tap in order.", ["🌰|seed", "🌱|tiny sprout", "🌿|leaves", "🌻|flower"], ["What do we plant first?"]),
    ORD("r2", "Making a sandwich. Tap in order.", ["🍞|two slices of bread", "🧈|spread butter", "🧀|add cheese", "🥪|ready to eat"], ["What do we need first?"]),
  ]),
  activity({ ...P, id: "whats-missing-now", title: "What's Missing Now?", description: "Look at some things, then find the one that went missing.", obj: ["LOG-MEM-01"], difficulty: 2,
    instructions: "Look at the things and say their names. Tap Hide, then find the missing one.", tags: ["memory"], mission: "Hide one thing from a tray of three and see if your child notices." }, "tap-choose", [
    T("r1", "Which one went missing?", ["🦆|duck", "🐸|frog", "🐢|turtle"], [0], { study: ["🐸", "🐢", "🦆"], hideIndex: 2, hideLabel: "Hide one", hints: ["Say their names: frog, turtle."] }),
    T("r2", "Which one went missing?", ["🍪|cookie", "🍩|doughnut", "🧁|cupcake", "🍰|cake"], [2], { study: ["🍪", "🍩", "🧁", "🍰"], hideIndex: 2, hideLabel: "Hide one", hints: ["Say their names: cookie, doughnut, cake."] }),
  ]),
  activity({ ...P, id: "what-happens-next-puzzle", title: "What Happens Next?", description: "Think about what happens when something changes.", obj: ["LOG-CAU-01"], difficulty: 2,
    instructions: "Think about what happens. Then tap your answer.", tags: ["cause and effect"] }, "tap-choose", [
    T("r1", "An ice lolly sits in the hot sun. What happens?", ["💧|it melts", "❄️|it gets bigger", "🔥|it turns into a fire"], [0], { display: "🍦☀️", hints: ["Think about ice on a hot day."], explain: "Heat makes ice melt." }),
    T("r2", "You push a ball on the floor. What happens?", ["⚽|it rolls", "🪽|it grows wings", "💤|it falls asleep"], [0], { display: "👉⚽", hints: ["Have you ever kicked a ball?"] }),
    T("r3", "You water a seed. What happens after a while?", ["🌱|it grows", "🍕|it turns into pizza", "🔇|nothing at all"], [0], { display: "🌰💧", hints: ["Plants need water to grow."] }),
  ]),
  activity({ ...P, id: "find-the-hidden-rule", title: "Find the Hidden Rule", description: "Work out what the things have in common.", obj: ["LOG-CLS-01"], difficulty: 3,
    instructions: "These things have something in common. Which one belongs with them?", tags: ["rules", "classification"] }, "tap-choose", [
    T("r1", "These are all red. Which one belongs with them?", ["🍅|tomato", "🥒|cucumber", "🍌|banana"], [0], { display: "🍎🍓🌹", hints: ["Look at the colour."] }),
    T("r2", "These are all round. Which one belongs with them?", ["⚽|ball", "📕|book", "🔺|triangle"], [0], { display: "🌕🍪🍊", hints: ["Which one is round like the others?"] }),
    T("r3", "These can all fly. Which one belongs with them?", ["🦅|eagle", "🐘|elephant", "🐢|turtle"], [0], { display: "🐦🦋🐝", hints: ["Which one has wings?"] }),
  ]),
];

export const EXTRA_CREATIVITY_ACTIVITIES = [
  activity({ ...CRE, id: "the-magic-paintbrush", title: "The Magic Paintbrush", description: "Imagine what you would paint with a magic paintbrush.", obj: ["CRE-STY-01"], difficulty: 2, minutes: 4,
    instructions: "Fern has a magic paintbrush. What will you paint?", tags: ["story", "imagination", "art"], mission: "Draw what you would paint with a magic brush." }, "listen-respond", [
    LR("r1", "Anything you paint with this magic brush comes to life! What would you paint?", { display: "🖌️✨", maxTurns: 2,
      concepts: [["animal", ["animal", "dog", "cat", "dragon", "elephant", "bird", "fish"], "An animal! What would it do first?"], ["food", ["cake", "food", "pizza", "ice cream", "cookie"], "Yummy! Would you share it?"], ["place", ["house", "castle", "garden", "beach", "park"], "A wonderful place! Who would live there?"]],
      quick: [["🐉", "A dragon", "animal"], ["🍰", "A big cake", "food"], ["🏰", "A castle", "place"], ["🌈", "A rainbow"]], model: "I would paint a friendly dragon.", fallback: "What a magical idea! I love it." }),
    LR("r2", "Your painting wakes up and says hello! What do you say back?", { display: "👋", maxTurns: 2,
      concepts: [["hello", ["hello", "hi", "hey"], "Hello! What a lovely way to say hi."], ["name", ["name", "called"], "What a great name! It is happy to meet you."]],
      quick: [["👋", "Hello, I'm glad to meet you", "hello"], ["🙂", "What is your name?", "name"]], model: "Hello! I'm glad to meet you.", fallback: "Lovely! It likes your words." }),
  ]),
  activity({ ...CRE, id: "design-a-friendly-robot", title: "Design a Friendly Robot", description: "Invent a robot and tell Fern what it can do.", obj: ["CRE-IMG-01"], difficulty: 2, minutes: 4,
    instructions: "Imagine a friendly robot. What does it look like? What can it do?", tags: ["imagination", "describe", "robot"], mission: "Build a robot from boxes and tell someone what it does." }, "listen-respond", [
    LR("r1", "Let's invent a friendly robot. What can your robot do to help people?", { display: "🤖", maxTurns: 2,
      concepts: [["clean", ["clean", "tidy", "wash", "sweep"], "A cleaning robot! That would be very helpful."], ["play", ["play", "game", "dance", "sing"], "A playful robot! What game would it play?"], ["cook", ["cook", "bake", "food", "make"], "A cooking robot! What would it make?"]],
      quick: [["🧹", "It helps tidy up", "clean"], ["🎲", "It plays games", "play"], ["🍳", "It cooks yummy food", "cook"], ["🌱", "It waters the plants"]], model: "My robot plays games and helps tidy up.", fallback: "What a clever robot! Tell me more.", followUps: ["What is your robot's name?", "What colour is it?"] }),
  ]),
  activity({ ...CRE, id: "pick-a-dragon-colour", title: "Pick a Dragon Colour", description: "Choose the colour and look of a friendly dragon. There are no wrong choices.", obj: ["CRE-IMG-01"], difficulty: 1,
    instructions: "Fern is dreaming up a dragon. What will it be like?", tags: ["imagination", "choices"] }, "tap-choose", [
    T("r1", "What colour is your friendly dragon?", ["💚|green", "💜|purple", "🧡|orange", "🌈|rainbow"], [], { display: "🐉", open: true,
      openReply: ["A green dragon, just like the leaves!", "A purple dragon! How royal.", "An orange dragon, as bright as a sunset!", "A rainbow dragon! The most colourful of all."] }),
    T("r2", "What does your dragon love to do?", ["🔥|make warm toast", "🎵|sing songs", "🪽|fly with the birds"], [], { display: "🐉", open: true,
      openReply: ["Warm toast! Everyone will want to be its friend.", "Singing dragons make everyone smile.", "Flying high above the trees. What a view!"] }),
  ]),
  activity({ ...CRE, id: "choose-a-forest-adventure", title: "Choose a Forest Adventure", description: "Pick what happens next in a story. There is no wrong choice.", obj: ["CRE-END-01"], difficulty: 1,
    instructions: "Which ending do you like best?", tags: ["story", "choices"] }, "tap-choose", [
    T("r1", "A little fox found a shiny key under a leaf. What does it open?", ["🧰|a box of toys", "🏠|a tiny house", "🌟|a door to the stars"], [], { display: "🦊🔑", open: true,
      openReply: ["A box of toys! Let's play!", "A tiny house! Who lives inside?", "A door to the stars! How magical."] }),
    T("r2", "The fox followed a little path. Where does it lead?", ["🌊|to a sparkly pond", "🍓|to a berry patch", "🎪|to a forest party"], [], { display: "🦊🛤️", open: true,
      openReply: ["A sparkly pond! The fox can see its reflection.", "Yummy berries! Will the fox share?", "A party! Everyone is dancing."] }),
  ]),
  activity({ ...CRE, id: "story-ending-at-bedtime", title: "A Bedtime Story Ending", description: "Choose how a cosy bedtime story ends.", obj: ["CRE-END-01"], difficulty: 1,
    instructions: "Pick the ending you like best.", tags: ["story", "bedtime"] }, "tap-choose", [
    T("r1", "The sleepy owl looked at the moon. How does the story end?", ["🛏️|she flew home to bed", "🌟|she counted the stars", "🤝|a friend said goodnight"], [], { display: "🦉🌙", open: true,
      openReply: ["Cosy in bed. Sweet dreams!", "Twinkle, twinkle! Lots of stars.", "Goodnight, friend. What a kind ending."] }),
    T("r2", "The little bear was too excited to sleep. What helped?", ["🎵|a soft lullaby", "🧸|a cuddly teddy", "📖|a gentle story"], [], { display: "🐻", open: true,
      openReply: ["A lullaby, la la la.", "A cuddly teddy makes everyone feel safe.", "A gentle story and then yawn... sleep."] }),
  ]),
  activity({ ...CRE, id: "build-a-secret-den", title: "Build a Secret Den", description: "Imagine and describe a secret den in the forest.", obj: ["CRE-STY-01"], difficulty: 2, minutes: 4,
    instructions: "Let's imagine a secret den. What is inside?", tags: ["imagination", "story"], mission: "Build a den with blankets and cushions." }, "listen-respond", [
    LR("r1", "You found a secret den in the forest. What is inside?", { display: "🏕️", maxTurns: 2,
      concepts: [["toys", ["toy", "teddy", "ball", "game", "book"], "Toys! A perfect den for playing."], ["food", ["snack", "cake", "food", "cookie", "juice"], "Snacks! Who will you share them with?"], ["animal", ["animal", "bunny", "squirrel", "owl", "bear"], "An animal friend! Is it shy or brave?"]],
      quick: [["🧸", "Lots of toys", "toys"], ["🍪", "Yummy snacks", "food"], ["🐿️", "A squirrel friend", "animal"], ["🌟", "Magic lights"]], model: "Inside the den there are lots of toys and a squirrel friend.", fallback: "What a cosy idea! I want to go there." }),
  ]),
  activity({ ...SEL, id: "how-do-they-feel-today", title: "How Do They Feel Today?", description: "Notice how animals and people feel in different moments.", obj: ["SEL-EMO-01"], difficulty: 2,
    instructions: "Look at what happened. How do they feel?", tags: ["feelings"], mission: "Talk about how characters feel in a bedtime story." }, "tap-choose", [
    T("r1", "How does the duck feel?", ["😊|happy", "😢|sad", "😠|angry"], [0], { display: "🦆🌦️", hints: ["The duck loves puddles! What is the weather?"] }),
    T("r2", "How does the bear feel?", ["😢|sad", "😊|happy", "🤩|excited"], [0], { display: "🐻🍯", hints: ["The honey pot is empty. How would you feel?"] }),
    T("r3", "How does the girl feel?", ["😨|scared", "😊|happy", "😴|sleepy"], [0], { display: "👧🌑", hints: ["It is dark and she hears a noise."] }),
    T("r4", "How does the boy feel?", ["😴|sleepy", "🤩|excited", "😠|angry"], [0], { display: "👦🛏️", hints: ["It is bedtime and his eyes are closing."] }),
  ]),
  activity({ ...SEL, id: "kind-words", title: "Kind Words", description: "Choose the kind words that make friends feel good.", obj: ["SEL-PRB-01"], difficulty: 1,
    instructions: "Which words are kind? Tap the kind ones.", tags: ["kindness", "words"] }, "tap-choose", [
    T("r1", "Which words are kind?", ["🙏|please and thank you", "😠|give me that", "🤐|you can't play"], [0], { hints: ["Which words would make you smile?"] }),
    T("r2", "Your friend drew a picture. What could you say?", ["🎨|I like your picture", "🙄|that is silly", "🚶|nothing, walk away"], [0], { hints: ["Which words make a friend feel proud?"] }),
    T("r3", "You bumped into a friend by accident. What could you say?", ["🙂|sorry, are you okay?", "😡|get out of my way", "🙈|pretend it did not happen"], [0], { hints: ["Which words show you care?"] }),
  ]),
  activity({ ...SEL, id: "helping-a-friend-who-fell", title: "Helping a Friend Who Fell", description: "Think of kind and safe ways to help a friend who is hurt.", obj: ["SEL-EMP-01"], difficulty: 2,
    instructions: "A friend has had a fall. What can we do to help?", tags: ["empathy", "safety"] }, "tap-choose", [
    T("r1", "Your friend fell down and is crying. What could you do?", ["🧑‍🤝‍🧑|get a grown-up to help", "😆|laugh", "🏃|run away"], [0], { display: "🧒😢", hints: ["Who can look after a hurt friend?"], explain: "Getting a grown-up is a kind and safe way to help." }),
    T("r2", "Your friend feels better. What could you say?", ["🤗|are you okay now?", "🙄|you are silly", "🚶|nothing"], [0], { display: "🧒🩹", hints: ["How can you show you care?"] }),
  ]),
  activity({ ...SEL, id: "share-the-snacks", title: "Share the Snacks", description: "Choose kind ways to share and take turns.", obj: ["SEL-PRB-01"], difficulty: 2,
    instructions: "Think about what you could do. Pick a kind choice.", tags: ["sharing", "kindness"], mission: "Share a snack and say please and thank you." }, "tap-choose", [
    T("r1", "You have three cookies and two friends. What could you do?", ["🤝|share so everyone has some", "😋|eat them all", "🙈|hide them"], [0], { display: "🍪🍪🍪", hints: ["How can everyone get a cookie?"] }),
    T("r2", "A new friend has no one to play with. What could you do?", ["👋|ask them to play", "🚶|walk away", "🙈|ignore them"], [0], { display: "🧒", hints: ["How would you feel if you were new?"] }),
    T("r3", "You both want to be first on the slide. What could you do?", ["🔁|take turns", "💪|push in front", "😡|shout"], [0], { display: "🛝", hints: ["Could you go one after the other?"] }),
  ]),
];
