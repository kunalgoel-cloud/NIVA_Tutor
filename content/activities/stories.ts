// Story games: the child listens to each page (it cannot be skipped), then answers questions that show
// whether the story was understood. A hint quotes the story back, so a wrong answer teaches something.
import { activity, PG, SQ } from "../builders";

const S = { world: "conversation-cafe", domain: "early-literacy", character: "otto" } as const;

export const STORY_ACTIVITIES = [
  // ---------------- Little Explorer (about 3 to 4) ----------------
  activity({ ...S, id: "story-pip-and-the-red-balloon", title: "Pip and the Red Balloon", description: "Listen to a short story about a rabbit and a balloon, then answer questions.", obj: ["LIT-LST-01"], difficulty: 1, minutes: 4,
    instructions: "Listen to the whole story. Then I will ask you some questions.", tags: ["story", "listening"], mission: "Tell the story again in your own words." }, "story-listen", [
    PG("p1", "Pip the rabbit had a red balloon.", "🐰🎈"),
    PG("p2", "A big wind came. Whoosh! The balloon flew up, up, up.", "💨🎈"),
    PG("p3", "Pip was sad. He could not reach it.", "🐰😢"),
    PG("p4", "Then Duck came to help. Duck jumped and caught the string. Pip said thank you, and they played together.", "🦆🐰🎈"),
    SQ("q1", "Who had a red balloon?", ["🐰|Pip the rabbit", "🐻|Bear", "🐱|Cat"], [0], { hints: ["Listen to the story again: 'Pip the rabbit had a red balloon.'"] }),
    SQ("q2", "What made the balloon fly away?", ["💨|the wind", "🌧️|the rain", "🐦|a bird"], [0], { hints: ["In the story, a big wind came. Whoosh!"] }),
    SQ("q3", "Who helped Pip?", ["🦆|Duck", "🐸|Frog", "🐢|Turtle"], [0], { hints: ["Duck jumped and caught the string."] }),
  ]),
  activity({ ...S, id: "story-little-bear-and-the-honey", title: "Little Bear and the Honey", description: "Listen to a story about sharing honey, then answer questions.", obj: ["LIT-LST-01"], difficulty: 1, minutes: 4,
    instructions: "Listen to the whole story. Then I will ask you some questions.", tags: ["story", "sharing"] }, "story-listen", [
    PG("p1", "Little Bear woke up hungry.", "🐻😋"),
    PG("p2", "He went into the forest and found a tree full of sweet honey.", "🌳🍯"),
    PG("p3", "Little Bear shared the honey with his friend Squirrel. They ate it all up and said, yum yum!", "🐻🐿️🍯"),
    SQ("q1", "How did Little Bear feel when he woke up?", ["😋|hungry", "😴|sleepy", "😡|cross"], [0], { hints: ["The story said Little Bear woke up hungry."] }),
    SQ("q2", "Where did Little Bear find the honey?", ["🌳|in a tree", "🏠|in a house", "🌊|in the sea"], [0], { hints: ["He went into the forest and found a tree full of honey."] }),
    SQ("q3", "Who did Little Bear share with?", ["🐿️|Squirrel", "🐰|Rabbit", "🦉|Owl"], [0], { hints: ["Little Bear shared with his friend Squirrel."] }),
  ]),
  activity({ ...S, id: "story-mia-and-the-rainy-day", title: "Mia and the Rainy Day", description: "Listen to a story about a rainy day, then answer questions.", obj: ["LIT-LST-01"], difficulty: 1, minutes: 4,
    instructions: "Listen to the whole story. Then I will ask you some questions.", tags: ["story", "weather"] }, "story-listen", [
    PG("p1", "It was a rainy day. Mia wanted to play outside.", "🌧️👧"),
    PG("p2", "She put on her yellow boots and her raincoat.", "👢🧥"),
    PG("p3", "Splash, splash, splash! Mia jumped in all the puddles.", "💦👧"),
    PG("p4", "Then she went inside, and Mum made her a bowl of warm soup.", "🏠🍲"),
    SQ("q1", "What was the weather like?", ["🌧️|rainy", "☀️|sunny", "❄️|snowy"], [0], { hints: ["The story began: 'It was a rainy day.'"] }),
    SQ("q2", "What did Mia put on her feet?", ["👢|yellow boots", "👟|trainers", "🩴|sandals"], [0], { hints: ["She put on her yellow boots."] }),
    SQ("q3", "What did Mia do outside?", ["💦|jumped in puddles", "🪁|flew a kite", "🏖️|built a sandcastle"], [0], { hints: ["Splash, splash, splash! What was she jumping in?"] }),
  ]),

  // ---------------- Curious Thinker (about 4 to 5) ----------------
  activity({ ...S, id: "story-the-lost-kitten", title: "The Lost Kitten", description: "Listen to a story about a lost kitten, then answer who, where and why questions.", obj: ["LIT-LST-02"], band: "curious-thinker", difficulty: 2, minutes: 5, words: true,
    instructions: "Listen to the whole story. Then I will ask you some questions.", tags: ["story", "kindness"], mission: "Ask your child: what would you do if you found a lost pet?" }, "story-listen", [
    PG("p1", "Mira was walking in the park when she heard a tiny cry. Meow, meow!", "👧🌳"),
    PG("p2", "She looked under a bench and found a little kitten. It was cold and scared.", "🐱😿"),
    PG("p3", "Mira did not take the kitten away. She ran to ask a grown-up for help.", "👧🏃"),
    PG("p4", "A kind lady read the name on the kitten's collar. It said Mrs Rao, number five.", "👩🏷️"),
    PG("p5", "Mira and the lady took the kitten home to Mrs Rao. Mrs Rao hugged her kitten and said thank you.", "🏠🐱💛"),
    SQ("q1", "Where did Mira find the kitten?", ["under a bench", "in a tree", "in a shop"], [0], { hints: ["She looked under a bench and found a little kitten."] }),
    SQ("q2", "Why was the kitten crying?", ["it was cold and scared", "it was hungry for dinner", "it wanted to play"], [0], { hints: ["The story said the kitten was cold and scared."] }),
    SQ("q3", "Who did Mira ask for help?", ["a grown-up", "her best friend", "a bird"], [0], { hints: ["Mira ran to ask a grown-up for help. A grown-up is a safe person to ask."] }),
    SQ("q4", "How did the story end?", ["the kitten went home to Mrs Rao", "Mira kept the kitten", "the kitten ran away"], [0], { hints: ["They took the kitten home to Mrs Rao."] }),
  ]),
  activity({ ...S, id: "story-ravi-plants-a-seed", title: "Ravi Plants a Seed", description: "Listen to a story about growing a flower, then answer questions.", obj: ["LIT-LST-02"], band: "curious-thinker", difficulty: 2, minutes: 5, words: true,
    instructions: "Listen to the whole story. Then I will ask you some questions.", tags: ["story", "plants", "sequence"] }, "story-listen", [
    PG("p1", "Ravi found a small seed. He pushed it into a pot of soil.", "🧒🌰"),
    PG("p2", "Every morning, Ravi gave the seed a little water, because plants need water to grow.", "💧🪴"),
    PG("p3", "For many days nothing happened. Ravi waited and waited.", "⏳"),
    PG("p4", "Then one morning he saw a tiny green sprout!", "🌱"),
    PG("p5", "Soon the sprout grew leaves, and then a bright yellow flower. Ravi smiled the biggest smile.", "🌻😊"),
    SQ("q1", "What did Ravi plant?", ["a seed", "a stone", "a toy"], [0], { hints: ["Ravi found a small seed."] }),
    SQ("q2", "Why did Ravi give the seed water?", ["plants need water to grow", "the soil was dirty", "he was thirsty"], [0], { hints: ["The story said: plants need water to grow."] }),
    SQ("q3", "What did Ravi see first?", ["a tiny green sprout", "a yellow flower", "a big tree"], [0], { hints: ["Before the flower, he saw something tiny and green."] }),
    SQ("q4", "How did Ravi feel at the end?", ["happy", "sad", "cross"], [0], { hints: ["Ravi smiled the biggest smile."] }),
  ]),

  // ---------------- Confident Learner (about 5 to 6) ----------------
  activity({ ...S, id: "story-tara-and-the-wobbly-tooth", title: "Tara and the Wobbly Tooth", description: "Listen to a story about a wobbly tooth, then answer questions about feelings and reasons.", obj: ["LIT-LST-03"], band: "confident-learner", difficulty: 2, minutes: 5, words: true,
    instructions: "Listen to the whole story. Then I will ask you some questions.", tags: ["story", "feelings"] }, "story-listen", [
    PG("p1", "Tara had a wobbly tooth. It wiggled when she touched it with her tongue.", "👧🦷"),
    PG("p2", "At snack time, her mum gave her a crunchy apple. Tara put it down. She was worried that biting would hurt.", "🍎😟"),
    PG("p3", "Her big brother Sam smiled and showed her the gap in his teeth. 'My tooth came out last week,' he said. 'It did not hurt at all.'", "👦😁"),
    PG("p4", "Tara took a small bite of the apple. Pop! Her tooth came out, and it did not hurt one bit.", "🍎🦷"),
    PG("p5", "Tara grinned. Now she had a gap just like Sam, and she felt very brave.", "👧😁"),
    SQ("q1", "Why did Tara put the apple down?", ["she was worried it would hurt", "she did not like apples", "she was full"], [0], { hints: ["Think about the words 'worried that biting would hurt'."] }),
    SQ("q2", "How did Sam help Tara?", ["he showed her his gap and said it did not hurt", "he ate her apple", "he laughed at her"], [0], { hints: ["Sam showed Tara the gap in his teeth."] }),
    SQ("q3", "What happened when Tara bit the apple?", ["her tooth came out", "her tooth hurt", "the apple fell"], [0], { hints: ["Pop! Something came out when she took a small bite."] }),
    SQ("q4", "How did Tara feel at the end?", ["brave and happy", "worried and sad", "angry"], [0], { hints: ["She grinned and felt very brave."] }),
  ]),
  activity({ ...S, id: "story-kabir-and-the-big-race", title: "Kabir and the Big Race", description: "Listen to a story about a race, then answer questions about what happened and why.", obj: ["LIT-LST-03"], band: "confident-learner", difficulty: 3, minutes: 5, words: true,
    instructions: "Listen to the whole story. Then I will ask you some questions.", tags: ["story", "feelings", "perseverance"] }, "story-listen", [
    PG("p1", "It was sports day. Kabir lined up with his friends for the big race.", "🏃👦"),
    PG("p2", "'Ready, steady, go!' Everyone ran fast. But Kabir tripped on a stone and fell down.", "💨😮"),
    PG("p3", "His knee felt sore, and he wanted to stop. But he took a deep breath and got up.", "🧒🩹"),
    PG("p4", "Kabir ran as fast as he could. He was the last to cross the line.", "🏁"),
    PG("p5", "His friends clapped and cheered. 'Well done for not giving up!' they said. Kabir felt proud.", "👏😊"),
    SQ("q1", "What happened to Kabir in the race?", ["he tripped and fell", "he won the race", "he went home"], [0], { hints: ["Kabir tripped on a stone."] }),
    SQ("q2", "Why did his friends cheer?", ["he did not give up", "he came first", "he was the tallest"], [0], { hints: ["They said, 'Well done for not giving up!'"] }),
    SQ("q3", "How did Kabir feel at the end?", ["proud", "bored", "scared"], [0], { hints: ["The story told us Kabir felt proud."] }),
    SQ("q4", "What can we learn from this story?", ["keep trying even when it is hard", "never run in a race", "it is bad to come last"], [0], { hints: ["Think about why his friends were pleased with Kabir."] }),
  ]),

  // ---------------- Young Problem Solver (about 6 to 7) ----------------
  activity({ ...S, id: "story-the-clever-crow", title: "The Clever Crow", description: "Listen to a story about a thirsty crow, make a prediction, and work out what the story teaches.", obj: ["LIT-LST-04"], band: "young-problem-solver", difficulty: 3, minutes: 6, words: true,
    instructions: "Listen to the story. I will stop to ask what you think happens next.", tags: ["story", "thinking", "prediction"] }, "story-listen", [
    PG("p1", "It was a very hot day, and a crow was very thirsty. He flew here and there looking for water.", "🐦☀️"),
    PG("p2", "At last he found a tall jug with a little water at the bottom. But the jug was so narrow that his beak could not reach it.", "🏺🐦"),
    SQ("q1", "What do you think the crow will do?", ["think of a clever way to reach the water", "give up and fly away", "break the jug with his beak"], [0], { acceptable: [], hints: ["The crow is a clever bird. What could make the water come higher?"] }),
    PG("p3", "The crow looked around and saw some small pebbles. He picked up one pebble at a time and dropped it into the jug.", "🪨🐦"),
    PG("p4", "Plop! Plop! Plop! Each pebble took up some room, and the water slowly rose higher and higher, until the crow could drink at last.", "🪨💧"),
    SQ("q2", "Why could the crow not drink at first?", ["the jug was narrow and the water was low", "the water was dirty", "the jug was empty"], [0], { hints: ["The jug was narrow, and there was only a little water at the bottom."] }),
    SQ("q3", "Why did the water rise?", ["the pebbles took up room in the jug", "it began to rain", "the crow poured more water in"], [0], { hints: ["Each pebble took up some room. Where did the water have to go?"] }),
    SQ("q4", "What does this story teach us?", ["to think carefully and keep trying", "to fly away from problems", "to be afraid of jugs"], [0], { hints: ["The crow did not give up. He thought of a plan."] }),
  ]),
  activity({ ...S, id: "story-anaya-and-the-library-book", title: "Anaya and the Library Book", description: "Listen to a story about telling the truth, then answer questions about what the characters do and why.", obj: ["LIT-LST-04"], band: "young-problem-solver", difficulty: 3, minutes: 6, words: true,
    instructions: "Listen to the story. I will stop to ask what you think.", tags: ["story", "honesty", "thinking"] }, "story-listen", [
    PG("p1", "Anaya borrowed a book about dinosaurs from the school library. She loved it and read it every night.", "👧📖🦕"),
    PG("p2", "One morning she looked in her bag, but the book was gone. Anaya felt a lump in her throat. She was scared she would be in trouble.", "🎒😟"),
    SQ("q1", "What do you think Anaya should do?", ["tell the librarian what happened", "hide and say nothing", "say she never borrowed it"], [0], { hints: ["Which choice is honest, and also lets someone help?"] }),
    PG("p3", "Anaya took a deep breath and told the librarian the truth. 'I am sorry. I think I lost my book,' she said.", "👧🗣️"),
    PG("p4", "The librarian smiled kindly. 'Thank you for telling me. Let us look together.' They found the book under the bus seat that very afternoon, and the bus driver had kept it safe.", "👩🚌📖"),
    SQ("q2", "Why was Anaya worried?", ["she had lost the library book", "she did not like dinosaurs", "she was late for school"], [0], { hints: ["She looked in her bag but the book was gone."] }),
    SQ("q3", "How did the librarian react?", ["she was kind and helped", "she was very cross", "she did not mind at all, and did nothing"], [0], { hints: ["The librarian smiled kindly and said, 'Let us look together.'"] }),
    SQ("q4", "Why was telling the truth a good idea?", ["people could help her find the book", "it made the book disappear", "it meant she could keep the book"], [0], { hints: ["Because Anaya told the truth, the librarian could help look."] }),
  ]),
];
