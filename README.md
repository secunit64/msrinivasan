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

The site header uses the Editorial `ms.` monogram, "The researcher's mark":
regular Georgia serif with a blue period. The matching SVG favicon is
`src/assets/mark.svg`.
Both custom signature vectors remain saved in `src/assets/monograms/` as
`sm-navigation.svg` and `sm-faithful.svg` for future use.
The raw `sign.png` reference stays local and is ignored by Git.

The unlisted `/monograms.html` gallery preserves both custom marks and the earlier
typeface studies, with large and navigation-size previews and downloadable SVGs.
It is marked `noindex` and excluded from the sitemap. Open-source script fonts
are self-hosted with their SIL licenses; commercial fonts are not bundled and
only render if genuinely installed on the viewer's machine.

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

## Agents

Coding agents (Claude Code, Cursor, Warp) read `AGENTS.md` for the shared
rules and the four skills under `.claude/skills/`: `site-design`,
`site-content`, `site-build` and `site-deploy`. `CLAUDE.md` only imports
`AGENTS.md`. Keep those files current when a convention, command or
deployment setting changes; they are the project memory for anyone working
with an agent.

## Deployment

The intended custom domain is `https://msrinivasan.com/`. GitHub Pages must use
**GitHub Actions** as its publishing source, not legacy branch publishing.
The workflow validates pull requests and site-branch pushes, but only `master`
can deploy.

The build reads the actual origin and base path from `actions/configure-pages`.
Until the custom domain is successfully assigned in GitHub Pages, production
builds keep using `https://secunit64.github.io/msrinivasan/`. Once assigned, the
next deployment automatically uses the custom-domain root for canonical URLs,
social URLs, the sitemap, and the 404 page.

Local builds default to `SITE_URL=https://msrinivasan.com/` and `SITE_BASE=/`.
Set both variables to test a different origin and path. The root `CNAME` is kept
as domain documentation; Actions publishing does not require or use a CNAME file
in the deployment artifact.

If GitHub reports that the domain is already taken, release it from the previous
Pages repository or verify domain ownership under the `secunit64` account using
the GitHub-provided DNS TXT record. Do not guess a verification value. The apex
DNS already points to GitHub Pages; the recommended `www` CNAME target is
`secunit64.github.io`. DNS-provider changes are separate from repository settings.

After assigning the custom domain, provision/verify its HTTPS certificate, enable
HTTPS enforcement, and rerun the `master` workflow. Confirm the apex, `www`
redirect, assets, downloads, and canonical URLs before claiming the site is live.
