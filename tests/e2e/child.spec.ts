import { expect, test } from "@playwright/test";
import { answerCountRound, startDemo } from "./helpers";

test.describe("child experience", () => {
  test("opens the welcome screen, starts, and shows all five worlds plus Today's Adventure", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Little Wonder World" })).toBeVisible();
    await startDemo(page);
    for (const w of ["Number Kingdom", "Conversation Café", "Puzzle Planet", "Wonder World", "Creativity Forest"])
      await expect(page.getByRole("link", { name: new RegExp(w) })).toBeVisible();
    await expect(page.locator("#todays-adventure")).toBeVisible();
  });

  test("navigates into every world and each shows activities", async ({ page }) => {
    await startDemo(page);
    for (const [slug, title] of [["number-kingdom", "Number Kingdom"], ["conversation-cafe", "Conversation Café"], ["puzzle-planet", "Puzzle Planet"], ["wonder-world", "Wonder World"], ["creativity-forest", "Creativity Forest"]]) {
      await page.goto("/worlds");
      await page.getByRole("link", { name: new RegExp(title) }).click();
      await expect(page).toHaveURL(new RegExp(`/worlds/${slug}$`));
      expect(await page.getByTestId("activity-card").count()).toBeGreaterThan(3);
    }
  });

  test("plays an activity: wrong answer gets kind feedback + hint offer, right answer completes it", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    await expect(page.getByRole("heading", { name: "Count the Apples" })).toBeVisible();
    await page.locator("#start-activity").click();
    await expect(page.getByTestId("prompt")).toHaveText("How many apples?");
    const group = page.getByRole("group", { name: /How many/ });
    await group.getByRole("button", { name: "3", exact: true }).click(); // 2 apples are shown: wrong
    const fb = page.getByTestId("feedback");
    await expect(fb).toBeVisible();
    await expect(fb).not.toContainText(/wrong|fail|bad|stupid/i);
    await expect(page.getByText("Would you like a little hint?")).toBeVisible();
    await page.getByRole("button", { name: "Show a hint" }).click();
    await expect(page.getByText(/Touch each apple once/).first()).toBeVisible();
    await answerCountRound(page, 2);
    await expect(page.getByTestId("feedback")).toContainText("✓");
    await page.locator("#continue").click();
    await answerCountRound(page, 3);
    await page.locator("#continue").click();
    await answerCountRound(page, 3);
    await page.locator("#continue").click();
    await expect(page.getByTestId("complete")).toBeVisible();
    await expect(page.getByTestId("complete")).toContainText(/worked hard|wonderful|playing/i);
  });

  test("pause, skip and stop are available and stopping early is fine", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    await page.locator("#start-activity").click();
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("dialog", { name: "Paused" })).toBeVisible();
    await page.getByRole("button", { name: /Keep playing/ }).click();
    await page.getByRole("button", { name: "Skip this one" }).click();
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
    await page.getByRole("button", { name: "Pause" }).click();
    await page.getByRole("button", { name: /Stop for now/ }).click();
    await expect(page).toHaveURL(/\/worlds\/number-kingdom/);
  });

  test("a conversation activity works with taps only (no microphone, no AI)", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/meet-the-friendly-alien");
    await page.locator("#start-activity").click();
    await page.getByRole("button", { name: "Mango" }).click();
    await expect(page.getByText(/Mangoes are delicious/)).toBeVisible();
    await expect(page.getByText(/tap a picture/i).first()).toBeVisible();
    await page.getByRole("button", { name: "Apple" }).click();
    await expect(page.getByTestId("feedback")).toBeVisible();
    await expect(page.locator("#continue")).toBeVisible();
  });

  test("the grown-up can type the child's words and gets a context-aware reply", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/meet-the-friendly-alien");
    await page.locator("#start-activity").click();
    await page.getByText("Grown-up: type what your child says").click();
    await page.locator("#typed-reply").fill("I like mangoes because they are sweet");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(/Mangoes are delicious/)).toBeVisible();
  });

  test("Today's Adventure shows a balanced set and a clearly separate offline mission", async ({ page }) => {
    await startDemo(page);
    await page.locator("#todays-adventure").click();
    await expect(page.getByRole("heading", { name: "Today's Adventure" })).toBeVisible();
    expect(await page.getByTestId("activity-card").count()).toBe(4);
    await expect(page.getByLabel("Grown-up mission")).toContainText(/not a game/i);
  });

  test("an unknown or unpublished activity shows a calm fallback, not a crash", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/does-not-exist");
    await expect(page.getByTestId("unavailable")).toBeVisible();
    await page.goto("/totally/missing");
    await expect(page.getByText("We took a wrong turn!")).toBeVisible();
  });

  test("offline: banner appears and games keep working", async ({ page, context }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    await page.locator("#start-activity").click();
    await context.setOffline(true);
    await expect(page.getByText(/You are offline/)).toBeVisible();
    await answerCountRound(page, 2);
    await expect(page.getByTestId("feedback")).toContainText("✓");
    await context.setOffline(false);
  });

  test("sound toggle is a labelled, pressed-state button", async ({ page }) => {
    await startDemo(page);
    const btn = page.getByRole("button", { name: /Sound is on/ });
    await expect(btn).toHaveAttribute("aria-pressed", "false");
    await btn.click();
    await expect(page.getByRole("button", { name: /Sound is off/ })).toHaveAttribute("aria-pressed", "true");
  });
});
