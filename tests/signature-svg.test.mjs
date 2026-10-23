import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";

for (const variant of ["faithful", "navigation"]) {
  test(`${variant} signature monogram is standalone, accessible vector artwork`, async () => {
    const svg = await readFile(
      new URL(`../src/assets/monograms/sm-${variant}.svg`, import.meta.url),
      "utf8",
    );
    const $ = load(svg, { xml: true });
    assert.equal($("svg").attr("xmlns"), "http://www.w3.org/2000/svg");
    assert($("svg").attr("viewBox"));
    assert.equal($("svg").attr("role"), "img");
    assert($("title").text().includes("S.M"));
    assert($("desc").text().length > 50);
    assert($("path").length > 0);
    assert.equal($("image, text, script, foreignObject").length, 0);
    assert(
      !/(?:https?:\/\/|data:)/.test(
        svg.replace('xmlns="http://www.w3.org/2000/svg"', ""),
      ),
    );
  });
}
