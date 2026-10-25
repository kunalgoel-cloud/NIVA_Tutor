// Mazes for ages 3 to 7. Every maze is checked (by the schema and by tests) to have a way from start to goal.
import { activity, MZ } from "../builders";

const P = { world: "puzzle-planet", domain: "logic-puzzles", character: "pip" } as const;

export const MAZE_ACTIVITIES = [
  activity({ ...P, id: "help-the-mouse-find-the-cheese", title: "Help the Mouse Find the Cheese", description: "Walk the mouse along the path to the cheese.", obj: ["LOG-MAZ-01"], band: "little-explorer", difficulty: 1, minutes: 3,
    instructions: "Tap the square next to you, or use the arrows, to walk to the cheese.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the mouse get to the cheese!", ["#####", "#S#G#", "#.#.#", "#...#", "#####"], "🐭", "🧀"),
    MZ("r2", "Help the mouse get to the cheese!", ["#######", "#S..#G#", "###.#.#", "#.....#", "#######"], "🐭", "🧀"),
    MZ("r3", "Help the mouse get to the cheese!", ["#####", "#S#G#", "#.#.#", "#.#.#", "#.#.#", "#...#", "#####"], "🐭", "🧀"),
  ]),
  activity({ ...P, id: "bunny-to-the-carrot-patch", title: "Bunny to the Carrot Patch", description: "Walk the bunny along the path to the carrots.", obj: ["LOG-MAZ-01"], band: "little-explorer", difficulty: 1, minutes: 3,
    instructions: "Tap the square next to you, or use the arrows, to walk to the carrots.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the bunny get to the carrots!", ["#####", "#S..#", "###.#", "#G..#", "#####"], "🐰", "🥕"),
    MZ("r2", "Help the bunny get to the carrots!", ["#######", "#S#...#", "#.#.#.#", "#...#G#", "#######"], "🐰", "🥕"),
    MZ("r3", "Help the bunny get to the carrots!", ["#####", "#S..#", "###.#", "#G#.#", "#.#.#", "#...#", "#####"], "🐰", "🥕"),
  ]),
  activity({ ...P, id: "duck-to-the-pond", title: "Duck to the Pond", description: "Walk the duck along the path to the water.", obj: ["LOG-MAZ-01"], band: "little-explorer", difficulty: 1, minutes: 3,
    instructions: "Tap the square next to you, or use the arrows, to walk to the pond.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the duck get to the pond!", ["#######", "#S#...#", "#.#.#.#", "#...#G#", "#######"], "🦆", "🌊"),
    MZ("r2", "Help the duck get to the pond!", ["#####", "#S#.#", "#.#.#", "#...#", "###.#", "#G..#", "#####"], "🦆", "🌊"),
    MZ("r3", "Help the duck get to the pond!", ["#####", "#S#G#", "#.#.#", "#...#", "#####"], "🦆", "🌊"),
  ]),
  activity({ ...P, id: "puppy-finds-the-bone", title: "Puppy Finds the Bone", description: "Find the way through the maze to the bone.", obj: ["LOG-MAZ-02"], band: "curious-thinker", difficulty: 2, minutes: 4,
    instructions: "Tap the square next to you, or use the arrows, to walk to the bone.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the puppy get to the bone!", ["#######", "#S#..G#", "#.#.###", "#.#...#", "#.###.#", "#.....#", "#######"], "🐶", "🦴"),
    MZ("r2", "Help the puppy get to the bone!", ["#########", "#S#G....#", "#.#####.#", "#...#...#", "###.#.#.#", "#.....#.#", "#########"], "🐶", "🦴"),
    MZ("r3", "Help the puppy get to the bone!", ["#######", "#S#..G#", "#.#.###", "#.#...#", "#.###.#", "#.#...#", "#.#.#.#", "#...#.#", "#######"], "🐶", "🦴"),
  ]),
  activity({ ...P, id: "bee-to-the-flower", title: "Bee to the Flower", description: "Find the way through the maze to the flower.", obj: ["LOG-MAZ-02"], band: "curious-thinker", difficulty: 2, minutes: 4,
    instructions: "Tap the square next to you, or use the arrows, to walk to the flower.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the bee get to the flower!", ["#######", "#S..#G#", "###.#.#", "#.#.#.#", "#.#.#.#", "#.....#", "#######"], "🐝", "🌻"),
    MZ("r2", "Help the bee get to the flower!", ["#######", "#S....#", "#####.#", "#G#...#", "#.#.###", "#.#.#.#", "#.#.#.#", "#.....#", "#######"], "🐝", "🌻"),
    MZ("r3", "Help the bee get to the flower!", ["#########", "#S#.....#", "#.###.#.#", "#.#...#.#", "#.#.###.#", "#...#G..#", "#########"], "🐝", "🌻"),
  ]),
  activity({ ...P, id: "explorer-finds-the-treasure", title: "Explorer Finds the Treasure", description: "Find the way through the maze to the treasure.", obj: ["LOG-MAZ-02"], band: "curious-thinker", difficulty: 2, minutes: 4,
    instructions: "Tap the square next to you, or use the arrows, to walk to the treasure.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the explorer get to the treasure!", ["#########", "#S#.....#", "#.#.###.#", "#.#...#G#", "#.###.###", "#...#...#", "###.###.#", "#.......#", "#########"], "🧒", "💎"),
    MZ("r2", "Help the explorer get to the treasure!", ["#########", "#S..#...#", "###.#.#.#", "#.#.#G#.#", "#.#.###.#", "#.......#", "#########"], "🧒", "💎"),
    MZ("r3", "Help the explorer get to the treasure!", ["#######", "#S..#G#", "###.#.#", "#.#.#.#", "#.#.#.#", "#...#.#", "#.###.#", "#.....#", "#######"], "🧒", "💎"),
  ]),
  activity({ ...P, id: "rocket-to-the-planet", title: "Rocket to the Planet", description: "Plan a route through the maze to the planet.", obj: ["LOG-MAZ-03"], band: "confident-learner", difficulty: 2, minutes: 5,
    instructions: "Tap the square next to you, or use the arrows, to walk to the planet.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the rocket get to the planet!", ["#########", "#S#G....#", "#.#####.#", "#.#...#.#", "#.#.#.#.#", "#.#.#...#", "#.#.###.#", "#...#...#", "#########"], "🚀", "🪐"),
    MZ("r2", "Help the rocket get to the planet!", ["#########", "#S....#G#", "#####.#.#", "#.#...#.#", "#.#.###.#", "#...#...#", "#.#####.#", "#.....#.#", "#####.#.#", "#.......#", "#########"], "🚀", "🪐"),
    MZ("r3", "Help the rocket get to the planet!", ["###########", "#S#...#...#", "#.#.#.#.#.#", "#.#.#...#.#", "#.#.#####.#", "#.#G#.....#", "#.###.###.#", "#.....#...#", "###########"], "🚀", "🪐"),
  ]),
  activity({ ...P, id: "penguin-to-the-fish", title: "Penguin to the Fish", description: "Plan a route through the icy maze to the fish.", obj: ["LOG-MAZ-03"], band: "confident-learner", difficulty: 2, minutes: 5,
    instructions: "Tap the square next to you, or use the arrows, to walk to the fish.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the penguin get to the fish!", ["###########", "#S#.......#", "#.###.###.#", "#...#.#.#.#", "###.#.#.#.#", "#.#.#.#...#", "#.#.#.#.###", "#.....#..G#", "###########"], "🐧", "🐟"),
    MZ("r2", "Help the penguin get to the fish!", ["###########", "#S..#.....#", "###.###.#.#", "#.#...#.#.#", "#.###.#.#.#", "#.#...#G#.#", "#.#.#####.#", "#.#.#...#.#", "#.#.#.#.#.#", "#.....#...#", "###########"], "🐧", "🐟"),
    MZ("r3", "Help the penguin get to the fish!", ["#########", "#S#.....#", "#.#.###.#", "#.#G#...#", "#.###.###", "#...#...#", "###.#.#.#", "#.#.#.#.#", "#.#.###.#", "#.......#", "#########"], "🐧", "🐟"),
  ]),
  activity({ ...P, id: "squirrel-to-the-acorn", title: "Squirrel to the Acorn", description: "Plan a route through the maze to the acorn.", obj: ["LOG-MAZ-03"], band: "confident-learner", difficulty: 3, minutes: 5,
    instructions: "Tap the square next to you, or use the arrows, to walk to the acorn.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the squirrel get to the acorn!", ["###########", "#S#.......#", "#.#.#.#####", "#.#G#.....#", "#.###.###.#", "#...#...#.#", "###.#.###.#", "#...#.#...#", "#.#####.#.#", "#.......#.#", "###########"], "🐿️", "🌰"),
    MZ("r2", "Help the squirrel get to the acorn!", ["###########", "#S........#", "#########.#", "#...#.....#", "#.#.#.#####", "#.#G#.#...#", "#.###.###.#", "#.........#", "###########"], "🐿️", "🌰"),
    MZ("r3", "Help the squirrel get to the acorn!", ["#########", "#S......#", "#######.#", "#...#.#.#", "#.#.#.#.#", "#.#...#.#", "#.###.#.#", "#.#G..#.#", "#.#####.#", "#.......#", "#########"], "🐿️", "🌰"),
  ]),
  activity({ ...P, id: "the-castle-maze", title: "The Castle Maze", description: "Plan your way through the big castle maze.", obj: ["LOG-MAZ-04"], band: "young-problem-solver", difficulty: 3, minutes: 6,
    instructions: "Tap the square next to you, or use the arrows, to walk to the castle.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the prince get to the castle!", ["###########", "#S........#", "#########.#", "#...#...#.#", "#.#.#.#.#.#", "#.#...#...#", "#.#########", "#.#.......#", "#.#####.#.#", "#.......#G#", "###########"], "🤴", "🏰"),
    MZ("r2", "Help the prince get to the castle!", ["###########", "#S..#.....#", "###.###.#.#", "#.#.....#.#", "#.#######.#", "#...#.....#", "#.###.#####", "#...#...#.#", "#.#.###.#.#", "#.#...#.#.#", "#.###.#.#.#", "#..G#.....#", "###########"], "🤴", "🏰"),
    MZ("r3", "Help the prince get to the castle!", ["#############", "#S#.........#", "#.#.#######.#", "#.#.#.......#", "#.#.#####.###", "#.#.....#.#G#", "#.#####.#.#.#", "#...#...#.#.#", "###.#.###.#.#", "#.....#.....#", "#############"], "🤴", "🏰"),
  ]),
  activity({ ...P, id: "the-jungle-maze", title: "The Jungle Maze", description: "Plan your way through the big jungle maze to the bananas.", obj: ["LOG-MAZ-04"], band: "young-problem-solver", difficulty: 3, minutes: 6,
    instructions: "Tap the square next to you, or use the arrows, to walk to the bananas.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the monkey get to the bananas!", ["###########", "#S#.....#.#", "#.#.###.#.#", "#...#...#.#", "#####.###.#", "#G..#...#.#", "###.###.#.#", "#...#...#.#", "#.#.#.###.#", "#.#.#.#...#", "#.###.#.#.#", "#.......#.#", "###########"], "🐒", "🍌"),
    MZ("r2", "Help the monkey get to the bananas!", ["#############", "#S#.......#.#", "#.#.#.###.#.#", "#.#.#.#...#.#", "#.#.#.#.###.#", "#.#.#.#.....#", "#.#.#.#####.#", "#.#.#.#.....#", "#.###.#.#####", "#.....#....G#", "#############"], "🐒", "🍌"),
    MZ("r3", "Help the monkey get to the bananas!", ["#############", "#S#.....#...#", "#.#.###.#.#.#", "#.#...#.#G#.#", "#.###.#.###.#", "#...#.#.....#", "###.#.#######", "#...#.......#", "#.#####.###.#", "#.....#.#...#", "#####.###.#.#", "#.........#.#", "#############"], "🐒", "🍌"),
  ]),
  activity({ ...P, id: "alien-to-the-spaceship", title: "Alien to the Spaceship", description: "Plan your way through the big space maze to the spaceship.", obj: ["LOG-MAZ-04"], band: "young-problem-solver", difficulty: 3, minutes: 6,
    instructions: "Tap the square next to you, or use the arrows, to walk to the spaceship.", tags: ["maze", "path"], mission: "Draw a maze on paper and solve it with your finger." }, "maze", [
    MZ("r1", "Help the alien get to the spaceship!", ["#############", "#S..#.......#", "###.#####.#.#", "#.#.#.....#.#", "#.#.#.#####.#", "#.#.#.....#.#", "#.#.#####.#.#", "#.#.....#.#G#", "#.#####.#.###", "#.....#.#...#", "#.###.#.###.#", "#...#.......#", "#############"], "👽", "🛸"),
    MZ("r2", "Help the alien get to the spaceship!", ["###########", "#S....#..G#", "#####.#.###", "#...#.#...#", "###.#.#.#.#", "#...#.#.#.#", "#.###.###.#", "#...#.#...#", "#.#.#.#.#.#", "#.#...#.#.#", "#.#####.#.#", "#.......#.#", "###########"], "👽", "🛸"),
    MZ("r3", "Help the alien get to the spaceship!", ["#############", "#S#.........#", "#.#.#######.#", "#...#...#...#", "#####.#.#.###", "#.....#G#.#.#", "#.#.#.###.#.#", "#.#.#.#...#.#", "#.#.###.###.#", "#.#.........#", "#############"], "👽", "🛸"),
  ]),
];
