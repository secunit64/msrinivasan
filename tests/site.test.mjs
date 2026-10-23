import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import {
  escapeHtml,
  relativeRoot,
  siteHeader,
  siteHead,
} from "../scripts/layout.mjs";
import {
  publicationMarkup,
  validatePublications,
} from "../scripts/publications.mjs";

const records = JSON.parse(
  await readFile(
    new URL("../src/data/publications.json", import.meta.url),
    "utf8",
  ),
);

test("navigation resolves relative to nested pages and marks the active section", () => {
  assert.equal(relativeRoot("/index"), "./");
  assert.equal(relativeRoot("/projects/red-sea-atlas"), "../");
  assert.equal(relativeRoot("/"), "./");
  const $ = load(siteHeader({ path: "/projects/red-sea-atlas" }));
  assert.equal($('a[aria-current="page"]').text(), "Projects");
  assert.equal($('a[aria-current="page"]').attr("href"), "../projects.html");
});

test("editorial ms. branding uses text and the matching favicon", async () => {
  const $ = load(siteHeader({ path: "/index" }));
  assert.equal($(".wordmark").text(), "ms.");
  assert.equal($(".wordmark img").length, 0);
  assert.equal($(".wordmark").attr("aria-label"), "Madhu Srinivasan, home");
  assert(
    siteHead({ title: "Home", path: "/index" }).includes(
      'href="./assets/mark.svg"',
    ),
  );
  const favicon = load(
    await readFile(new URL("../src/assets/mark.svg", import.meta.url), "utf8"),
    { xml: true },
  );
  assert.equal(favicon("text").text(), "ms.");
  assert.equal(favicon("text").attr("font-weight"), "400");
  assert(favicon("text").attr("font-family").includes("Georgia"));
});

test("bibliography is static, ordered, complete and escaped", () => {
  const $ = load(publicationMarkup(records));
  assert.equal($(".publication").length, records.length);
  const years = $(".publication-year")
    .toArray()
    .map((item) => Number($(item).text()));
  assert.deepEqual(
    years,
    [...years].sort((a, b) => b - a),
  );
  assert.equal($("#publication-controls").is("[hidden]"), true);
  assert.equal($("script").length, 0);
  assert.equal(
    escapeHtml('<img onerror="x">&'),
    "&lt;img onerror=&quot;x&quot;&gt;&amp;",
  );
  const malicious = [{ ...records[0], title: "<script>alert(1)</script>" }];
  assert.equal(load(publicationMarkup(malicious))("script").length, 0);
});

test("publication validation rejects duplicates, malformed IDs, missing fields and unsafe URLs", () => {
  assert.throws(
    () => validatePublications([records[0], records[0]]),
    /duplicate/,
  );
  assert.throws(
    () => validatePublications([{ ...records[0], id: '"><script>' }]),
    /Invalid/,
  );
  assert.throws(
    () => validatePublications([{ ...records[0], year: "2021" }]),
    /Invalid year/,
  );
  assert.throws(
    () => validatePublications([{ ...records[0], title: "" }]),
    /Missing title/,
  );
  assert.throws(
    () => validatePublications([{ ...records[0], url: "javascript:alert(1)" }]),
    /Insecure/,
  );
});
