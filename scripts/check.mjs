import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { load } from "cheerio";
import { htmlFiles } from "./finalize.mjs";
import { validatePublications } from "./publications.mjs";

const records = validatePublications(
  JSON.parse(await readFile("src/data/publications.json", "utf8")),
);
const required = [
  "index",
  "projects",
  "publications",
  "about",
  "resume",
  "resume-long",
  "404",
  "projects/red-sea-atlas",
  "projects/large-scale-visualization",
];
for (const route of required) await access(`dist/${route}.html`);
const pdf = await readFile("dist/doc/resume.pdf");
assert.equal(pdf.subarray(0, 5).toString(), "%PDF-", "Invalid résumé PDF");
const root = resolve("dist");
const pages = await htmlFiles("dist");
let checked = 0;
for (const file of pages) {
  const html = await readFile(file, "utf8");
  const $ = load(html);
  assert.equal(
    $("html").attr("lang"),
    "en",
    `${file}: missing document language`,
  );
  assert.equal($("h1").length, 1, `${file}: expected one h1`);
  assert($("title").text().trim(), `${file}: missing title`);
  for (const account of ["secunit64", "madhuatx"]) {
    assert.equal(
      $(`.footer-links a[href="https://github.com/${account}"]`).length,
      1,
      `${file}: missing GitHub account ${account}`,
    );
  }
  assert.equal(
    $('a[href="https://github.com/neuralvis"]').length,
    0,
    `${file}: outdated GitHub profile`,
  );
  assert(
    $('meta[name="description"]').attr("content"),
    `${file}: missing description`,
  );
  assert.equal(
    $('link[rel="canonical"]').length,
    1,
    `${file}: expected canonical URL`,
  );
  assert(
    !html.includes("UA-139553465") && !html.includes("jquery"),
    `${file}: legacy scripts remain`,
  );
  assert(
    !/TODO\(|\{\{[A-Z_]+\}\}/.test(html),
    `${file}: unresolved placeholder`,
  );
  for (const element of $(
    "a[href], link[href], script[src], img[src]",
  ).toArray()) {
    const value = $(element).attr("href") || $(element).attr("src");
    if (!value || /^(?:[a-z]+:|\/\/|data:)/i.test(value)) continue;
    const url = new URL(value, "https://local.test/" + file.slice(5));
    // Framework emits a base-prefixed homepage link specifically for its 404 page.
    let pathname = decodeURIComponent(url.pathname).replace(
      /^\/msrinivasan\//,
      "/",
    );
    if (pathname.endsWith("/")) pathname += "index.html";
    const target = resolve(root, `.${pathname}`);
    assert(
      target.startsWith(root + sep),
      `${file}: path escapes output: ${value}`,
    );
    await access(target).catch(() => {
      throw new Error(`${file}: missing ${value} (${target})`);
    });
    if (url.hash && target.endsWith(".html")) {
      const targetPage =
        target === resolve(file) ? $ : load(await readFile(target, "utf8"));
      const id = decodeURIComponent(url.hash.slice(1));
      assert(
        targetPage("[id]")
          .toArray()
          .some((node) => targetPage(node).attr("id") === id),
        `${file}: missing anchor ${value}`,
      );
    }
    checked++;
  }
}
const bibliography = load(await readFile("dist/publications.html", "utf8"));
assert.equal(
  bibliography(".publication").length,
  records.length,
  "Publications must be rendered without JavaScript",
);
assert.equal(
  bibliography("#publication-controls").is("[hidden]"),
  true,
  "Hide inactive controls without JavaScript",
);
await access("dist/sitemap.xml");
for (const removed of [
  "biography.html",
  "doc/biography.pdf",
  "doc/resume-2023.pdf",
]) {
  await assert.rejects(access(`dist/${removed}`), { code: "ENOENT" });
}
console.log(
  `Checked ${pages.length} pages, ${checked} local references, ${records.length} static publications, and the current résumé PDF. Obsolete documents are absent.`,
);
