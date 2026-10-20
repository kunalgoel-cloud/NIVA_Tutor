import { activity, LR, ORD, T } from "../builders";

const C = { world: "conversation-cafe", character: "zed" } as const;
const CC = { ...C, domain: "conversation" } as const;
const SE = { ...C, domain: "spoken-english" } as const;
const LIT = { ...C, domain: "early-literacy", character: "otto" } as const;

export const CONVERSATION_ACTIVITIES = [
  // ---------------- Conversation ----------------
  activity({ ...CC, id: "meet-the-friendly-alien", title: "Meet the Friendly Alien", description: "Chat with Zed, a friendly alien who is new to Earth.", obj: ["CONV-RSP-01"],
    instructions: "Zed is visiting Earth. Tell Zed about your favourite things!", audio: "Beep boop! I am Zed, an alien. I am new to Earth. Can you help me learn about it?", tags: ["alien", "favourites"], speech: false }, "listen-respond", [
    LR("r1", "What is your favourite fruit?", { display: "🍓", maxTurns: 2,
      concepts: [
        ["mango", ["mango"], "Mangoes are delicious! What do you like about them?", "What do you like about mangoes?"],
        ["apple", ["apple"], "Apples are crunchy! What colour is your favourite apple?"],
        ["banana", ["banana"], "Bananas are yellow and soft! Do you like them mashed or whole?"],
        ["berry", ["strawberr", "berry", "blueberr", "grape"], "Yum, tiny juicy fruits! Are they sweet or sour?"],
      ],
      quick: [["🥭", "Mango", "mango"], ["🍎", "Apple", "apple"], ["🍌", "Banana", "banana"], ["🍓", "Strawberry", "berry"]],
      model: "My favourite fruit is a mango.", fallback: "Ooh, that sounds tasty! Tell me more about it.", followUps: ["What does it taste like?"] }),
    LR("r2", "What colour is the sky today?", { display: "🌤️", maxTurns: 2,
      concepts: [["blue", ["blue"], "Blue like a big blue blanket! Is it sunny too?"], ["grey", ["grey", "gray", "cloud"], "Grey clouds! Do you think it might rain?"], ["dark", ["dark", "night", "black"], "A dark sky, with stars maybe? What can you see?"]],
      quick: [["🔵", "It is blue", "blue"], ["☁️", "It is cloudy", "grey"], ["🌙", "It is dark", "dark"]], model: "The sky is blue today.", followUps: ["What else can you see up there?"] }),
  ]),
  activity({ ...CC, id: "tell-me-about-your-favourite-toy", title: "Tell Me About Your Favourite Toy", description: "Describe a favourite toy and say what you like about it.", obj: ["CONV-OPN-01"], difficulty: 2,
    instructions: "Tell Zed about a toy you love.", tags: ["toys", "opinions"], mission: "Show a grown-up your favourite toy and tell them about it." }, "listen-respond", [
    LR("r1", "What is your favourite toy?", { display: "🧸", maxTurns: 3,
      concepts: [["teddy", ["teddy", "bear"], "A teddy! Soft and cuddly. What do you like about your teddy?"], ["car", ["car", "truck", "vehicle"], "A car! Vroom vroom. What colour is it?"], ["doll", ["doll", "barbie"], "A doll! What is your doll's favourite thing to do?"], ["blocks", ["block", "lego", "brick"], "Blocks! What do you like to build?"]],
      quick: [["🧸", "My teddy", "teddy"], ["🚗", "My car", "car"], ["🧱", "My blocks", "blocks"], ["🪆", "My doll", "doll"]],
      model: "My favourite toy is my teddy because it is soft.", fallback: "That sounds like a fun toy! What do you like about it?", followUps: ["What do you like to do with it?", "Why do you like it?"] }),
  ]),
  activity({ ...CC, id: "ask-the-character-a-question", title: "Ask the Character a Question", description: "Choose or say a question to ask Otto the Owl.", obj: ["CONV-QST-01"], difficulty: 2, character: "otto",
    instructions: "Otto the Owl is happy to answer. What would you like to ask?", tags: ["questions", "owl"] }, "listen-respond", [
    LR("r1", "Hoo hoo! I am Otto. You can ask me a question. What would you like to know?", { display: "🦉", maxTurns: 2,
      concepts: [
        ["sleep", ["sleep", "night", "awake"], "Owls like to be awake at night and sleep in the day. Great question! What do you do at night?"],
        ["food", ["eat", "food", "hungry"], "I eat little mice and bugs. Great question! What do you like to eat?"],
        ["why", ["why", "how"], "What a thinking question! I wonder about that too. Can you guess the answer?"],
        ["fly", ["fly", "wings"], "My wings are soft, so I fly quietly! What can you do quietly?"],
      ],
      quick: [["🌙", "Do you sleep at night?", "sleep"], ["🍽️", "What do you eat?", "food"], ["🪽", "How do you fly?", "fly"], ["❓", "Why do owls say hoo?", "why"]],
      model: "Otto, what do you eat?", fallback: "Great question! I will think about that. Do you want to ask me another one?" }),
  ]),
  activity({ ...CC, id: "tell-me-about-your-day", title: "Tell Me About Your Day", description: "Talk about something that happened today. Nothing is saved.", obj: ["CONV-NAR-01"], difficulty: 2,
    instructions: "Tell Fern about your day. You can tap a picture or talk.", character: "fern", tags: ["narrating", "day"], mission: "At bedtime, tell a grown-up your favourite part of the day." }, "listen-respond", [
    LR("r1", "What did you do today?", { display: "☀️", maxTurns: 3,
      concepts: [["play", ["play", "played", "toy", "game"], "Playing sounds fun! What did you play with?"], ["eat", ["ate", "eat", "lunch", "breakfast", "snack", "dinner"], "Yum! What was the tastiest thing?"], ["outside", ["park", "outside", "walk", "garden", "swing"], "Outside is lovely! What did you see there?"], ["school", ["school", "friend", "class"], "School! What was the best part?"]],
      quick: [["🧸", "I played", "play"], ["🍽️", "I ate yummy food", "eat"], ["🌳", "I went outside", "outside"], ["🏫", "I went to school", "school"]],
      model: "Today I played with my toys.", fallback: "That sounds like a lovely day! Tell me one more thing.", followUps: ["What happened next?", "What was your favourite part?"] }),
  ]),
  activity({ ...CC, id: "what-happens-next", title: "What Happens Next?", description: "Look at a little story and say what might happen next.", obj: ["CONV-NAR-02"], difficulty: 2,
    instructions: "What do you think will happen next? Any idea is a good idea!", character: "otto", tags: ["predict"] }, "listen-respond", [
    LR("r1", "The balloon slipped out of the girl's hand. What might happen next?", { display: "🎈", maxTurns: 2,
      concepts: [["float", ["float", "fly", "up", "sky", "away"], "Yes, it might float up into the sky! What would you do?"], ["catch", ["catch", "get", "jump", "grab"], "Good idea! She might jump and try to catch it."], ["pop", ["pop", "burst", "bang"], "Pop! That could happen if it touches something sharp."]],
      quick: [["⬆️", "It floats up", "float"], ["🙌", "She catches it", "catch"], ["💥", "It pops", "pop"]], model: "I think the balloon will float away.", fallback: "That is a creative idea! Tell me more." }),
    LR("r2", "It started to rain, and the puppy has no umbrella. What might happen next?", { display: "🐶", maxTurns: 2,
      concepts: [["wet", ["wet", "soaked", "splash"], "He might get wet and splashy! What could help him?"], ["home", ["home", "house", "inside", "run"], "He might run home! Good thinking."], ["umbrella", ["umbrella", "coat", "hat"], "An umbrella would help! Where could he find one?"]],
      quick: [["💦", "He gets wet", "wet"], ["🏠", "He runs home", "home"], ["☂️", "He finds an umbrella", "umbrella"]], model: "I think the puppy will run home." }),
  ]),
  activity({ ...CC, id: "meet-a-new-friend", title: "Meet a New Friend", description: "Practise saying hello, answering and asking back.", obj: ["CONV-TRN-01"], difficulty: 2,
    instructions: "Say hello to Fern, a make-believe friend. Fern is a story character, not a real child.", character: "fern", tags: ["turn-taking", "greetings"] }, "listen-respond", [
    LR("r1", "Hello! My name is Fern. What is your favourite animal?", { display: "🦊", maxTurns: 3,
      concepts: [["cat", ["cat", "kitten"], "Cats are cuddly! Now you can ask me something!"], ["dog", ["dog", "puppy"], "Dogs are playful! Now you can ask me something!"], ["elephant", ["elephant"], "Elephants are enormous! Now you can ask me something!"], ["rabbit", ["rabbit", "bunny"], "Bunnies hop! Now you can ask me something!"]],
      quick: [["🐱", "A cat", "cat"], ["🐶", "A dog", "dog"], ["🐘", "An elephant", "elephant"], ["🐰", "A bunny", "rabbit"]],
      model: "My favourite animal is a cat. What is yours?", fallback: "That is a good one! Now you can ask me a question.", followUps: ["You can ask me: what is your favourite animal?"] }),
  ]),
  activity({ ...CC, id: "explain-your-choice", title: "Explain Your Choice", description: "Choose something and say why.", obj: ["CONV-RSN-01"], difficulty: 3,
    instructions: "Pick one, then tell me why you picked it.", tags: ["because", "reasons"] }, "listen-respond", [
    LR("r1", "Would you rather play in the park or at the beach? Why?", { display: "🤔", maxTurns: 2,
      concepts: [["park", ["park", "swing", "slide"], "The park sounds fun! What do you like to do there?"], ["beach", ["beach", "sea", "sand", "water", "waves"], "The beach is lovely! What would you build in the sand?"], ["because", ["because", "cause", "'cause"], "That is a great reason!"]],
      quick: [["🛝", "The park because I like swings", "park"], ["🏖️", "The beach because I like sand", "beach"]],
      model: "I would like to go to the park because I like the swings.", fallback: "Thank you for sharing your idea!", followUps: ["Why do you like it?"] }),
  ]),
  activity({ ...CC, id: "tell-me-why", title: "Tell Me Why", description: "Think about why everyday things happen.", obj: ["CONV-RSN-01"], difficulty: 2, character: "otto",
    instructions: "Otto wonders why. Can you help? Any sensible idea works!", tags: ["why", "reasons"] }, "listen-respond", [
    LR("r1", "Why do we wear a coat when it is cold?", { display: "🧥", maxTurns: 2,
      concepts: [["warm", ["warm", "cold", "freeze", "heat"], "Yes! A coat keeps us warm. Well done for thinking about that!"]],
      quick: [["🔥", "To stay warm", "warm"], ["👕", "Because it is pretty"]], model: "We wear a coat because it keeps us warm.", fallback: "That is an interesting idea! A coat also keeps us warm." }),
    LR("r2", "Why do we brush our teeth?", { display: "🪥", maxTurns: 2,
      concepts: [["clean", ["clean", "healthy", "germs", "bugs", "cavity", "sugar", "strong"], "Yes, it keeps our teeth clean and strong!"]],
      quick: [["✨", "To keep them clean", "clean"], ["🦷", "So they stay strong", "clean"]], model: "We brush our teeth to keep them clean." }),
  ]),

  // ---------------- Spoken English ----------------
  activity({ ...SE, id: "describe-the-picture", title: "Describe the Picture", description: "Say what you can see in a picture.", obj: ["SPE-SNT-01"], difficulty: 2,
    instructions: "Look at the picture. Tell me what you see.", tags: ["describe", "sentences"] }, "listen-respond", [
    LR("r1", "What can you see in this picture?", { display: "🐶🌳☀️", maxTurns: 2,
      concepts: [["dog", ["dog", "puppy"], "Yes, a dog! What is the dog doing?"], ["tree", ["tree"], "A big tree! What colour are the leaves?"], ["sun", ["sun", "sunny"], "A sunny day! Is it warm or cold?"]],
      quick: [["🐶", "I see a dog", "dog"], ["🌳", "I see a tree", "tree"], ["☀️", "I see the sun", "sun"]], model: "I can see a dog under a tree.", fallback: "Nice looking! What else can you see?" }),
    LR("r2", "What can you see in this picture?", { display: "🚌👧🏫", maxTurns: 2,
      concepts: [["bus", ["bus"], "A bus! Where is the bus going?"], ["girl", ["girl", "child", "kid"], "A girl! What is she doing?"], ["school", ["school", "building"], "A school! What do you do at school?"]],
      quick: [["🚌", "I see a bus", "bus"], ["👧", "I see a girl", "girl"], ["🏫", "I see a school", "school"]], model: "I can see a girl getting on a bus." }),
  ]),
  activity({ ...SE, id: "what-is-happening", title: "What Is Happening?", description: "Use action words to say what people and animals are doing.", obj: ["SPE-VRB-01"], difficulty: 1,
    instructions: "Tell me what is happening in the picture.", tags: ["action words"] }, "listen-respond", [
    LR("r1", "What is the rabbit doing?", { display: "🐰💤", maxTurns: 2,
      concepts: [["sleep", ["sleep", "nap", "rest", "dream", "snooz"], "Yes, the rabbit is sleeping! Shh!"]],
      quick: [["😴", "It is sleeping", "sleep"], ["🏃", "It is running"], ["🥕", "It is eating"]], model: "The rabbit is sleeping.", fallback: "Good looking! The rabbit is having a nap." }),
    LR("r2", "What is the girl doing?", { display: "👧🪁", maxTurns: 2,
      concepts: [["fly", ["fly", "kite", "flying"], "Yes, she is flying a kite! Wheee!"], ["play", ["play", "playing", "outside"], "She is playing with a kite!"]],
      quick: [["🪁", "She is flying a kite", "fly"], ["🛌", "She is sleeping"], ["🍽️", "She is eating"]], model: "The girl is flying a kite." }),
    LR("r3", "What are the children doing?", { display: "🧒🧒⚽", maxTurns: 2,
      concepts: [["football", ["ball", "football", "kick", "soccer", "play"], "They are playing football! Do you like to play it?"]],
      quick: [["⚽", "They are kicking a ball", "football"], ["🍎", "They are eating"], ["📚", "They are reading"]], model: "The children are playing with a ball." }),
  ]),
  activity({ ...SE, id: "describe-the-mystery-fruit", title: "Describe the Mystery Fruit", description: "Use describing words for how a fruit looks, feels and tastes.", obj: ["SPE-VOC-02"], difficulty: 2,
    instructions: "Tell me about the fruit. What words describe it?", tags: ["adjectives", "fruit"], mission: "Taste a fruit with a grown-up and describe it: colour, feel, taste." }, "listen-respond", [
    LR("r1", "This fruit is yellow and long. How would you describe a banana?", { display: "🍌", maxTurns: 2,
      concepts: [["soft", ["soft", "squishy", "mushy"], "Yes, bananas are soft inside! What does it taste like?"], ["sweet", ["sweet", "yummy", "tasty", "delicious"], "Yes, sweet and yummy! What colour is it outside?"], ["yellow", ["yellow", "long", "curvy", "bendy"], "Yes, yellow and curvy!"]],
      quick: [["🟡", "It is yellow", "yellow"], ["🤏", "It is soft", "soft"], ["😋", "It is sweet", "sweet"]], model: "A banana is yellow and soft and sweet.", fallback: "Good describing! Can you tell me how it feels?" }),
    LR("r2", "This fruit is round and red. How would you describe an apple?", { display: "🍎", maxTurns: 2,
      concepts: [["crunchy", ["crunchy", "crisp", "hard", "crunch"], "Crunchy! What does it sound like when you bite it?"], ["red", ["red", "round", "shiny"], "Yes, round and shiny!"], ["sweet", ["sweet", "juicy", "yummy"], "Sweet and juicy!"]],
      quick: [["🔴", "It is red", "red"], ["🔊", "It is crunchy", "crunchy"], ["💧", "It is juicy", "sweet"]], model: "An apple is red and crunchy." }),
  ]),
  activity({ ...SE, id: "finish-my-sentence", title: "Finish My Sentence", description: "Choose the word that finishes the sentence.", obj: ["SPE-SNT-02"], difficulty: 2,
    instructions: "I will say a sentence. Tap the word that finishes it.", tags: ["sentences", "cloze"] }, "tap-choose", [
    T("r1", "A fish can ... (finish the sentence)", ["🏊|swim", "🛫|fly", "🛌|sleep in a bed"], [0], { display: "🐟", hints: ["Where does a fish live?", "What do fish do in water?"] }),
    T("r2", "A bird can ... (finish the sentence)", ["🛫|fly", "🏊|swim like a fish", "🧱|build a house"], [0], { display: "🐦", hints: ["What do birds do with their wings?"] }),
    T("r3", "When I am thirsty, I drink ...", ["💧|water", "🧱|bricks", "🧦|socks"], [0], { display: "🥤", hints: ["What do we drink?"] }),
    T("r4", "We wear shoes on our ...", ["🦶|feet", "🙂|head", "🖐️|hands"], [0], { display: "👟", hints: ["Where do shoes go?"] }),
  ]),
  activity({ ...SE, id: "name-it-market", title: "Name It Market", description: "Hear a word and find the matching thing at the market.", obj: ["SPE-VOC-01"], difficulty: 1, character: "otto",
    instructions: "Listen to the word. Tap the thing you hear.", tags: ["vocabulary", "market"] }, "tap-choose", [
    T("r1", "Find the pumpkin.", ["🎃|pumpkin", "🍅|tomato", "🥕|carrot"], [0], { hints: ["Press the ear to hear it again.", "A pumpkin is big and round and orange."] }),
    T("r2", "Find the pineapple.", ["🍍|pineapple", "🍇|grapes", "🍋|lemon"], [0], { hints: ["Press the ear to hear it again.", "A pineapple has spiky leaves on top."] }),
    T("r3", "Find the broccoli.", ["🥦|broccoli", "🥔|potato", "🌽|corn"], [0], { hints: ["Broccoli looks like a little tree."] }),
  ]),
  activity({ ...SE, id: "listen-and-tap", title: "Listen and Tap", description: "Listen carefully to a describing sentence and tap the right one.", obj: ["SPE-LIS-01"], difficulty: 2,
    instructions: "Listen carefully, then tap what I describe.", tags: ["listening"] }, "tap-choose", [
    T("r1", "Tap the big red ball.", ["🔴|big red ball", "🔵|blue ball", "🟢|green ball"], [0], { hints: ["Which one is red?"] }),
    T("r2", "Tap the animal that says moo.", ["🐄|cow", "🐶|dog", "🐱|cat"], [0], { hints: ["Which animal gives us milk?"] }),
    T("r3", "Tap the thing you wear on your head.", ["🧢|cap", "🧦|socks", "👟|shoes"], [0], { hints: ["Where does a cap go?"] }),
  ]),

  // ---------------- Early literacy ----------------
  activity({ ...LIT, id: "find-the-rhyming-words", title: "Find the Rhyming Words", description: "Find the word that sounds the same at the end.", obj: ["LIT-RHY-01"], difficulty: 2,
    instructions: "Cat and hat rhyme. Tap the word that rhymes!", tags: ["rhyme"], mission: "Say a nursery rhyme and stop before the rhyming word." }, "tap-choose", [
    T("r1", "Which word rhymes with cat?", ["🎩|hat", "🐶|dog", "☀️|sun"], [0], { display: "🐱", hints: ["Listen to the ending: cat, hat.", "Which one ends the same way?"] }),
    T("r2", "Which word rhymes with sun?", ["🏃|run", "🐟|fish", "🌙|moon"], [0], { display: "☀️", hints: ["Sun, run. Do they sound alike at the end?"] }),
    T("r3", "Which word rhymes with bee?", ["🌳|tree", "🦆|duck", "🚗|car"], [0], { display: "🐝", hints: ["Bee, tree. Listen to the ending."] }),
  ]),
  activity({ ...LIT, id: "identify-the-first-sound", title: "Identify the First Sound", description: "Which picture starts with the sound?", obj: ["LIT-PHN-01"], difficulty: 3,
    instructions: "Listen to the first sound. Find a picture that starts the same.", tags: ["phonics"], mission: "Play I spy using sounds, like 'I spy something that starts with sss'." }, "tap-choose", [
    T("r1", "Which one starts with the sound sss, like sun?", ["🐍|snake", "🐶|dog", "🐱|cat"], [0], { display: "☀️", hints: ["Say sss. Which word starts with sss?", "Snake starts with sss."] }),
    T("r2", "Which one starts with the sound mmm, like moon?", ["🐒|monkey", "🐟|fish", "🐸|frog"], [0], { display: "🌙", hints: ["Say mmm. Which word starts with mmm?"] }),
    T("r3", "Which one starts with the sound buh, like ball?", ["🐻|bear", "🐘|elephant", "🦆|duck"], [0], { display: "⚽", hints: ["Say buh. Which word starts with buh?"] }),
  ]),
  activity({ ...LIT, id: "match-the-picture-to-the-spoken-word", title: "Match the Picture to the Spoken Word", description: "Hear a word and tap the matching picture.", obj: ["LIT-WRD-01"], difficulty: 1,
    instructions: "Listen. Tap the picture for the word.", tags: ["words", "listening"] }, "tap-choose", [
    T("r1", "Tap the word: banana", ["🍌|banana", "🍎|apple", "🍇|grapes"], [0], { hints: ["Press the ear to hear it again."] }),
    T("r2", "Tap the word: umbrella", ["☂️|umbrella", "👒|hat", "👜|bag"], [0], { hints: ["Press the ear to hear it again."] }),
    T("r3", "Tap the word: elephant", ["🐘|elephant", "🐭|mouse", "🐇|rabbit"], [0], { hints: ["It has a long trunk."] }),
  ]),
  activity({ ...LIT, id: "listen-to-the-story", title: "Listen to the Story", description: "Hear a short story and answer a question about it.", obj: ["LIT-LST-01"], difficulty: 1,
    instructions: "Listen to the story. Then tap the answer.", tags: ["story", "comprehension"] }, "tap-choose", [
    T("r1", "Listen: Little Bear found a red kite in the garden. Who found the kite?", ["🐻|bear", "🐰|rabbit", "🐱|cat"], [0], { display: "🪁", hints: ["Listen again. Who is the story about?"] }),
    T("r2", "Listen: Little Bear flew the red kite. Where did he find it?", ["🌷|in the garden", "🏖️|at the beach", "🛏️|in bed"], [0], { display: "🪁", hints: ["Listen again. Where did Little Bear find the kite?"] }),
  ]),
  activity({ ...LIT, id: "remember-what-happened", title: "Remember What Happened", description: "Listen to a story, then remember the important parts.", obj: ["LIT-LST-01"], difficulty: 2,
    instructions: "Listen to the story, then remember what happened.", tags: ["recall"] }, "tap-choose", [
    T("r1", "Listen: Mia was hungry. She made a sandwich and ate it in the sun. What did Mia make?", ["🥪|sandwich", "🍕|pizza", "🍦|ice cream"], [0], { display: "👧", hints: ["Listen again: what did Mia make?"] }),
    T("r2", "Listen: Raj saw dark clouds. He took his umbrella to the park. What did Raj take?", ["☂️|umbrella", "⚽|ball", "🪁|kite"], [0], { display: "🧒", hints: ["It helps when it rains."] }),
    T("r3", "Listen: Tara fed the ducks some bread. How many ducks came? Two ducks came.", ["🦆🦆|two ducks", "🦆|one duck", "🦆🦆🦆🦆|four ducks"], [0], { display: "🦆", hints: ["Remember the number in the story."] }),
  ]),
  activity({ ...LIT, id: "put-story-events-in-order", title: "Put Story Events in Order", description: "Put the story pictures in the right order.", obj: ["LIT-NAR-01"], difficulty: 2,
    instructions: "Tap the pictures in the order they happened.", tags: ["sequence", "story"] }, "complete-pattern", [
    ORD("r1", "A seed grows. Tap the pictures in order.", ["🌱|a seed in soil", "🌿|a small plant", "🌻|a big flower"], ["What happens first?"]),
    ORD("r2", "Making a sandwich. Tap the pictures in order.", ["🍞|bread", "🧈|spread butter", "🥪|sandwich is ready"], ["What do we start with?"]),
  ]),
];
