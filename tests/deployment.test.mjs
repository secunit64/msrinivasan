import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("deployment builds HTTPS URLs while Pages reports an HTTP origin", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/site.yml", import.meta.url),
    "utf8",
  );
  const template = workflow.match(/^\s+SITE_URL:\s+(.+)$/m)?.[1];
  assert(template, "Deployment must define SITE_URL");
  for (const metadata of [
    {
      host: "msrinivasan.com",
      origin: "http://msrinivasan.com",
      base_path: "",
    },
    {
      host: "secunit64.github.io",
      origin: "http://secunit64.github.io",
      base_path: "/msrinivasan",
    },
  ]) {
    const expanded = template.replace(
      /\$\{\{\s*steps\.pages\.outputs\.(host|origin|base_path)\s*\}\}/g,
      (_, key) => metadata[key],
    );
    assert.equal(expanded, `https://${metadata.host}${metadata.base_path}/`);
  }
});
