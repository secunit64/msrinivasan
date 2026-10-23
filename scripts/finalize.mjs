import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { load } from "cheerio";
import { escapeHtml } from "./layout.mjs";

export async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(path)));
    else if (path.endsWith(".html") && entry.name !== "LICENSE.html")
      files.push(path);
  }
  return files;
}

async function finalize() {
  const site = new URL(
    process.env.SITE_URL || "https://secunit64.github.io/msrinivasan/",
  );
  if (!site.pathname.endsWith("/") || site.protocol !== "https:") {
    throw new Error("SITE_URL must be an HTTPS URL ending with /");
  }
  await mkdir("dist/doc", { recursive: true });
  await cp("doc/resume.pdf", "dist/doc/resume.pdf");
  await cp("src/assets", "dist/assets", { recursive: true });
  // Keep license notices for the historical HTML5 Boilerplate files.
  await cp("LICENSE.html", "dist/LICENSE.html");
  const locations = [];
  for (const file of await htmlFiles("dist")) {
    const $ = load(await readFile(file, "utf8"));
    $("html").attr("lang", "en");
    $('meta[name="viewport"]').attr(
      "content",
      "width=device-width, initial-scale=1",
    );
    const route = file.replace(/^dist\//, "").replace(/^index\.html$/, "");
    const url = new URL(route, site).href;
    $("head").append(
      `<link rel="canonical" href="${escapeHtml(url)}"><meta property="og:url" content="${escapeHtml(url)}">`,
    );
    const noindex = ($('meta[name="robots"]').attr("content") || "")
      .split(/[\s,]+/)
      .includes("noindex");
    if (route !== "404.html" && !noindex) locations.push(url);
    await writeFile(file, $.html());
  }
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations.map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join("")}</urlset>\n`,
  );
  // CNAME is deliberately not copied: the configured Pages origin has no custom domain.
  console.log(`Finalized ${locations.length} pages for ${site.href}`);
}

if (
  process.argv[1] &&
  import.meta.url === new URL(process.argv[1], "file:").href
) {
  await finalize();
}
