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

  test("a wrong answer must be followed by listening to the hint; only then do the choices open again", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    await expect(page.getByRole("heading", { name: "Count the Apples" })).toBeVisible();
    await page.locator("#start-activity").click();
    await expect(page.getByTestId("prompt")).toHaveText("How many apples?");
    const numbers = page.getByRole("group", { name: /How many/ });
    await numbers.getByRole("button", { name: "3", exact: true }).click(); // 2 apples are shown: wrong
    // The hint panel appears, kind and without the word "wrong", and the choices are locked.
    const panel = page.getByTestId("learn-panel");
    await expect(panel).toBeVisible();
    await expect(panel).not.toContainText(/wrong|fail|bad|stupid/i);
    await expect(panel).toContainText(/Touch each apple once/);
    await expect(numbers.getByRole("button", { name: "2", exact: true })).toBeDisabled();
    await expect(page.locator("#continue")).toHaveCount(0); // cannot move on
    await expect(page.locator("#got-it")).toBeDisabled(); // still listening
    await expect(page.locator("#got-it")).toBeEnabled({ timeout: 15_000 });
    await page.locator("#got-it").click();
    // Every choice is open again, including the one that was tried.
    await expect(numbers.getByRole("button", { name: "3", exact: true })).toBeEnabled();
    await expect(numbers.getByRole("button", { name: "1", exact: true })).toBeEnabled();
    await answerCountRound(page, 2);
    await expect(page.getByTestId("feedback")).toContainText("✓");
    await page.locator("#continue").click();
    await answerCountRound(page, 3);
    await page.locator("#continue").click();
    await answerCountRound(page, 3);
    await page.locator("#continue").click();
    await expect(page.getByTestId("complete")).toBeVisible();
  });

  test("there is no way to skip a part: only the right answer moves the game on", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    await page.locator("#start-activity").click();
    await expect(page.getByRole("button", { name: /Skip/ })).toHaveCount(0);
    await expect(page.locator("#continue")).toHaveCount(0);
    await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  });

  test("pause and stop are available and stopping early is fine", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    await page.locator("#start-activity").click();
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("dialog", { name: "Paused" })).toBeVisible();
    await page.getByRole("button", { name: /Keep playing/ }).click();
    await page.getByRole("button", { name: "Pause" }).click();
    await page.getByRole("button", { name: /Stop for now/ }).click();
    await expect(page).toHaveURL(/\/worlds\/number-kingdom/);
  });

  test("praise varies from one right answer to the next", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    await page.locator("#start-activity").click();
    const seen: string[] = [];
    const feedback = () => page.getByTestId("feedback").innerText().then((t) => t.replace("✓", "").trim()).catch(() => "");
    for (const n of [2, 3, 3]) {
      await answerCountRound(page, n);
      // The previous phrase may still be fading out; wait for a phrase that is different from the last one.
      const before = seen.at(-1) ?? "";
      await expect.poll(feedback, { timeout: 4000, message: "praise repeated the previous phrase" }).not.toBe(before);
      seen.push(await feedback());
      await page.locator("#continue").click();
    }
    expect(seen[0]).not.toBe(seen[1]);
    expect(seen[1]).not.toBe(seen[2]);
  });

  test("a story cannot be skipped: every page is heard, then the questions must be answered right", async ({ page }) => {
    test.setTimeout(120_000);
    await startDemo(page);
    await page.goto("/play/story-pip-and-the-red-balloon");
    await page.locator("#start-activity").click();
    // Pages: the next button only appears once the page has been heard (or read, with the sound off).
    for (let i = 0; i < 4; i++) {
      await expect(page.getByTestId("story-page")).toBeVisible();
      await expect(page.locator("#continue")).toHaveCount(0);
      await expect(page.locator("#continue")).toBeVisible({ timeout: 20_000 });
      await page.locator("#continue").click();
    }
    // Question 1: a wrong answer means listening to a hint, quoting the story, before trying again.
    await expect(page.getByTestId("prompt")).toHaveText("Who had a red balloon?");
    await page.getByRole("button", { name: "Bear" }).click();
    await expect(page.getByTestId("learn-panel")).toContainText("Pip the rabbit had a red balloon");
    await expect(page.locator("#continue")).toHaveCount(0);
    await expect(page.locator("#got-it")).toBeEnabled({ timeout: 15_000 });
    await page.locator("#got-it").click();
    await page.getByRole("button", { name: "Pip the rabbit" }).click();
    await page.locator("#continue").click();
    await page.getByRole("button", { name: "the wind" }).click();
    await page.locator("#continue").click();
    await page.getByRole("button", { name: "Duck" }).click();
    await page.locator("#continue").click();
    await expect(page.getByTestId("complete")).toBeVisible();
  });

  test("a maze can be solved with the arrow buttons; walls just say so", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/help-the-mouse-find-the-cheese");
    await page.locator("#start-activity").click();
    await expect(page.getByTestId("maze")).toBeVisible();
    for (let round = 0; round < 3; round++) {
      const grid = await page.evaluate(() => {
        const cells = [...document.querySelectorAll("[data-cell]")].map((el) => ({ pos: el.getAttribute("data-cell")!.split(",").map(Number), label: el.getAttribute("aria-label")! }));
        const rows = Math.max(...cells.map((c) => c.pos[0])) + 1, cols = Math.max(...cells.map((c) => c.pos[1])) + 1;
        const g = Array.from({ length: rows }, () => Array<string>(cols).fill("#"));
        for (const c of cells) g[c.pos[0]][c.pos[1]] = c.label === "Wall" ? "#" : c.label === "You are here" ? "S" : c.label === "The goal" ? "G" : ".";
        return g;
      });
      const find = (ch: string) => { for (let r = 0; r < grid.length; r++) { const c = grid[r].indexOf(ch); if (c >= 0) return [r, c]; } return [0, 0]; };
      const [sr, sc] = find("S"), [gr, gc] = find("G");
      const prev = new Map<string, string | null>([[`${sr},${sc}`, null]]);
      const q: number[][] = [[sr, sc]];
      for (let i = 0; i < q.length; i++) for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const r = q[i][0] + dr, c = q[i][1] + dc;
        if (grid[r]?.[c] && grid[r][c] !== "#" && !prev.has(`${r},${c}`)) { prev.set(`${r},${c}`, `${q[i][0]},${q[i][1]}`); q.push([r, c]); }
      }
      const path: number[][] = [];
      for (let k: string | null = `${gr},${gc}`; k; k = prev.get(k) ?? null) path.unshift(k.split(",").map(Number));
      if (round === 0) { // a wall is gentle
        const open = [["Up", -1, 0], ["Down", 1, 0], ["Left", 0, -1], ["Right", 0, 1]].find(([, dr, dc]) => grid[sr + (dr as number)]?.[sc + (dc as number)] === "#");
        if (open) { await page.getByRole("button", { name: open[0] as string, exact: true }).click(); await expect(page.getByText("That's a wall! Try another way.")).toBeVisible(); }
      }
      for (let k = 1; k < path.length; k++) {
        const dr = path[k][0] - path[k - 1][0], dc = path[k][1] - path[k - 1][1];
        await page.getByRole("button", { name: dr === -1 ? "Up" : dr === 1 ? "Down" : dc === -1 ? "Left" : "Right", exact: true }).click();
      }
      await expect(page.getByTestId("feedback")).toContainText("✓");
      await page.locator("#continue").click();
    }
    await expect(page.getByTestId("complete")).toBeVisible();
  });

  test("ideas such as kindness are shown as words, not symbols, and can be read aloud", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/kind-words");
    await page.locator("#start-activity").click();
    await expect(page.getByRole("button", { name: "please and thank you" })).toBeVisible();
    await expect(page.getByText("please and thank you")).toBeVisible();
    await expect(page.getByText("🙏")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Hear the choices" })).toBeVisible();
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
