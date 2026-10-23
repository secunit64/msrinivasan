import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("temporary monogram gallery is unlisted, responsive, and accessible on both surfaces", async ({
  page,
  request,
}) => {
  await page.goto("/msrinivasan/monograms.html");
  await expect(page.locator(".monogram-card")).toHaveCount(17);
  await expect(page.locator(".custom-studies .monogram-card")).toHaveCount(2);
  for (const variant of ["faithful", "navigation"]) {
    const response = await request.get(
      `/msrinivasan/assets/monograms/sm-${variant}.svg`,
    );
    expect(response.status()).toBe(200);
    const svg = await response.text();
    expect(svg).toContain("<path");
    expect(svg).not.toMatch(/<(?:image|text|script|foreignObject)\b|data:/i);
  }
  expect(
    await page
      .locator(".custom-studies img")
      .evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
  ).toBe(true);
  await expect(page.locator(".signature-studies .monogram-card")).toHaveCount(
    3,
  );
  for (const family of [
    "Sacramento",
    "Allura",
    "Great Vibes",
    "Pinyon Script",
  ]) {
    const loaded = await page.evaluate(
      async (font) =>
        (await document.fonts.load(`100px "${font}"`, "S.M")).length,
      family,
    );
    expect(loaded).toBeGreaterThan(0);
  }
  for (const card of await page.locator(".local-font-card").all()) {
    await expect(card).toHaveAttribute(
      "data-font-state",
      /^(available|unavailable)$/,
    );
    const available =
      (await card.getAttribute("data-font-state")) === "available";
    await expect(card.locator(".local-font-preview")).toBeVisible({
      visible: available,
    });
    await expect(card.locator(".font-unavailable")).toBeVisible({
      visible: !available,
    });
  }
  await page.locator("#monogram-12 .swash-toggle").check();
  await expect(page.locator("#monogram-12 .monogram")).toHaveCSS(
    "font-feature-settings",
    /"swsh"(?: 1)?/,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  await expect(page.locator(".wordmark")).toHaveAccessibleName(
    "Madhu Srinivasan, home",
  );
  await expect(page.locator(".wordmark")).toHaveText("ms.");
  await expect(page.locator(".wordmark img")).toHaveCount(0);
  await expect(
    page
      .locator(".monogram-card")
      .filter({ has: page.locator("#editorial-mark") })
      .locator(".pick"),
  ).toHaveText("Active");
  await expect(page.locator("#monogram-16 .pick")).toHaveCount(0);
  expect(await page.getByRole("navigation").textContent()).not.toContain(
    "Monogram",
  );
  const sitemap = await request.get("/msrinivasan/sitemap.xml");
  expect(await sitemap.text()).not.toContain("monograms");

  for (const [surface, color] of [
    ["Paper", "rgb(240, 243, 241)"],
    ["Ink", "rgb(24, 48, 63)"],
  ]) {
    await page.getByRole("radio", { name: surface, exact: true }).check();
    await expect(page.locator(".monogram-stage").first()).toHaveCSS(
      "background-color",
      color,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(
        results.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map((node) => node.target),
        })),
      ),
    ).toEqual([]);
  }
});
