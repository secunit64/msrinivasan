# Madhu Srinivasan

Professional profile and research projects, built with Observable Framework.

## Develop

Use Node.js 24 LTS (also specified in `.node-version`).

```sh
npm ci --ignore-scripts
npm run dev
```

Edit Markdown in `src/`. The preview server reloads page edits. Shared navigation
and metadata live in `scripts/layout.mjs`; appearance lives in `src/styles/site.css`.

Publications are maintained in `src/data/publications.json`. A small Markdown
plugin expands the `<!-- publications -->` marker in `src/publications.md` at
build time, producing a complete HTML bibliography. Reactive JavaScript adds
topic filtering; the bibliography remains usable without JavaScript. Reload the
publication page after changing its JSON.

Project demonstrations can import modules from `src/components/` in reactive
JavaScript blocks. Keep heavyweight graphics dependencies scoped to the pages
that need them. GitHub Pages cannot host an inference server; use browser-side
computation, precomputed data, or an external service.

## Verify

```sh
npm run lint
npm test
npm run build
npm run check
npx playwright install chromium webkit
npm run test:browser
npm run serve
```

The production preview runs at `http://localhost:4173/msrinivasan/`, with the
same output also mounted at `/` for root-hosting checks. Browser tests cover
both mounts, mobile and desktop Chromium, desktop WebKit, keyboard navigation,
JavaScript-disabled pages, topic filtering, and automated accessibility checks.

`dist/` is generated, cleared before every build, and must not be edited or committed. The finalizer preserves
the current `doc/resume.pdf` download path, adds canonical
URLs and a sitemap, and copies the original diagrams and license notice.

## Content and privacy

The starting profile was curated from the canonical YAML in the separate
`aboutme` repository. This site has no dependency on that repository. Publication
IDs preserve the original IDs for cross-reference; narrative pages are edited
here. No automatic private-to-public synchronization takes place.

The publication list includes Pareto LoRA as **accepted at WACV 2027**, matching
the current résumé; it links to the arXiv record. Other recent AMD papers remain
excluded until requested. Internal tool names, performance measurements, patents,
and unpublished employer information were not imported into narrative pages.
LoRaQ is not an authored publication and is not listed. New entries must preserve
accurate authorship and distinguish manuscripts, accepted papers, and published work.

All SVG diagrams in `src/assets/` were created for this site. They are illustrative,
not research results or project screenshots. No images were copied from the
private source repository.

The main `doc/resume.pdf` is the user-requested October 22, 2026 résumé, copied
unchanged from `../aboutme/build/resume/resume.pdf`. Only the current résumé is
kept on the website; older document sources remain in `../aboutme`.
The PDF contains contact information and includes
employer details omitted from the narrative pages. Review them before deployment.
Refreshing the PDF is an explicit copy, not an automatic private-repository sync.

## Deployment

The verified Pages address is `https://secunit64.github.io/msrinivasan/`.
GitHub Actions checks pull requests and builds/deploys pushes to `master` or
`site/observable-profile`. The site branch is enabled for the initial release
without merging it into `master`.
Before releasing, approve the rendered content and current résumé, then
switch **Settings → Pages → Source** to **GitHub Actions**. Pushing the workflow
to either deployment branch or manually running it there can deploy: do not do so before approval.
No repository visibility change is needed for this migration.

The root `CNAME` records the previous domain `msrinivasan.com`. It is deliberately
excluded from `dist/` because GitHub currently has no custom domain configured.
Do not activate it or change DNS as part of an ordinary content update.

If a custom domain is approved later, configure it in GitHub Pages and update
both `SITE_BASE` (for example `/`) and `SITE_URL` (an HTTPS URL ending in `/`) in
the build environment. These default to `/msrinivasan/` and the address above.
Verify navigation, canonical URLs, and the sitemap before deploying.

The remaining root legacy HTML, CSS, and JavaScript remain as the previous deployment's
source until cutover; the new production build includes only the Framework
site and the explicitly preserved documents. No obsolete analytics or jQuery
is included in the new site.
