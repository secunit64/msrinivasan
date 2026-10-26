---
name: site-deploy
description: How msrinivasan.com is published - GitHub Pages with the Actions publishing source, master-only deployments from .github/workflows/site.yml, the msrinivasan.com custom domain, DNS records, domain verification, certificate states, HTTPS enforcement, and the gh api commands to inspect or change them. Use for any release, "is the site live" question, Pages or DNS or HTTPS problem, a 404 or wrong-canonical report after deploy, or before touching repository visibility, Pages settings or the domain.
---

# Site deployment

The site publishes from GitHub Actions, not from a branch. Every push to
`master` runs the checks and, if they pass, deploys `dist/` to GitHub
Pages, which serves it at `https://msrinivasan.com/`. Nothing else deploys.
Settings outside the repository (Pages, domain, DNS, visibility) are
changed only when Madhu asks, and each change is reported back with the
command that made it.

## Current configuration (verified 2026-10-26)

- Repository `secunit64/msrinivasan`, public (Pages on a free account
  requires it), default branch `master`.
- Pages `build_type: workflow` (Actions). The `source.branch` field the API
  still reports is ignored under workflow publishing.
- Custom domain `msrinivasan.com`, `protected_domain_state: verified`
  under the `secunit64` account via the
  `_github-pages-challenge-secunit64` TXT record.
- DNS at the registrar: apex `A` records `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `www` `CNAME`
  `secunit64.github.io`. No `AAAA` records were added.
- Certificate `state: dns_changed` ("Requesting a new certificate"),
  `https_enforced: false`. HTTPS already answers at the apex; enforcement
  (HTTP to HTTPS redirect) is switched on once the certificate state
  reaches `approved`/`issued`. `www` still presents a hostname mismatch
  until that certificate covers it.
- The root `CNAME` file is documentation only. Actions publishing takes
  the domain from Pages settings, and the file is not part of `dist/`.

## How a release happens

1. Work lands on `master` (direct push or merged PR). The workflow
   `site.yml` triggers on `push` to `master` and
   `site/observable-profile`, on `pull_request`, and on
   `workflow_dispatch`; concurrency cancels an older run on the same ref.
2. Job `check`: `npm ci --ignore-scripts`, lint, unit tests, then
   `actions/configure-pages` reads the live Pages settings and the build
   runs with `SITE_URL=https://${host}${base_path}/` and
   `SITE_BASE=${base_path || '/'}`. With the custom domain assigned that
   is `https://msrinivasan.com/` and `/`; if the domain were ever removed
   it would fall back to `https://secunit64.github.io/msrinivasan/` and
   `/msrinivasan` with no code change. Then `npm run check`, Playwright
   browser install, browser tests, and (only on `master`, not for pull
   requests) `actions/upload-pages-artifact` of `dist/`.
3. Job `deploy` (only on `master` pushes, needs `check`): environment
   `github-pages`, `actions/deploy-pages`. The environment URL in the run
   summary is the published address.

A pull request therefore gets the full validation but never publishes.
Pushing a branch other than the two listed does nothing in CI.

## Commands

Inspect:

```sh
gh run list --workflow site.yml --branch master --limit 5
gh run watch <run-id>                 # follow a run; prints the failing step
gh run view <run-id> --log-failed     # logs of failed steps only
gh api repos/secunit64/msrinivasan/pages            # cname, build_type, https state
gh api repos/secunit64/msrinivasan/pages/builds/latest
dig +short msrinivasan.com A
dig +short www.msrinivasan.com CNAME
dig +short TXT _github-pages-challenge-secunit64.msrinivasan.com
curl -sI https://msrinivasan.com/ | head -n 5
curl -sI https://msrinivasan.com/doc/resume.pdf | grep -i content-type
```

Rerun or trigger a deployment without a new commit:

```sh
gh workflow run site.yml --ref master
gh run rerun <run-id>                 # or --failed to rerun only failed jobs
```

Change settings (explicit request only):

```sh
# Switch Pages to Actions publishing / set or change the domain
gh api --method PUT repos/secunit64/msrinivasan/pages -f build_type=workflow -f cname=msrinivasan.com
# Enforce HTTPS once the certificate is issued
gh api --method PUT repos/secunit64/msrinivasan/pages -F https_enforced=true
# Remove the custom domain (falls back to secunit64.github.io/msrinivasan)
gh api --method PUT repos/secunit64/msrinivasan/pages -f cname=
```

`PUT .../pages` with `https_enforced=true` returns 422 "certificate has not
finished being issued" while the state is `dns_changed`, `new` or
`authorization_created`; wait and retry, do not change DNS in response.

## Verification after a deploy

Do all of these before saying the site is live:

1. `gh run list` shows the latest `master` run `completed success` with
   both `check` and `deploy` jobs.
2. `curl -sI https://msrinivasan.com/` returns `200`, and
   `/about.html`, `/publications.html`, `/doc/resume.pdf`
   (`application/pdf`), `/assets/mark.svg` and `/sitemap.xml` do too.
3. `curl -s https://msrinivasan.com/ | grep canonical` shows
   `https://msrinivasan.com/`, not a `github.io` address.
4. A made-up path returns `404` with the site's own 404 page.
5. If HTTPS enforcement is on, `curl -sI http://msrinivasan.com/` returns
   `301` to `https://`. If it is off, check the certificate state and try
   the enforcement command.
6. `https://www.msrinivasan.com/` should redirect to the apex once the
   certificate covers it; report its state honestly if it does not yet.

Pages caches through a CDN; allow a minute after `deploy` finishes and
use `curl -sI -H 'Cache-Control: no-cache'` when a change seems missing.

## Domain and certificate states

`https_certificate.state` moves through `new`, `authorization_created`,
`authorization_pending`, `authorized`, `authorization_revoked`, `issued`,
`approved`, `dns_changed`, `errored`, `bad_authz`, `uploaded`,
`destroy_pending`, `destroyed`. Only `approved`/`issued` allow
`https_enforced=true`. `dns_changed` means GitHub noticed a DNS edit and is
requesting a fresh certificate; it clears on its own within hours.
`errored`/`bad_authz` mean the DNS does not point at Pages as GitHub
expects: recheck the four `A` records and the `www` `CNAME`, remove and
re-add the domain through the Pages API, and wait.

"Domain is already taken" when assigning the domain means another
repository or account holds it. The fix is domain verification for the
account (`gh api user/pages/domains` lists them; GitHub supplies the TXT
name and value, never guess them), or releasing the domain from the other
repository. That is how this domain was recovered.

## Rules

- Do not change Pages settings, DNS, repository visibility, billing or the
  domain without an explicit request from Madhu, and say exactly what was
  changed afterwards.
- Do not switch Pages back to branch publishing, and do not commit `dist/`
  to publish from a branch.
- Do not add a `CNAME` file to `dist/` or make `finalize.mjs` write one;
  Actions publishing does not use it and a stale one can detach the domain.
- Keep `SITE_URL` derived from `configure-pages` in CI. Hard-coding the
  domain in the workflow would break canonical URLs if the domain changes.
- If a deploy succeeds but the site looks wrong, fix forward with a new
  commit on `master`; there is no rollback button, and rerunning an old
  run redeploys that commit's artifact only while the artifact exists.
- Making the repository private again would take the site offline on the
  current plan.

## Troubleshooting

**Run fails at `Read Pages domain and base path`.** The `check` job needs
`pages: read` permission and Pages must be enabled with the Actions
publishing source (`build_type: workflow`). Both are set; if someone
changed the Pages source to a branch, restore it with the PUT above.

**Run fails at `Build and validate for the configured Pages address`.**
Reproduce locally with the same `SITE_URL`/`SITE_BASE` the step printed,
then follow the `site-build` skill.

**`playwright install --with-deps` hangs or times out.** Ubuntu apt mirror
stall. Cancel and rerun; nothing in the repository is wrong.

**Deploy succeeded but `https://msrinivasan.com/` 404s.** Pages lost the
domain. `gh api repos/secunit64/msrinivasan/pages` shows `cname: null`;
re-add it with the PUT command (explicit request), wait for
`protected_domain_state: verified`, rerun the workflow so canonical URLs
are rebuilt for the custom domain.

**Canonical URLs point at `secunit64.github.io/msrinivasan/`.** The build
ran while the domain was unassigned. Assign the domain, then
`gh workflow run site.yml --ref master`.

**Certificate stuck in `dns_changed` for more than a day.** Confirm the
`A` records and `www` `CNAME` are exactly as listed, that no `AAAA` or
conflicting `CNAME` exists at the apex, then remove and re-add the domain
to restart issuance.
