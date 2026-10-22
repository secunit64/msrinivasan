import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

const publications = JSON.parse(
  readFileSync(
    new URL("../../src/data/publications.json", import.meta.url),
    "utf8",
  ),
);

const routes = [
  "",
  "projects.html",
  "publications.html",
  "about.html",
  "projects/red-sea-atlas.html",
  "projects/large-scale-visualization.html",
  "resume.html",
  "resume-long.html",
];

test("all pages work at root and project prefixes, without errors or overflow", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      response.url().startsWith("http://localhost")
    )
      errors.push(`${response.status()}: ${response.url()}`);
  });
  for (const prefix of ["/", "/msrinivasan/"]) {
    for (const route of routes) {
      const response = await page.goto(prefix + route);
      expect(response.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(
        await page
          .locator("img")
          .evaluateAll((images) =>
            images.every((image) => image.complete && image.naturalWidth > 0),
          ),
      ).toBe(true);
    }
  }
  expect(errors).toEqual([]);
});

test("topic filtering preserves the complete list and announces counts", async ({
  page,
}) => {
  await page.goto("/msrinivasan/publications.html");
  const select = page.getByLabel("Filter by topic");
  await expect(select).toBeVisible();
  await expect(page.locator(".publication:visible")).toHaveCount(
    publications.length,
  );
  await expect(page.locator(".publication").first()).toHaveAttribute(
    "id",
    "pub-pareto-lora",
  );
  await expect(page.locator("#pub-pareto-lora")).toContainText("WACV 2027");
  await expect(page.locator("#pub-pareto-lora .publication-status")).toHaveText(
    "Accepted",
  );
  await select.selectOption("AI");
  await expect(page.locator(".publication:visible")).toHaveCount(1);
  await expect(page.locator("#pub-pareto-lora")).toBeVisible();
  await select.selectOption("HPC");
  await expect(page.locator(".publication:visible")).toHaveCount(3);
  await expect(page.getByRole("status")).toHaveText("3 publications");
  await select.selectOption("Marine ecology");
  await expect(page.locator(".publication:visible")).toHaveCount(1);
  await expect(page.getByRole("status")).toHaveText("1 publication");
  await select.selectOption("");
  await expect(page.locator(".publication:visible")).toHaveCount(
    publications.length,
  );
});

test("profile and publications remain readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:4173/msrinivasan/");
  await expect(page.locator("h1")).toContainText("Srinivasan");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Publications" })
    .click();
  await expect(page.locator(".publication:visible")).toHaveCount(
    publications.length,
  );
  await expect(page.getByLabel("Filter by topic")).toBeHidden();
  await context.close();
});

test("navigation and filters are keyboard accessible", async ({
  page,
  browserName,
}) => {
  await page.goto("/msrinivasan/");
  // macOS WebKit uses Option-Tab to include links in keyboard traversal.
  await page.keyboard.press(
    browserName === "webkit" && process.platform === "darwin"
      ? "Alt+Tab"
      : "Tab",
  );
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#content")).toBeFocused();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Projects" })
    .click();
  await page
    .getByRole("heading", { name: "RedSeaAtlas", exact: true })
    .getByRole("link")
    .click();
  await expect(page).toHaveURL(/projects\/red-sea-atlas\.html$/);
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Projects" }),
  ).toHaveAttribute("aria-current", "page");
  await page.goto("/msrinivasan/publications.html");
  const select = page.getByLabel("Filter by topic");
  await expect(select).toBeVisible();
  await select.focus();
  await page.keyboard.press("h");
  await page.keyboard.press("Enter");
  await expect(select).toBeFocused();
});

test("primary pages pass automated WCAG accessibility checks", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto("/msrinivasan/" + route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(
        results.violations.map(({ id, nodes }) => ({
          id,
          elements: nodes.map((node) => node.target),
        })),
      ),
    ).toEqual([]);
  }
});

test("current résumé works and obsolete documents return not found", async ({
  request,
}) => {
  const response = await request.get("/msrinivasan/doc/resume.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("application/pdf");
  expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  for (const removed of [
    "biography.html",
    "doc/biography.pdf",
    "doc/resume-2023.pdf",
  ]) {
    expect((await request.get(`/msrinivasan/${removed}`)).status()).toBe(404);
  }
  expect((await request.get("/msrinivasan/missing.html")).status()).toBe(404);
});
