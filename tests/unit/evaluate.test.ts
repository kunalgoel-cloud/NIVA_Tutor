import { describe, expect, it } from "vitest";
import { TapChooseRoundSchema, CountCollectRoundSchema, MatchPairRoundSchema, CompletePatternRoundSchema, ListenRespondRoundSchema } from "@/lib/games/schema";
import { T, CNT, GIVE, PAIRS, SORT, ORD, LR } from "@/content/builders";
import {
  countWords, evaluateCollect, evaluateCountAnswer, evaluateOrder, evaluateResponse, evaluateTapChoose, isPairMatch, isSortedCorrectly, isValidOrderPrefix, matchesKeyword,
} from "@/lib/games/evaluate";

describe("tap and choose", () => {
  const round = TapChooseRoundSchema.parse(T("r", "p", ["🍎|a", "🍌|b", "🍇|c"], [0], { acceptable: [2] }));
  it("accepts the correct answer and listed alternatives", () => {
    expect(evaluateTapChoose(round, "a").kind).toBe("correct");
    expect(evaluateTapChoose(round, "c").kind).toBe("correct");
    expect(evaluateTapChoose(round, "b").kind).toBe("incorrect");
  });
  it("treats unknown ids as incorrect, not as an error", () => {
    expect(evaluateTapChoose(round, "nope").kind).toBe("incorrect");
  });
  it("welcomes any option on an open-ended round and returns the reflection", () => {
    const open = TapChooseRoundSchema.parse(T("r", "p", ["🍎|a", "🍌|b"], [], { open: true, openReply: ["Lovely!", "Nice!"] }));
    expect(evaluateTapChoose(open, "a")).toEqual({ kind: "open", reflection: "Lovely!" });
    expect(evaluateTapChoose(open, "b").kind).toBe("open");
  });
});

describe("count and collect", () => {
  const count = CountCollectRoundSchema.parse(CNT("r", "p", "🍎", 3, [2, 3, 4]));
  const collect = CountCollectRoundSchema.parse(GIVE("r", "p", "🍎", 6, 3, "🦖|dino"));
  it("checks the counted total", () => {
    expect(evaluateCountAnswer(count, 3)).toBe("correct");
    expect(evaluateCountAnswer(count, 4)).toBe("incorrect");
  });
  it("distinguishes too few, too many and exact", () => {
    expect(evaluateCollect(collect, 3)).toBe("correct");
    expect(evaluateCollect(collect, 2)).toBe("too-few");
    expect(evaluateCollect(collect, 5)).toBe("too-many");
  });
});

describe("match the pair / sort", () => {
  const pairs = MatchPairRoundSchema.parse(PAIRS("r", "p", [["🐟|fish", "🌊|water"], ["🐦|bird", "🪺|nest"]]));
  it("matches only the true partner", () => {
    expect(isPairMatch(pairs, "l1", "r1")).toBe(true);
    expect(isPairMatch(pairs, "l1", "r2")).toBe(false);
    expect(isPairMatch(pairs, "zzz", "r1")).toBe(false);
  });
  it("sorts items into the right bin", () => {
    const sort = MatchPairRoundSchema.parse(SORT("r", "p", ["🧺|big", "👜|small"], [["🐘|elephant", 0], ["🐭|mouse", 1]]));
    expect(isSortedCorrectly(sort, "i1", "b1")).toBe(true);
    expect(isSortedCorrectly(sort, "i1", "b2")).toBe(false);
  });
});

describe("ordering", () => {
  const order = CompletePatternRoundSchema.parse({ ...ORD("r", "p", ["1|one", "2|two", "3|three"]), acceptableOrders: [["s1", "s3", "s2"]] });
  it("accepts the canonical and alternative orders", () => {
    expect(evaluateOrder(order, ["s1", "s2", "s3"])).toBe(true);
    expect(evaluateOrder(order, ["s1", "s3", "s2"])).toBe(true);
    expect(evaluateOrder(order, ["s2", "s1", "s3"])).toBe(false);
    expect(evaluateOrder(order, ["s1", "s2"])).toBe(false);
  });
  it("validates prefixes so a wrong tap is caught immediately", () => {
    expect(isValidOrderPrefix(order, ["s1"])).toBe(true);
    expect(isValidOrderPrefix(order, ["s1", "s3"])).toBe(true);
    expect(isValidOrderPrefix(order, ["s2"])).toBe(false);
  });
});

describe("meaning-based spoken responses", () => {
  const round = ListenRespondRoundSchema.parse(LR("r", "Favourite fruit?", {
    concepts: [["mango", ["mango"], "Mangoes are delicious! What do you like about them?"], ["apple", ["apple"], "Apples are crunchy!"]],
    quick: [["🥭", "Mango", "mango"], ["🍎", "Apple", "apple"]], model: "My favourite fruit is a mango.", fallback: "Tasty!",
  }));
  it("recognises inflections and sentence forms, not exact strings", () => {
    expect(matchesKeyword("I like mangoes!", "mango")).toBe(true);
    expect(matchesKeyword("MANGO", "mango")).toBe(true);
    expect(matchesKeyword("a banana", "mango")).toBe(false);
    expect(evaluateResponse(round, "I really like mangoes a lot").conceptId).toBe("mango");
  });
  it("accepts reasonable off-script answers instead of marking them wrong", () => {
    const ev = evaluateResponse(round, "pineapple");
    expect(ev.understood).toBe(true);
    expect(ev.conceptId).toBeNull();
    expect(ev.reply).toBe("Tasty!");
  });
  it("models a fuller sentence for very short answers, gently", () => {
    expect(evaluateResponse(round, "mango").needsModelSentence).toBe(true);
    expect(evaluateResponse(round, "I love a sweet mango").needsModelSentence).toBe(false);
  });
  it("handles silence/blank input without failing", () => {
    const ev = evaluateResponse(round, "   ");
    expect(ev.understood).toBe(false);
    expect(ev.reply).toMatch(/tap a picture/i);
    expect(countWords("")).toBe(0);
  });
});
