---
name: site-build
description: How msrinivasan.com is built, previewed and verified - the npm scripts, the clean/observable build/finalize pipeline, what scripts/check.mjs asserts, the unit and Playwright suites, SITE_URL and SITE_BASE, and a catalogue of build and test failures that have actually happened with their fixes. Use when running or debugging npm run build, check, test, test:browser or lint, when a CI job fails, when adding a page, asset, test or script, or when Observable Framework behaves unexpectedly.
---

# Site build and verification

The build is deliberately small: Observable Framework 1.13.4 renders
Markdown to static HTML, two scripts of our own wrap it, and three test
layers guard the output. Run everything locally before pushing; CI runs the
identical commands.

## Toolchain

Node 24 only (`.node-version`, `engines` in `package.json`). Install with
`npm ci --ignore-scripts` (the flag skips Playwright's postinstall; browsers
are installed separately with `npx playwright install chromium webkit`).
Dependencies are pinned exactly, with an `overrides` entry for `esbuild`.
Do not float versions or downgrade Framework to clear `npm audit`; the
remaining advisories are transitive to Framework.

## The pipeline

`npm run build` is three steps:

1. `scripts/clean.mjs` empties `dist/` so stale pages cannot survive a
   rename.
2. `observable build` renders `src/**/*.md` using
   `observablehq.config.ts`: no sidebar, pager, toc or search; an empty
   `globalStylesheets` list; `preserveExtension: true` (links keep
   `.html`); `base` from `SITE_BASE` (default `/`); `dynamicPaths` listing
   `/doc/resume.pdf` so the `src/doc/resume.pdf.js` data loader emits the
   PDF; `markdownIt` set to `publicationPlugin`, which expands
   `<!-- publications -->` and injects the `#content` skip target; and
   `head`, `header` and `footer` functions from `scripts/layout.mjs`.
3. `scripts/finalize.mjs` copies `doc/resume.pdf`, `src/assets/` and
   `LICENSE.html` into `dist/`, sets `<html lang="en">`, rewrites the
   viewport meta to allow zoom, appends `<link rel="canonical">` and
   `og:url` built from `SITE_URL`, and writes `dist/sitemap.xml` (every page
   except `404.html` and pages whose robots meta says `noindex`). It refuses
   a `SITE_URL` that is not `https:` or lacks a trailing slash.

`SITE_URL` defaults to `https://msrinivasan.com/` and `SITE_BASE` to `/`.
CI derives both from `actions/configure-pages`, so a project-pages
deployment would produce `https://secunit64.github.io/msrinivasan/` and
`/msrinivasan` automatically. To rehearse that locally:
`SITE_URL=https://secunit64.github.io/msrinivasan/ SITE_BASE=/msrinivasan npm run build`.

`npm run dev` starts Framework's preview with live reload; it does not run
`finalize`, so canonical tags and the sitemap are absent there, which is
expected. Changes to `publications.json` need a page reload.
`npm run serve` serves `dist/` at `http://localhost:4173/` and
`http://localhost:4173/msrinivasan/` at once so both mounts can be checked.

## What `npm run check` asserts

`scripts/check.mjs` runs against `dist/` after a build and fails loudly on:

- a missing required route (`index`, `projects`, `publications`, `about`,
  `resume`, `resume-long`, `404`, the two project pages) or a résumé that
  does not start with `%PDF-`;
- per page: `lang="en"`, exactly one `h1`, a `<title>`, a meta description,
  one canonical link whose href equals `SITE_URL + route` (with `index.html`
  stripped), a matching `og:url`, footer links to both GitHub accounts, no
  link to `github.com/neuralvis`, no legacy analytics or jQuery, no
  `TODO(` or `{{PLACEHOLDER}}` text;
- the 404 page's `<base href>` equal to `SITE_URL`'s pathname;
- every local `href`/`src` resolving to a file inside `dist/` (a
  `/msrinivasan/` prefix is tolerated because Framework hard-codes it in
  the 404 page) and every `#anchor` existing in its target page;
- the static bibliography count equalling the JSON count and
  `#publication-controls` carrying `hidden`;
- every `sitemap.xml` location starting with `SITE_URL`;
- `biography.html`, `doc/biography.pdf` and `doc/resume-2023.pdf` absent.

Add a new page to the `required` list and a new removed document to the
`removed` list when those change. Keep assertions exact; loosen nothing.

## Tests

`npm test` runs `node --test tests/*.test.mjs`: publication validation and
markup, the layout helpers, the signature SVGs, the self-hosted font files
and licenses, and the deployment configuration (workflow and config
invariants). They need no build.

`npm run test:browser` runs Playwright against `npm run serve` (started by
the config, reused if already running outside CI) in three projects:
desktop Chromium, mobile Chromium (iPhone 13 profile) and desktop WebKit.
`tests/browser/site.spec.js` covers every route at both mounts (status 200,
no console errors, no failed requests, no horizontal overflow, all images
loaded, wordmark text/colour/weight, favicon), topic filtering counts,
JavaScript-disabled rendering, keyboard navigation, axe WCAG 2.1 AA, the
résumé download, removed documents returning 404, and the 320px header.
`tests/browser/monograms.spec.js` covers the unlisted gallery. Build first:
the browser tests serve `dist/`.

The full gate, in order:
`npm run lint && npm test && npm run build && npm run check && npm run test:browser`.
`npm run format` fixes Prettier complaints; it formats Markdown, JSON, YAML
and JS, including the skill files.

## CI

`.github/workflows/site.yml` runs the same gate on pull requests, on pushes
to `master` and `site/observable-profile`, and on manual dispatch, with
`SITE_URL`/`SITE_BASE` read from `actions/configure-pages`. Only `master`
uploads and deploys the artifact (see the `site-deploy` skill). The
`playwright install --with-deps` step occasionally stalls on apt; cancel
the run and rerun it rather than changing the workflow.

## Error catalogue

Failures that have actually occurred, and what fixed them.

**`markdownIt` plugin has no effect or the build throws inside Framework.**
Framework calls `markdownIt(md)` and uses the return value. The function
must `return md` after registering rules; returning nothing silently
disables every custom rule.

**A custom front-matter key does nothing.** Framework drops unknown
front-matter keys before `head()` sees them. Use the supported
`index: false` to mark a page unlisted; `layout.mjs` turns that into the
robots meta, and `finalize.mjs` keeps such pages out of the sitemap.

**`check` says the filter controls are not hidden although the HTML has
`hidden`.** cheerio's `.attr("hidden")` returns `""` for a boolean
attribute, which is falsy. Test with `.is("[hidden]")`.

**axe reports `link-in-text-block`.** A link inside a paragraph that is
distinguished from surrounding text only by colour fails when the colour
contrast between link and text is under 3:1. Underline prose links; do not
restyle the colours to pass.

**Header renders narrower than the page or shifts right.** Framework's
default styles give `header` margins. The header needs `margin: 0` and
`width: 100%` in `site.css`, with the inner nav container doing the
centring.

**Keyboard test fails only in WebKit on macOS.** Safari's Tab skips links
by default. The test presses `Alt+Tab` when `browserName === "webkit"` and
`process.platform === "darwin"`; keep that branch when editing the test.

**`check` fails with "expected one h1" or "missing title" on a page you
did not touch.** An empty or stub `.md` still becomes a page. Delete the
file rather than emptying it; `clean.mjs` removes the stale output.

**Build warning "broken links → /doc/resume.pdf" and warnings about
`OFL.txt` links.** Benign. Framework cannot see dynamic paths and plain
text files when it resolves links; `finalize` and `check` confirm both
exist in `dist/`.

**`finalize` throws "SITE_URL must be an HTTPS URL ending with /".** The
variable was set without the trailing slash or with `http:`. CI builds it
as `https://${host}${base_path}/`; mirror that locally.

**Canonical or sitemap checks fail after changing the deployment address.**
`SITE_URL` and `SITE_BASE` must agree: `SITE_BASE` is the pathname of
`SITE_URL` without the trailing slash (or `/` for the root). Rebuild after
changing either; `check` reads `SITE_URL` at run time and compares against
what `finalize` wrote.

**Playwright cannot start the web server / port 4173 in use.** A previous
`npm run serve` is still running. Outside CI the config reuses it, so that
is fine; if the old server is serving a stale `dist/`, stop it and rerun.

**Prettier fails on a file you did not edit.** Run `npm run format` and
commit the result; Prettier formats the whole repository, including
Markdown tables in these skills.
