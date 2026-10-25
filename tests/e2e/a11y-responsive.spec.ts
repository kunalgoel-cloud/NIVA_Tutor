import { expect, test, type Page } from "@playwright/test";
import { startDemo, unlockParent } from "./helpers";

/** Every visible interactive element must be at least 44x44 CSS px (Apple HIG minimum). Child UI aims for 64. */
async function smallTargets(page: Page, min = 44) {
  return page.evaluate((min) => {
    const bad: string[] = [];
    document.querySelectorAll<HTMLElement>("main a, main button, header a, header button, main input, main summary, nav a").forEach((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width === 0 || r.height === 0 || cs.visibility === "hidden" || el.closest("details:not([open]) > :not(summary)")) return;
      if (el.matches("input[type=checkbox],input[type=radio]")) return;
      if (r.width < min - 0.5 || r.height < min - 0.5) bad.push(`${el.tagName} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
    });
    return bad;
  }, min);
}
const noHScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

for (const vp of [{ name: "iPad portrait", width: 820, height: 1180 }, { name: "iPad landscape", width: 1180, height: 820 }, { name: "phone", width: 390, height: 844 }]) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test("child screens: no horizontal scroll and large touch targets", async ({ page }) => {
      await startDemo(page);
      for (const path of ["/worlds", "/worlds/number-kingdom", "/today", "/explore", "/play/count-the-apples"]) {
        await page.goto(path);
        if (path.startsWith("/play")) await page.locator("#start-activity").click();
        await page.waitForTimeout(150);
        expect(await noHScroll(page), `${path} scrolls horizontally`).toBe(true);
        expect(await smallTargets(page), `${path} has small touch targets`).toEqual([]);
      }
    });

    test("every engine layout fits the screen", async ({ page }) => {
      await startDemo(page);
      for (const id of ["feed-the-dinosaur", "match-the-pairs", "sort-by-size", "build-a-number-train", "find-the-odd-one-out", "meet-the-friendly-alien", "count-to-ten-parade", "help-the-mouse-find-the-cheese", "rocket-to-the-planet", "the-castle-maze", "story-pip-and-the-red-balloon", "kind-words", "find-the-letters-a-to-f", "match-capital-and-small-a-b-c-d-e-f"]) {
        await page.goto(`/play/${id}`);
        await page.locator("#start-activity").click();
        await page.waitForTimeout(150);
        expect(await noHScroll(page), `${id} scrolls horizontally`).toBe(true);
        expect(await smallTargets(page), `${id} small targets`).toEqual([]);
      }
    });
  });
}

test("parent screens fit a tablet and have 44px targets", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await startDemo(page);
  await unlockParent(page);
  for (const path of ["/parent", "/parent/progress", "/parent/history", "/parent/library", "/parent/settings", "/parent/data"]) {
    await page.goto(path);
    await page.waitForTimeout(150);
    expect(await noHScroll(page), `${path} scrolls horizontally`).toBe(true);
    expect(await smallTargets(page), `${path} small targets`).toEqual([]);
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("animations are effectively disabled", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    const d = await page.evaluate(() => {
      const el = document.createElement("div"); el.className = "anim-bob"; document.body.appendChild(el);
      return getComputedStyle(el).animationDuration;
    });
    expect(parseFloat(d)).toBeLessThan(0.01);
  });
});

test("icons and controls have accessible names; page has landmarks and language", async ({ page }) => {
  await startDemo(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("main")).toHaveCount(1);
  const unnamed = await page.evaluate(() => [...document.querySelectorAll("svg[role=img]")].filter((s) => !s.getAttribute("aria-label")).length);
  expect(unnamed).toBe(0);
  const noName = await page.evaluate(() => [...document.querySelectorAll("button, a")].filter((e) => !(e.textContent || "").trim() && !e.getAttribute("aria-label")).length);
  expect(noName).toBe(0);
});

test("feedback never relies on colour alone: tries and successes carry symbols", async ({ page }) => {
  await startDemo(page);
  await page.goto("/play/find-the-odd-one-out");
  await page.locator("#start-activity").click();
  await page.getByRole("button", { name: "apple" }).click();
  await expect(page.getByTestId("learn-panel").getByText("💡")).toBeVisible(); // a hint panel with a symbol, not just a colour
  await expect(page.locator("#got-it")).toBeEnabled({ timeout: 15_000 });
  await page.locator("#got-it").click();
  await page.getByRole("button", { name: "car" }).click();
  await expect(page.getByText("✓").first()).toBeVisible();
});
