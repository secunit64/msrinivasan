import { test } from "node:test";
import assert from "node:assert/strict";
import { showInstalledScriptFonts } from "../src/components/local-script-fonts.js";

for (const [name, load, available] of [
  ["loaded local font", async () => [{ status: "loaded" }], true],
  ["no matching face", async () => [], false],
  [
    "failed local font",
    async () => {
      throw new Error("Font unavailable");
    },
    false,
  ],
]) {
  test(`script gallery handles ${name} without a substitute`, async () => {
    const preview = { hidden: true };
    const unavailable = { hidden: false };
    const status = { textContent: "" };
    const elements = {
      ".local-font-preview": preview,
      ".font-unavailable": unavailable,
      ".font-local-status": status,
    };
    const card = {
      dataset: { fontFamily: "Test Local" },
      querySelector: (selector) => elements[selector],
    };
    await showInstalledScriptFonts({
      querySelectorAll: () => [card],
      fonts: { load },
    });
    assert.equal(preview.hidden, !available);
    assert.equal(unavailable.hidden, available);
    assert.equal(
      card.dataset.fontState,
      available ? "available" : "unavailable",
    );
    assert.match(
      status.textContent,
      available ? /installed font/ : /No substitute/,
    );
  });
}
