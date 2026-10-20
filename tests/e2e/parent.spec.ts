import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import { answerCountRound, gateAnswer, startDemo, unlockParent } from "./helpers";

test.describe("parent area", () => {
  test("is protected by the gate and rejects a wrong answer", async ({ page }) => {
    await startDemo(page);
    await page.goto("/parent");
    await expect(page.getByRole("heading", { name: "Grown-ups only" })).toBeVisible();
    await expect(page.getByTestId("gate-question")).not.toContainText(/\d/);
    await page.getByLabel(/Your answer/).fill("1");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("#gate-error")).toContainText(/isn't quite right/);
    await expect(page.getByRole("navigation", { name: "Grown-ups sections" })).toHaveCount(0);
    for (const sub of ["/parent/progress", "/parent/settings", "/parent/data", "/parent/library", "/parent/history"]) {
      await page.goto(sub);
      await expect(page.getByRole("heading", { name: "Grown-ups only" })).toBeVisible();
    }
  });

  test("shows progress evidence after the child plays", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    await page.locator("#start-activity").click();
    for (const n of [2, 3, 3]) { await answerCountRound(page, n); await page.locator("#continue").click(); }
    await expect(page.getByTestId("complete")).toBeVisible();

    await unlockParent(page);
    await expect(page.getByRole("heading", { name: /Overview for Demo Explorer/ })).toBeVisible();
    await expect(page.getByTestId("demo-banner")).toBeVisible();
    await expect(page.getByText("Count the Apples").first()).toBeVisible();
    await page.getByRole("link", { name: "Progress" }).click();
    const row = page.getByTestId("objective-row").filter({ has: page.locator("summary strong", { hasText: "Count up to 3 objects" }) });
    await expect(row).toContainText(/Introduced|Practising|Demonstrated/);
    await page.getByLabel("Only goals already started").check();
    expect(await page.getByTestId("objective-row").count()).toBe(1);
    await page.getByRole("link", { name: "History" }).click();
    await expect(page.getByRole("table")).toContainText("Count the Apples");
    await page.getByLabel("Outcome").selectOption("shown");
    await expect(page.getByText("Nothing matches these filters.")).toBeVisible();
  });

  test("suggestions explain why they were chosen, and offline ideas are separate", async ({ page }) => {
    await startDemo(page);
    await unlockParent(page);
    await expect(page.getByRole("heading", { name: "Suggested next activities" })).toBeVisible();
    await expect(page.getByText(/A new idea to explore/).first()).toBeVisible();
    await expect(page.getByText(/never counted as completed digital activities/)).toBeVisible();
  });

  test("settings change and persist across reload; AI shows a clear not-configured message", async ({ page }) => {
    await startDemo(page);
    await unlockParent(page, "/parent/settings");
    await page.getByLabel("Activities in Today's Adventure").selectOption("3");
    await expect(page.getByText("✓ Saved")).toBeVisible();
    await expect(page.getByTestId("ai-status")).toContainText("not configured");
    await expect(page.getByText(/AI chat is not set up yet. This is fine/)).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /Let my child talk/ })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: /Allow AI-powered replies/ })).not.toBeChecked();
    await page.reload();
    await expect(page.getByLabel("Activities in Today's Adventure")).toHaveValue("3");
    await page.goto("/today");
    expect(await page.getByTestId("activity-card").count()).toBe(3);
  });

  test("retiring an activity hides it from the child immediately", async ({ page }) => {
    await startDemo(page);
    await unlockParent(page, "/parent/library");
    await page.getByLabel("Search").fill("Shape Detective");
    const row = page.getByTestId("library-row").first();
    await row.locator("summary").click();
    await row.getByRole("button", { name: "Retire" }).click();
    await expect(page.getByRole("status").filter({ hasText: /is now retired/ })).toBeVisible();
    await page.goto("/worlds/number-kingdom");
    await expect(page.getByRole("link", { name: /Shape Detective/ })).toHaveCount(0);
    await page.goto("/play/shape-detective");
    await expect(page.getByTestId("unavailable")).toBeVisible();
  });

  test("a retired activity returns via validated -> published, never straight back", async ({ page }) => {
    await startDemo(page);
    await unlockParent(page, "/parent/library");
    await page.getByLabel("Search").fill("Shape Detective");
    const row = page.getByTestId("library-row").first();
    await row.locator("summary").click();
    await row.getByRole("button", { name: "Retire" }).click();
    await expect(row.getByRole("button", { name: "Publish" })).toHaveCount(0);
    await row.getByRole("button", { name: /Restore/ }).click();
    await expect(row).toContainText("validated");
    await row.getByRole("button", { name: "Publish" }).click();
    await expect(row).toContainText("visible to child");
  });

  test("library shows framework mappings and a candid, pending source register", async ({ page }) => {
    await startDemo(page);
    await unlockParent(page, "/parent/library");
    await page.getByRole("tab", { name: "Curriculum sources" }).click();
    await expect(page.getByText(/Source verification is still/)).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(7);
    await page.getByRole("tab", { name: "Learning goals" }).click();
    await page.getByTestId("objective-row").first().count();
    await page.locator("details").first().locator("summary").click();
    await expect(page.getByText(/Framework mapping/).first()).toBeVisible();
  });

  test("export downloads the child's data; delete removes it", async ({ page }) => {
    await startDemo(page);
    await page.goto("/play/count-the-apples");
    await page.locator("#start-activity").click();
    await answerCountRound(page, 2);
    await page.locator("#continue").click();
    await page.getByRole("button", { name: "Pause" }).click();
    await page.getByRole("button", { name: /Stop for now/ }).click();

    await unlockParent(page, "/parent/data");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Download export/ }).click()]);
    expect(dl.suggestedFilename()).toMatch(/^little-wonder-world-export-.*\.json$/);
    const json = JSON.parse(await fs.readFile((await dl.path())!, "utf8"));
    expect(json.format).toBe("little-wonder-world-export/1");
    expect(json.attempts.length).toBe(1);
    expect(json.attempts[0].completionStatus).toBe("exited-early");

    const del = page.getByRole("button", { name: "Delete profile" });
    await expect(del).toBeDisabled();
    await page.locator("#del-confirm").fill("DELETE");
    await del.click();
    await expect(page.getByText(/Deleted Demo Explorer/)).toBeVisible();
    await page.goto("/");
    await expect(page.locator("#start-demo")).toBeVisible();
  });

  test("a real profile is created without demo labelling; demo reset has nothing to remove", async ({ page }) => {
    await unlockParent(page, "/parent/setup");
    await page.locator("#nick").fill("Little Star");
    await page.getByRole("button", { name: "Create profile" }).click();
    await expect(page.getByRole("heading", { name: /Overview for Little Star/ })).toBeVisible();
    await expect(page.getByTestId("demo-banner")).toHaveCount(0);
    await page.goto("/parent/data");
    await expect(page.getByRole("button", { name: "Reset demo data" })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Add sample history/ })).toBeDisabled(); // never into a real profile
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Little Star/ })).toBeVisible();
  });

  test("keyboard: the gate can be completed and nav reached without a mouse", async ({ page }) => {
    await startDemo(page);
    await page.goto("/parent");
    await page.getByLabel(/Your answer/).focus();
    await page.keyboard.type(await gateAnswer(page));
    await page.keyboard.press("Enter");
    await expect(page.getByRole("navigation", { name: "Grown-ups sections" })).toBeVisible();
    await page.getByRole("link", { name: "Overview" }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Progress" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/parent\/progress/);
  });
});

test.describe("cloud account page", () => {
  test("loads, explains where progress is saved, and never blocks play when signed out", async ({ page }) => {
    await startDemo(page);
    await unlockParent(page, "/parent/account");
    await expect(page.getByRole("heading", { name: /Account & cloud storage/ })).toBeVisible();
    await expect(page.getByText(/Where progress is saved/)).toBeVisible();
    // Either Supabase is not configured in this build, or the sign-in form is offered. Both are valid and neither blocks the child.
    const form = page.locator("#acct-email");
    if (await form.count()) {
      await expect(page.getByText(/on this device only/)).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    } else {
      await expect(page.getByText(/not set up/)).toBeVisible();
    }
    await page.goto("/worlds");
    await expect(page.getByRole("link", { name: /Number Kingdom/ })).toBeVisible();
  });
});
