import { activity, LR, ORD, PAIRS, PAT, SORT, T } from "../builders";

const P = { world: "puzzle-planet", domain: "logic-puzzles", character: "pip" } as const;
const WW = { world: "wonder-world", character: "otto" } as const;
const CF = { world: "creativity-forest", character: "fern" } as const;

export const PUZZLE_ACTIVITIES = [
  activity({ ...P, id: "find-the-odd-one-out", title: "Find the Odd One Out", description: "Find the picture that does not belong.", obj: ["LOG-ODD-01"], difficulty: 2,
    instructions: "One of these does not belong. Can you find it?", tags: ["classification"] }, "tap-choose", [
    T("r1", "Which one is the odd one out?", ["🍎|apple", "🍌|banana", "🚗|car", "🍇|grapes"], [2], { hints: ["Which ones can you eat?", "Three are fruits."] }),
    T("r2", "Which one is the odd one out?", ["🐶|dog", "🐱|cat", "🐟|fish", "🌳|tree"], [3], { hints: ["Which one is not an animal?"] }),
    T("r3", "Which one is the odd one out?", ["🚗|car", "🚌|bus", "✈️|aeroplane", "🚲|bicycle"], [2], { hints: ["Which one flies in the sky?", "Three travel on roads."], explain: "The aeroplane flies. The others travel on roads." }),
  ]),
  activity({ ...P, id: "match-the-shadows", title: "Match the Shadows", description: "Match each picture to its shadow.", obj: ["LOG-SPA-01"], difficulty: 2,
    instructions: "Tap a picture, then tap its dark shadow.", tags: ["shadows", "spatial"], mission: "Make shadow shapes with a torch and your hands." }, "match-pair", [
    PAIRS("r1", "Match each animal to its shadow.", [["🐘|elephant", "~🐘|elephant shadow"], ["🦆|duck", "~🦆|duck shadow"], ["🐢|turtle", "~🐢|turtle shadow"]], ["Look at the shape of the shadow."]),
    PAIRS("r2", "Match each picture to its shadow.", [["🌳|tree", "~🌳|tree shadow"], ["🚗|car", "~🚗|car shadow"], ["⭐|star", "~⭐|star shadow"]], ["Look at the outline."]),
  ]),
  activity({ ...P, id: "complete-the-pattern", title: "Complete the Pattern", description: "Work out longer patterns.", obj: ["LOG-PAT-01"], difficulty: 3,
    instructions: "Look carefully. What comes next in the pattern?", tags: ["pattern"] }, "complete-pattern", [
    PAT("r1", "What comes next?", ["⭐", "⭐", "🌙", "⭐", "⭐", "?"], ["🌙|moon", "⭐|star", "☀️|sun"], 0, ["Say it: star, star, moon, star, star...", "After two stars comes a moon."]),
    PAT("r2", "What comes next?", ["🍎", "🍌", "🍇", "🍎", "🍌", "?"], ["🍇|grapes", "🍎|apple", "🍌|banana"], 0, ["The pattern goes apple, banana, grapes. Then it starts again."]),
    PAT("r3", "What comes next?", ["🐱", "🐱", "🐶", "🐱", "🐱", "?"], ["🐶|dog", "🐱|cat", "🐰|rabbit"], 0, ["Two cats, then a dog."]),
  ]),
  activity({ ...P, id: "what-comes-next", title: "What Comes Next?", description: "Think about what comes next in a daily routine.", obj: ["LOG-SEQ-01"], difficulty: 2,
    instructions: "Look at the pictures. What comes next?", tags: ["routine", "sequence"] }, "complete-pattern", [
    PAT("r1", "What comes next in the day?", ["🌅", "☀️", "🌇", "?"], ["🌙|night with a moon", "🌅|sunrise", "☀️|bright sun"], 0, ["The day goes morning, noon, evening...", "What comes after evening?"]),
    PAT("r2", "What do we do next?", ["🛁", "🧴", "👕", "?"], ["😴|sleep", "🏊|swim", "🍔|burger"], 0, ["What do we do after we put on pyjamas?"]),
  ]),
  activity({ ...P, id: "remember-the-missing-object", title: "Remember the Missing Object", description: "Look at some things, then find the one that went missing.", obj: ["LOG-MEM-01"], difficulty: 2,
    instructions: "Look at the things and say their names. Tap Hide, then find the missing one.", tags: ["memory"], mission: "Put four toys in a row. Close your eyes while a grown-up hides one." }, "tap-choose", [
    T("r1", "Which one went missing?", ["🚗|car", "🧸|teddy", "⚽|ball"], [0], { study: ["🧸", "⚽", "🚗"], hideIndex: 2, hideLabel: "Hide one", hints: ["Say their names: teddy, ball."] }),
    T("r2", "Which one went missing?", ["🍎|apple", "🍌|banana", "🍇|grapes", "🍓|strawberry"], [1], { study: ["🍎", "🍌", "🍇", "🍓"], hideIndex: 1, hideLabel: "Hide one", hints: ["Say their names: apple, banana, grapes, strawberry."] }),
  ]),
  activity({ ...P, id: "sort-the-animals", title: "Sort the Animals", description: "Sort animals by where they live.", obj: ["LOG-CLS-01"], difficulty: 2,
    instructions: "Tap an animal, then tap where it lives.", tags: ["sorting", "animals"] }, "match-pair", [
    SORT("r1", "Which animals live on land and which live in water?", ["🌳|land", "🌊|water"],
      [["🐘|elephant", 0], ["🐟|fish", 1], ["🐕|dog", 0], ["🐬|dolphin", 1]], ["Can it swim all day?"]),
    SORT("r2", "Which animals have wings and which have no wings?", ["🪽|has wings", "🐾|no wings"],
      [["🐦|bird", 0], ["🐈|cat", 1], ["🦋|butterfly", 0], ["🐄|cow", 1]], ["Can it fly?"]),
  ]),
  activity({ ...P, id: "match-the-pairs", title: "Match the Pairs", description: "Match things that go together.", obj: ["LOG-MTC-01"], difficulty: 1,
    instructions: "Tap a picture, then tap the one that goes with it.", tags: ["matching"], mission: "Match socks from the laundry basket." }, "match-pair", [
    PAIRS("r1", "Match the things that go together.", [["👟|shoe", "🧦|sock"], ["🪥|toothbrush", "🦷|tooth"], ["☂️|umbrella", "🌧️|rain"]], ["Which one goes with this?"]),
    PAIRS("r2", "Match the things that go together.", [["🍽️|plate", "🍴|fork"], ["🛏️|bed", "🌙|night"], ["🐝|bee", "🌼|flower"]]),
  ]),
  activity({ ...P, id: "put-the-pictures-in-order", title: "Put the Pictures in Order", description: "Order the pictures of a morning routine.", obj: ["LOG-SEQ-01"], difficulty: 2,
    instructions: "Tap the pictures in the order they happen.", tags: ["sequence", "routine"] }, "complete-pattern", [
    ORD("r1", "Getting ready. Tap in order.", ["⏰|wake up", "🪥|brush teeth", "🥣|eat breakfast", "🎒|go out"], ["What do you do first when you wake up?"]),
    ORD("r2", "Washing hands. Tap in order.", ["🚰|wet hands", "🧼|use soap", "🙌|rub hands", "🧻|dry hands"], ["What comes first?"]),
  ]),
  activity({ ...P, id: "help-the-rabbit-find-home", title: "Help the Rabbit Find Home", description: "Choose the path that gets Pip to the burrow.", obj: ["LOG-SPA-01"], difficulty: 3,
    instructions: "Pip the Rabbit wants to go home. Which path takes Pip to the burrow?", tags: ["planning", "path"] }, "tap-choose", [
    T("r1", "Which path takes the rabbit to the burrow 🕳️?", ["🐰➡️➡️🕳️|right, right, to the burrow", "🐰⬅️⬅️🕳️|left, left, away", "🐰⬆️🪨🕳️|up, into a rock"], [0], { display: "🐰    🕳️", hints: ["The burrow is on the right. Which way is right?"] }),
    T("r2", "Which path takes the rabbit to the carrot 🥕?", ["🐰⬆️⬆️🥕|up, up to the carrot", "🐰⬇️⬇️🥕|down, away", "🐰⬆️💧🥕|up, into a pond"], [0], { display: "🥕\n⬆️\n🐰", hints: ["The carrot is above Pip."] }),
  ]),
];

const SCI = { ...WW, domain: "science-knowledge" } as const;
export const WONDER_ACTIVITIES = [
  activity({ ...SCI, id: "find-the-animal-home", title: "Find the Animal Home", description: "Match each animal to its home.", obj: ["SCI-ANI-01"],
    instructions: "Tap an animal, then tap its home.", tags: ["animals", "habitats"] }, "match-pair", [
    PAIRS("r1", "Where do these animals live?", [["🐦|bird", "🪺|nest"], ["🐝|bee", "🍯|hive"], ["🐶|dog", "🏠|house"]], ["Where would it sleep?"]),
    PAIRS("r2", "Where do these animals live?", [["🐟|fish", "🌊|water"], ["🐻|bear", "🏔️|cave in the hills"], ["🐜|ant", "⛰️|anthill"]], ["Where would it feel safe?"]),
  ]),
  activity({ ...SCI, id: "animal-babies", title: "Animal Babies", description: "Match animal parents to their babies.", obj: ["SCI-ANI-02"],
    instructions: "Tap an animal, then tap its baby.", tags: ["animals", "babies"] }, "match-pair", [
    PAIRS("r1", "Match each animal to its baby.", [["🐄|cow", "🐮|calf"], ["🐔|hen", "🐥|chick"], ["🐑|sheep", "🐏|lamb"]], ["Babies are smaller."]),
  ]),
  activity({ ...SCI, id: "discover-the-five-senses", title: "Discover the Five Senses", description: "Link each sense to the body part we use.", obj: ["SCI-SEN-01"], difficulty: 2,
    instructions: "Tap a body part, then tap what it helps us do.", tags: ["senses", "body"], mission: "Mystery bag: feel an object without looking and guess what it is.",
    adult: "Choose safe objects for the mystery bag and avoid small items that could be choking hazards." }, "match-pair", [
    PAIRS("r1", "Which body part helps with each sense?", [["👁️|eye", "🌈|seeing colours"], ["👂|ear", "🎵|hearing music"], ["👃|nose", "🌸|smelling a flower"]], ["What do your ears do?"]),
    PAIRS("r2", "Which body part helps with each sense?", [["👅|tongue", "🍋|tasting"], ["🖐️|hand", "🧸|feeling something soft"], ["👁️|eye", "📖|seeing a book"]], ["What do you use to taste?"]),
  ]),
  activity({ ...SCI, id: "which-things-can-fly", title: "Which Things Can Fly?", description: "Pick the thing that can fly.", obj: ["SCI-FLY-01"],
    instructions: "Which one can fly? Tap it.", tags: ["flying"], mission: "Watch for birds and planes outside." }, "tap-choose", [
    T("r1", "Which one can fly?", ["🐦|bird", "🐢|turtle", "🐄|cow"], [0], { hints: ["Which one has wings?"] }),
    T("r2", "Which one can fly?", ["🚗|car", "✈️|aeroplane", "🚲|bicycle"], [1], { hints: ["Which one goes in the sky?"] }),
    T("r3", "Which one can fly?", ["🦋|butterfly", "🐟|fish", "🐕|dog"], [0], { hints: ["Which one has wings?"] }),
  ]),
  activity({ ...SCI, id: "where-does-rain-come-from", title: "Where Does Rain Come From?", description: "Find out where rain comes from.", obj: ["SCI-WTH-01"], difficulty: 2,
    instructions: "Think about the sky on a rainy day.", tags: ["weather", "rain"], mission: "Watch steam rise from a kettle and talk about how clouds are made of tiny drops.",
    adult: "An adult must handle the kettle. Keep children at a safe distance from steam." }, "tap-choose", [
    T("r1", "Where does rain come from?", ["☁️|clouds", "🌳|trees", "⛰️|mountains"], [0], { hints: ["Look up on a rainy day. What is in the sky?"], explain: "Rain falls from clouds." }),
    T("r2", "What do we see in the sky when it rains?", ["🌧️|rain clouds", "🌈|a rainbow only", "🌙|the moon"], [0], { hints: ["What colour are rain clouds?"] }),
  ]),
  activity({ ...SCI, id: "weather-wardrobe", title: "Weather Wardrobe", description: "Choose the right clothes for the weather.", obj: ["SCI-WTH-02"],
    instructions: "Look at the weather. What should we wear or take?", tags: ["weather", "clothes"], mission: "Look out of the window together and choose today's clothes." }, "tap-choose", [
    T("r1", "It is raining. What should we take?", ["☂️|umbrella", "🕶️|sunglasses", "🧣|beach ball"], [0], { display: "🌧️", hints: ["What keeps us dry?"] }),
    T("r2", "It is very sunny and hot. What should we wear?", ["👒|sun hat", "🧤|gloves", "🧥|thick coat"], [0], { display: "☀️", hints: ["What keeps the sun off your head?"] }),
    T("r3", "It is snowy and cold. What should we wear?", ["🧥|warm coat", "🩳|shorts", "👙|swimsuit"], [0], { display: "❄️", hints: ["What keeps us warm?"] }),
  ]),
  activity({ ...SCI, id: "explore-plants", title: "Explore Plants", description: "What do plants need to grow?", obj: ["SCI-NAT-01"], difficulty: 2,
    instructions: "Think about what a plant needs.", tags: ["plants"], mission: "Plant a bean in a clear jar and look at it every day." }, "tap-choose", [
    T("r1", "What do plants need to grow?", ["💧|water", "🍕|pizza", "🧸|toys"], [0], { display: "🌱", hints: ["What do we give a plant every day?"] }),
    T("r2", "What else helps plants grow?", ["☀️|sunshine", "🌙|moonlight only", "🍫|chocolate"], [0], { display: "🌱", hints: ["Plants like to be in the light."] }),
    T("r3", "Where do plant roots grow?", ["🟤|in the soil", "☁️|in the clouds", "🏠|on the roof"], [0], { display: "🌱", hints: ["Roots hold the plant in the ground."] }),
  ]),
  activity({ ...SCI, id: "identify-community-helpers", title: "Identify Community Helpers", description: "Match helpers to what they use.", obj: ["SCI-COM-01"],
    instructions: "Tap a helper, then tap what they use.", tags: ["community", "jobs"], mission: "Say thank you to a helper you meet today." }, "match-pair", [
    PAIRS("r1", "Who uses what?", [["🧑‍⚕️|doctor", "🩺|stethoscope"], ["🧑‍🚒|firefighter", "🚒|fire engine"], ["🧑‍🍳|chef", "🍳|frying pan"]], ["What does this helper use at work?"]),
    PAIRS("r2", "Who uses what?", [["👮|police officer", "🚓|police car"], ["🧑‍🌾|farmer", "🚜|tractor"], ["🧑‍🏫|teacher", "📚|books"]]),
  ]),
  activity({ ...SCI, id: "what-happens-when", title: "What Happens When...?", description: "Think about what happens when you do something.", obj: ["LOG-CAU-01"], difficulty: 2, domain: "logic-puzzles",
    instructions: "What will happen? Pick the answer that makes sense.", tags: ["cause and effect"], mission: "Predict and test: will it float or sink? Try with a bowl of water." }, "tap-choose", [
    T("r1", "What happens when the sun shines on ice cream?", ["🫠|it melts", "🧊|it gets harder", "🎈|it floats away"], [0], { display: "🍦☀️", hints: ["Is the sun warm or cold?"] }),
    T("r2", "What happens when you water a seed?", ["🌱|it grows", "🧊|it freezes", "🔥|it burns"], [0], { display: "💧🫘", hints: ["What do seeds need?"] }),
    T("r3", "What happens when you drop a ball?", ["⬇️|it falls down", "⬆️|it goes up", "🌈|it turns to rainbow"], [0], { display: "⚽", hints: ["Which way does the ball go?"] }),
  ]),
];

const CRE = { ...CF, domain: "creativity-storytelling" } as const;
const SEL = { ...CF, domain: "social-emotional" } as const;
export const CREATIVITY_ACTIVITIES = [
  activity({ ...CRE, id: "finish-the-story", title: "Finish the Story", description: "Add your own idea to a story. Every idea is welcome.", obj: ["CRE-STY-01"], difficulty: 2, minutes: 4,
    instructions: "Fern starts a story. You decide what happens next!", tags: ["story", "imagination"], mission: "Take turns adding one sentence to a made-up story." }, "listen-respond", [
    LR("r1", "Once upon a time, a little rabbit found a tiny golden door in a tree. What did the rabbit find behind it?", { display: "🐰🚪", maxTurns: 2,
      concepts: [["treasure", ["treasure", "gold", "jewel", "coin"], "Treasure! How wonderful! What did the rabbit do with it?"], ["friend", ["friend", "fairy", "elf", "dragon", "creature"], "A new friend! What did they say to each other?"], ["food", ["cake", "food", "carrot", "cookie", "apple"], "Yummy! Did the rabbit share it?"]],
      quick: [["💎", "A treasure", "treasure"], ["🧚", "A fairy friend", "friend"], ["🍰", "A cake", "food"], ["🌈", "A rainbow"]], model: "Behind the door the rabbit found a treasure.", fallback: "What a wonderful idea! I would never have thought of that." }),
    LR("r2", "The rabbit and the new friend heard a big noise. What was it?", { display: "🔊", maxTurns: 2,
      concepts: [["thunder", ["thunder", "storm", "rain"], "A big storm! What did they do?"], ["animal", ["lion", "bear", "elephant", "animal", "monster", "dragon"], "An animal! Was it friendly?"], ["music", ["music", "drum", "song", "band", "party"], "Music! Did they dance?"]],
      quick: [["⛈️", "A thunderstorm", "thunder"], ["🦁", "A big animal", "animal"], ["🥁", "Music and drums", "music"]], model: "It was a thunderstorm." }),
  ]),
  activity({ ...CRE, id: "choose-a-story-ending", words: true, title: "Choose a Story Ending", description: "Pick the ending you like best. There is no wrong choice.", obj: ["CRE-END-01"], difficulty: 1,
    instructions: "Which ending do you like best?", tags: ["story", "choices"] }, "tap-choose", [
    T("r1", "The little bear found a honey pot. How does the story end?", ["🤝|he shared it with his friends", "😴|he ate it and took a nap", "🏠|he took it home to mum"], [], { display: "🐻🍯", open: true,
      openReply: ["What a kind ending! Sharing makes everyone happy.", "A cosy ending! A nap is good after honey.", "A lovely ending! Mum will be so happy."] }),
    T("r2", "A kite flew high into the sky. How does the story end?", ["🌈|it landed on a rainbow", "🧒|a friend caught it", "🌙|it flew to the moon"], [], { display: "🪁", open: true,
      openReply: ["A rainbow! What a colourful ending.", "A friend caught it! Friends help each other.", "To the moon! What an adventure."] }),
  ]),
  activity({ ...CRE, id: "invent-a-magical-creature", title: "Invent a Magical Creature", description: "Dream up a new creature and tell Fern about it.", obj: ["CRE-IMG-01"], difficulty: 2, minutes: 4,
    instructions: "Imagine a magical creature. What does it look like? What can it do?", tags: ["imagination", "describe"], mission: "Draw your magical creature and tell someone about it." }, "listen-respond", [
    LR("r1", "Let's invent a creature. What is your creature's special power?", { display: "✨", maxTurns: 2,
      concepts: [["fly", ["fly", "wings", "flies"], "A flying creature! Where would it fly to?"], ["invisible", ["invisible", "disappear"], "Invisible! Where would it hide?"], ["colour", ["colour", "rainbow", "glow", "sparkle"], "How beautiful! What colour is it?"], ["talk", ["talk", "sing", "speak"], "A singing creature! What would it sing about?"]],
      quick: [["🪽", "It can fly", "fly"], ["🌈", "It glows rainbow colours", "colour"], ["🎤", "It can sing", "talk"], ["👻", "It can be invisible", "invisible"]],
      model: "My creature can fly and it glows with rainbow colours.", fallback: "What a wonderful idea! Tell me more about your creature.", followUps: ["What does your creature like to eat?", "What is its name?"] }),
  ]),
  activity({ ...CRE, id: "make-a-story-with-three-objects", title: "Make a Story with Three Objects", description: "Use three things to tell a story of your own.", obj: ["CRE-STY-01"], difficulty: 3, minutes: 5,
    instructions: "Use the key, the boat and the star in a story.", tags: ["story", "imagination"] }, "listen-respond", [
    LR("r1", "Let's make a story with a key, a boat and a star. How might the story begin?", { display: "🔑⛵⭐", maxTurns: 3,
      concepts: [["key", ["key", "door", "lock", "open"], "A key to open something! What does it open?"], ["boat", ["boat", "sail", "sea", "river", "water"], "A boat adventure! Where does it go?"], ["star", ["star", "night", "sky", "wish"], "A star! Did someone make a wish?"]],
      quick: [["🔑", "A key opens a secret door", "key"], ["⛵", "A boat sails over the sea", "boat"], ["⭐", "A star falls from the sky", "star"]],
      model: "A boat sailed to find the star, and it had a key.", fallback: "What a clever beginning! What happens next?", followUps: ["What happens next?", "How does the story end?"] }),
  ]),
  activity({ ...SEL, id: "how-is-the-character-feeling", words: true, title: "How Is the Character Feeling?", description: "Notice how people and animals feel.", obj: ["SEL-EMO-01"],
    instructions: "Look at the face. How are they feeling?", tags: ["feelings"], mission: "Name your own feelings out loud today." }, "tap-choose", [
    T("r1", "How is the bunny feeling?", ["😊|happy", "😢|sad", "😠|angry"], [0], { display: "🐰🎂", hints: ["It is the bunny's birthday! Is that a happy day?"] }),
    T("r2", "How is the puppy feeling?", ["😢|sad", "😊|happy", "😴|sleepy"], [0], { display: "🐶💧", hints: ["His toy is broken. Look at his face."] }),
    T("r3", "How is the cat feeling?", ["😨|scared", "😊|happy", "😴|sleepy"], [0], { display: "🐱⛈️", hints: ["A loud thunderstorm! How would you feel?"] }),
    T("r4", "How is the child feeling?", ["🤩|excited", "😢|sad", "😴|sleepy"], [0], { display: "🧒🎁", hints: ["It is a big surprise present!"] }),
  ]),
  activity({ ...SEL, id: "help-a-lost-animal", words: true, title: "Help a Lost Animal", description: "Think of kind and safe ways to help a lost animal.", obj: ["SEL-EMP-01"], difficulty: 2,
    instructions: "A little animal is lost. What can we do to help?", tags: ["empathy", "safety"] }, "tap-choose", [
    T("r1", "A little duckling is lost and crying. What could you do?", ["🧑‍🤝‍🧑|ask a grown-up to help", "🏃|run away", "🙈|pretend you did not see"], [0], { display: "🐥😢", acceptable: [], hints: ["Who can help us find the mother duck?"],
      explain: "Asking a grown-up you trust is a kind and safe way to help." }),
    T("r2", "The duckling feels scared. What could you do first?", ["🤗|speak softly and stay calm", "📢|shout loudly", "🏃|chase it"], [0], { display: "🐥", hints: ["What helps a scared friend feel safe?"] }),
  ]),
  activity({ ...SEL, id: "what-would-you-do", words: true, title: "What Would You Do?", description: "Choose kind and safe ways to solve everyday problems.", obj: ["SEL-PRB-01"], difficulty: 2,
    instructions: "Think about what you could do. Pick a kind choice.", tags: ["problem solving", "kindness"], mission: "Role-play a sharing problem with soft toys." }, "tap-choose", [
    T("r1", "Your friend is playing with the toy you want. What could you do?", ["🗣️|ask for a turn", "✋|grab it", "😡|shout"], [0], { display: "🧸", acceptable: [], hints: ["What words could you use?"], explain: "Asking for a turn uses kind words." }),
    T("r2", "You feel upset and don't know what to do. What could you do?", ["🧑‍🤝‍🧑|tell a grown-up how you feel", "🙈|hide away", "🥊|hit something"], [0], { display: "😟", hints: ["Who can help when you feel upset?"] }),
    T("r3", "You see a friend who is sad. What could you do?", ["🤗|ask if they are okay", "🚶|walk away", "😆|laugh"], [0], { display: "😢", hints: ["How would you like someone to help you?"] }),
  ]),
  activity({ ...SEL, id: "solve-a-friendship-problem", words: true, title: "Solve a Friendship Problem", description: "Help two friends who want the same thing.", obj: ["SEL-PRB-01"], difficulty: 3,
    instructions: "Two friends want the same thing. How can they solve it?", tags: ["cooperation", "sharing"] }, "tap-choose", [
    T("r1", "Two friends both want the red crayon. What could they do?", ["🔁|take turns", "🥊|fight over it", "🙄|say it's mine"], [0], { display: "🖍️", hints: ["Can they both use it, one after the other?"], explain: "Taking turns means everyone gets a go." }),
    T("r2", "Two friends want to play different games. What could they do?", ["🤝|play one, then the other", "😠|stop being friends", "🚪|leave"], [0], { display: "🎲⚽", hints: ["Could they play both games?"] }),
  ]),
];
