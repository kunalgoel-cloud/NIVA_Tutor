import { expect, type Page } from "@playwright/test";

const WORDS: Record<string, number> = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

export async function startDemo(page: Page) {
  await page.goto("/");
  await page.locator("#start-demo").click();
  await expect(page).toHaveURL(/\/worlds$/);
}

export async function gateAnswer(page: Page): Promise<string> {
  const q = await page.getByTestId("gate-question").innerText();
  const m = q.match(/What is (\w+) plus (\w+)\?/)!;
  return String(WORDS[m[1]] + WORDS[m[2]]);
}

/** Solve the parent gate's words-based sum. */
export async function unlockParent(page: Page, path = "/parent") {
  await page.goto(path);
  await page.getByLabel(/Your answer/).fill(await gateAnswer(page));
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("navigation", { name: "Grown-ups sections" })).toBeVisible();
}

/** Play a count activity round with the right answers. */
export async function answerCountRound(page: Page, total: number) {
  const items = page.getByRole("button", { name: "Not counted yet" });
  for (let i = 0; i < total; i++) await items.first().click();
  await page.getByRole("group", { name: /How many/ }).getByRole("button", { name: String(total), exact: true }).click();
}
