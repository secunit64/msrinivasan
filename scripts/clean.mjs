import { rm } from "node:fs/promises";

// Only generated production output is removed; sources and documents are untouched.
await rm(new URL("../dist/", import.meta.url), {
  recursive: true,
  force: true,
});
