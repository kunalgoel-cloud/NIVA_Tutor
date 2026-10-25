# How a game teaches: the learning flow

This describes what a child experiences in a game, and why.

## A wrong answer means listening to a hint
1. The child taps a wrong choice. It is never called "wrong": a short, kind line is spoken ("Good try! Let's listen.") followed by a hint.
2. **The choices lock** while the hint is spoken. With the sound off, they stay locked long enough to read it (`hintDwellMs`: about 2.5 to 9 seconds, depending on length).
3. The child taps "Got it, let's try again". **All the choices open again**, including the one tried. No choice is ever removed, so the child cannot eliminate their way to the answer.
4. Hints get stronger with each mistake: a nudge, then a clue, then **the right choice glows** (the child still has to tap it). A round finished with the glow is recorded as an example, not as independent work.
5. There is no Skip button and no auto-advance. **The next part only appears after the right answer.** Pause and Stop remain, because a child must always be able to leave.

Hints quote the story, the rule or the picture, so the mistake teaches something. Open-ended rounds (story endings, imagining) have no wrong answers and never lock.

## Words, not symbols, for ideas
Pictures are used for things (an apple, a duck). For ideas such as kind, happy, hot or "ask a grown-up", a picture symbol would teach the symbol rather than the meaning. Activities with `presentation: "words"` show the **written words** instead, and the runner **reads the choices aloud** after the question (and a "Hear the choices" button repeats them). Letters are always shown as letters, because they are what is being learned.

## Varied praise
`lib/games/praise.ts` holds many phrases for each kind of game (counting, matching, kindness, feelings, letters, puzzles, mazes, stories, creating), short cheers for one correct step, warm "try again" lines, and different closing lines. A phrase is never repeated back to back. Old filler that did not fit (for example "You noticed something interesting!" after counting) is gone.

## Stories
The **story-listen** engine tells a story one page at a time. Each page is read aloud and **cannot be left until it has been heard** (or, with the sound off, read for long enough). Questions then check that the story was understood, and follow the same rule as every game: a wrong answer means listening to a hint that quotes the story. Prediction questions can sit in the middle of a story. A story must start with a page and end with a question (checked by the content validator).

## Mazes
The **maze** engine shows a grid. The child walks to the goal with big arrow buttons, the keyboard arrows, or by tapping a square next to them. A wall just says "That's a wall! Try another way." After three bumps the hint flow starts, and the glowing hint shows the next step of the shortest route. Every maze is checked, in the schema and by tests, to be solvable. Sizes grow with age: 5x5 for 3-year-olds up to 13x13 for 7-year-olds.

## Levels
Content is tagged with one of four age bands (3 to 4, 4 to 5, 5 to 6, 6 to 7) and a difficulty. A child sees activities up to their profile's band. The parent chooses the band in the child's profile.

| Area | 3 to 4 | 4 to 5 | 5 to 6 | 6 to 7 |
|---|---|---|---|---|
| Alphabet | find letters | capital and small, alphabet order, letter sounds | finish three-letter words | spell, read and recognise words |
| Stories | who / what | who / where / why | feelings and reasons | prediction and what it teaches |
| Mazes | tiny paths | small mazes with turns | plan a route | large mazes |
| Puzzles | matching, odd one out | five-step sequences | number patterns, riddles | clue puzzles that rule things out |

## Honest limits
- All of this content was written by the assistant and has **not been reviewed by a teacher or tested with children**. The "reviewed" label on activities is an internal flag, not an expert review.
- Letter sounds are spelled for a text-to-speech voice ("buh", "sss"); voices differ, and some will say them oddly. A real recording would be better.
- Mazes are tapped or steered with buttons; drawing a path with a finger is not implemented.
