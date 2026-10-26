# AGENTS.md

This repository is Madhu Srinivasan's professional profile site,
https://msrinivasan.com/. It is an Observable Framework site: Markdown pages
in `src/` are the source, `dist/` is generated, and GitHub Actions publishes
`master` to GitHub Pages under the custom domain.

The detailed guidance lives in four skills under `.claude/skills/`, a
directory that Claude Code, Cursor and Warp all discover:

| Skill          | Read it when                                                          |
| -------------- | --------------------------------------------------------------------- |
| `site-design`  | changing appearance, layout, typography, the monogram, or a component |
| `site-content` | editing page text, publications, the résumé PDF, links, or privacy    |
| `site-build`   | building, previewing, testing, or debugging a failing check           |
| `site-deploy`  | anything about GitHub Pages, the domain, DNS, HTTPS, or a release     |

## Layout

```
src/                 Observable source. One Markdown file per page.
  index.md           home; projects.md + projects/*.md; publications.md;
                     about.md; resume.md; resume-long.md; 404.md;
                     monograms.md (unlisted design gallery, index: false)
  data/publications.json   the bibliography; rendered at build time
  components/        reactive JS imported by pages (progressive enhancement)
  styles/site.css    the whole visual system; monograms.css extends it
  assets/            original SVG artwork, favicon (mark.svg), monograms/,
                     self-hosted script fonts with their OFL.txt licenses
  doc/resume.pdf.js  loader that exposes doc/resume.pdf at /doc/resume.pdf
doc/resume.pdf       the only résumé served; copied by hand from ../aboutme
scripts/             layout.mjs (head/header/footer), publications.mjs
                     (validation + Markdown plugin), clean/finalize/check/serve
tests/               node:test unit tests and Playwright browser tests
observablehq.config.ts, .github/workflows/site.yml
index.html, resume-long.html, css/, js/, favicon.ico, CNAME
                     legacy pre-2026 files; not part of the build
dist/                generated, cleared on every build, gitignored
```

## Commands

Node 24 (`.node-version`). Install once with `npm ci --ignore-scripts`.

```
npm run dev            # Observable preview with live reload
npm run build          # clean + observable build + finalize (canonical URLs, sitemap)
npm run check          # validate dist/: pages, links, metadata, PDF, bibliography
npm run lint           # prettier --check .    (npm run format to fix)
npm test               # unit tests
npm run test:browser   # Playwright: Chromium desktop + mobile, WebKit, axe
npm run serve          # dist/ at http://localhost:4173/msrinivasan/ and at /
```

`SITE_URL` (https, trailing slash) and `SITE_BASE` select the deployment
address; local defaults are `https://msrinivasan.com/` and `/`.

## Rules

1. **Edit `src/`, `scripts/` and `tests/`. Never edit `dist/`.** It is
   regenerated and gitignored. Deleting a page means deleting its file; an
   empty `.md` still builds into a page and fails `check`.
2. **Everything on the site is public.** No phone number, no internal tool
   or project names, no unpublished metrics, no patents, no employer-internal
   detail. Never invent a fact, date, venue or collaborator; if something is
   missing, write `TODO(madhu): <question>` in the source and stop (`check`
   fails on any `TODO(` left in `dist/`). Publications carry accurate
   authorship and status; LoRaQ is team work Madhu did not author and is not
   listed.
3. **Pages must read without JavaScript.** Prose and the bibliography are
   static HTML; reactive code only adds behaviour (the topic filter).
4. **Finish with the checks green:** `npm run lint && npm test && npm run
build && npm run check && npm run test:browser`. When content changes the
   publication counts, update the expectations in
   `tests/browser/site.spec.js` deliberately rather than loosening them.
5. **Dependencies are pinned.** Do not float versions or downgrade
   `@observablehq/framework` to satisfy `npm audit`; the remaining advisories
   are in Framework's own transitive dependencies.
6. **`../aboutme` is a source to copy from by request, never a build input.**
   The site must build from this repository alone.
7. **Only `master` deploys.** Pushing to `master` publishes the site. Do not
   commit or push unless asked, and do not change Pages, domain, DNS,
   repository visibility or billing settings without an explicit request.
8. **Keep raw personal material out of Git.** `sign.png` (the signature
   scan) is gitignored; the derived SVGs in `src/assets/monograms/` are the
   committed artefacts.
