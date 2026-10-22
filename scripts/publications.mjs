import { readFileSync } from "node:fs";
import { escapeHtml } from "./layout.mjs";

export function validatePublications(records) {
  const ids = new Set();
  for (const record of records) {
    if (!/^pub-[a-z0-9-]+$/.test(record.id) || ids.has(record.id)) {
      throw new Error(`Invalid or duplicate publication id: ${record.id}`);
    }
    ids.add(record.id);
    if (!Number.isInteger(record.year) || record.year < 1900)
      throw new Error(`Invalid year: ${record.id}`);
    for (const field of ["title", "authors", "venue", "status"]) {
      if (typeof record[field] !== "string" || !record[field].trim())
        throw new Error(`Missing ${field}: ${record.id}`);
    }
    if (
      !Array.isArray(record.topics) ||
      !record.topics.length ||
      record.topics.some((topic) => typeof topic !== "string" || !topic)
    )
      throw new Error(`Invalid topics: ${record.id}`);
    for (const field of ["url", "video"]) {
      if (record[field] && new URL(record[field]).protocol !== "https:")
        throw new Error(`Insecure ${field}: ${record.id}`);
    }
    if (!record.url) throw new Error(`Missing url: ${record.id}`);
  }
  return records;
}

export function publicationMarkup(records) {
  validatePublications(records);
  const sorted = [...records].sort((a, b) => b.year - a.year);
  const topics = [
    ...new Set(records.flatMap((record) => record.topics)),
  ].sort();
  return `<div class="publication-controls" id="publication-controls" hidden>
    <label for="publication-topic">Filter by topic</label>
    <select id="publication-topic"><option value="">All topics</option>${topics.map((topic) => `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`).join("")}</select>
    <span id="publication-count" role="status" aria-live="polite">${records.length} publications</span>
    </div>
    <ol class="publication-list" aria-label="Selected publications">
    ${sorted
      .map(
        (
          record,
        ) => `<li class="publication" id="${record.id}" data-topics="${escapeHtml(JSON.stringify(record.topics))}">
    <span class="publication-year">${record.year}</span>
    <div><h2><a href="${escapeHtml(record.url)}">${escapeHtml(record.title)}</a></h2>
    <p>${escapeHtml(record.authors).replace(/(Madhusudhanan Srinivasan|Madhu Srinivasan|M\. Srinivasan)/g, "<strong>$1</strong>")}</p>
    <p class="venue">${escapeHtml(record.venue)} <span class="publication-status">${escapeHtml(record.status)}</span></p>
    ${record.video ? `<div class="publication-links"><a href="${escapeHtml(record.video)}">Watch video</a></div>` : ""}
    </div></li>`,
      )
      .join("\n")}
    </ol>`;
}

export function publicationPlugin(md) {
  md.core.ruler.after("inline", "publications", (state) => {
    const anchor = new state.Token("html_block", "", 0);
    anchor.content = '<span id="content" tabindex="-1"></span>\n';
    state.tokens.unshift(anchor);
    for (const token of state.tokens) {
      if (
        token.type === "html_block" &&
        token.content.trim() === "<!-- publications -->"
      ) {
        const records = JSON.parse(
          readFileSync(
            new URL("../src/data/publications.json", import.meta.url),
            "utf8",
          ),
        );
        token.content = publicationMarkup(records);
      }
    }
  });
  return md;
}
