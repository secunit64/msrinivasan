---
name: site-content
description: Rules for the words and data on msrinivasan.com - page text, the timeline and education, src/data/publications.json (schema, status and topic vocabulary, authorship), the résumé PDF refresh from ../aboutme, link conventions, how Madhu is named, and the public/private boundary. Use before editing any src/*.md page, adding or changing a publication, updating job titles or dates, replacing doc/resume.pdf, syncing the site with the CV in ../aboutme, or whenever a request involves personal, employer or unpublished information, even if it looks like a one-word fix.
---

# Site content

The site is the public face of Madhu Srinivasan's research career. Every
sentence is read by recruiters, collaborators and reviewers, so accuracy and
restraint matter more than completeness. The private, canonical record of
the career is the separate `../aboutme` repository (YAML in `content/`,
built PDFs in `build/`). This site copies from it on request and never
depends on it.

## Who the subject is

- Prose and headings say **Madhu Srinivasan**. Formal documents and the
  résumé page say **Dr. Madhu Srinivasan**; never "Dr. Madhusudhanan
  Srinivasan".
- Publications keep the author string exactly as the paper printed it
  (`Madhusudhanan Srinivasan`, `Madhu Srinivasan` or `M. Srinivasan`). The
  renderer bolds whichever form appears; do not "normalise" author lists.
- First person on narrative pages ("I am Principal Research Staff at AMD
  Research"), third person in the footer and metadata.

## Pages and what each owns

| File                                   | Owns                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/index.md`                         | hero sentence, the one-line caption under the hero figure, career strip, project cards, note |
| `src/about.md`                         | the narrative bio, `.timeline` of roles, education, contact links, résumé link               |
| `src/projects.md`, `src/projects/*.md` | case studies (RedSeaAtlas, large-scale visualization)                                        |
| `src/publications.md`                  | lede and Scholar link; the list itself comes from JSON                                       |
| `src/resume.md`, `src/resume-long.md`  | résumé download page and the legacy `resume-long.html` pointer                               |
| `src/404.md`                           | not-found page                                                                               |
| `scripts/layout.mjs`                   | site title, description, nav labels, footer tagline and links                                |

The same facts appear in several places. When a role, title, date or the
résumé date changes, grep for the old value across `src/` and
`scripts/layout.mjs` and change every occurrence in one commit: the hero,
the career strip, the About timeline, `resume.md` (eyebrow and link text),
`about.md` (link text) and any project page `.project-meta`.

Current facts the pages state (verify against `../aboutme` before changing):
AMD Research, Principal Research Staff, Graphics and World Models, 2022 to
present; HPE Cray, Lead Scientist, Visualization and Machine Learning,
2019 to 2022; KAUST Visualization Core Lab, Lead Scientist 2014 to 2019 and
Visualization Scientist 2009 to 2014; Laika Studios, Technical Director,
2008; PhD 2009 and MS 2005 in Computer Science from Oregon State
University; B.Engg. Computer Science, Maharaja Sayajirao University, 2001.

## Links

- Internal links are relative and keep `.html`: `./about.html`,
  `./doc/resume.pdf`, and `../publications.html` from `src/projects/`.
  `check` resolves every local href and `#anchor` against `dist/`.
- External profile links, used in the footer and About page:
  Google Scholar `https://scholar.google.com/citations?user=GxzYUjQAAAAJ`,
  GitHub `https://github.com/secunit64` and `https://github.com/madhuatx`
  (both are required in every footer; `check` asserts it), LinkedIn
  `https://www.linkedin.com/in/madsrini/`, email
  `madhu.srinivasan@outlook.com`. The old `github.com/neuralvis` link is
  banned by `check`.
- External URLs in content must be `https:`.

## Publications

`src/data/publications.json` is an array of records rendered to static HTML
at build time by `scripts/publications.mjs` (sorted by `year` descending,
topic filter options derived from the data). Schema, enforced by
`validatePublications` at build, in `check` and in unit tests:

```json
{
  "id": "pub-short-slug", // ^pub-[a-z0-9-]+$, unique, stable: it is the anchor
  "year": 2027, // integer >= 1900; the year of the venue
  "title": "Exact title",
  "authors": "As printed, comma separated, 'et al.' allowed",
  "venue": "Full venue name (ACRONYM YEAR), pages if known",
  "status": "Accepted",
  "topics": ["AI", "Multimodal"], // non-empty strings
  "url": "https://...", // required, https
  "video": "https://..." // optional, https
}
```

Status vocabulary in use: `Accepted`, `Conference paper`, `Journal article`,
`Report contribution`, `Manuscript`. Add `Under review` only if Madhu asks
to list a paper that is not yet accepted, and say so plainly. Topic
vocabulary in use: `AI`, `Multimodal`, `Diffusion`, `HPC`, `Visualization`,
`Earth science`, `Marine ecology`, `VR`, `Graphics`, `Animation`. Reuse an
existing topic before adding one; each new topic becomes a filter option.

Rules that have already been decided:

- Pareto LoRA (WACV 2027) is listed as **Accepted** and links to arXiv.
- Vera (under review at ICLR) is **not** listed. Ask before adding
  anything that is submitted but not accepted.
- LoRaQ is team work Madhu did not author. It is never listed.
- Only papers Madhu authored go in; talks, posters and internal reports do
  not, unless asked.

When the count or the composition changes, update
`tests/browser/site.spec.js` on purpose: the first-item id
(`pub-pareto-lora`), the `AI` (1), `HPC` (3) and `Marine ecology` (1) filter
counts and the singular/plural status text. The total is read from the JSON
so it does not need editing.

## The public/private boundary

The site is public and indexed. Do not import from `../aboutme` or add:

- phone numbers, postal addresses, date of birth, visa or citizenship
  details, salary or compensation;
- internal AMD, HPE or KAUST tool, codename, project or customer names;
- unpublished metrics, speedups, model sizes or benchmark numbers;
- patents or invention disclosures;
- anything marked private or internal in `aboutme` YAML.

The résumé PDF deliberately contains more (email, a short list of employer
projects). That is Madhu's call, made per document. Do not paraphrase PDF
detail into the pages.

Never invent a fact. If a venue, year, collaborator or date is unknown,
write `TODO(madhu): <question>` in the Markdown and stop; the build check
fails on any `TODO(` in output, so it cannot ship by accident. Ask Madhu
rather than guessing. Illustrations are original and captions say so; no
figure, screenshot or result image comes from `aboutme`.

## Refreshing the résumé

`doc/resume.pdf` is the only document served. The procedure, done only when
Madhu asks for a newer résumé:

1. Confirm the source: `../aboutme/build/resume/resume.pdf`. If it is older
   than the YAML in `../aboutme/content`, tell Madhu and ask whether to
   rebuild it there first (that repository has its own build instructions);
   do not run the build on his behalf unprompted.
2. Open the PDF (or `pdftotext`) and confirm the name reads
   "Dr. Madhu Srinivasan", the date, and that nothing in it crosses the
   boundary above beyond what Madhu has already accepted.
3. Copy it byte for byte: `cp ../aboutme/build/resume/resume.pdf doc/resume.pdf`
   then compare `shasum -a 256` of both files.
4. Update the date in `src/resume.md` (eyebrow and link text) and the link
   text in `src/about.md`. The route is fixed at `/doc/resume.pdf` by
   `src/doc/resume.pdf.js` and `dynamicPaths` in `observablehq.config.ts`;
   do not rename it, external links point at it.
5. `npm run build && npm run check` verifies the PDF header and the link.

Removed documents (`biography.html`, `doc/biography.pdf`,
`doc/resume-2023.pdf`) must stay removed; `check` and a browser test assert
they 404. Do not bring back a biography page without asking.

## Syncing with `../aboutme`

When asked to bring the site up to date with the CV:

1. `git -C ../aboutme log --oneline --since=<date of last sync>` to see what
   changed, then read `content/*.yaml` (profile, summary, experience,
   publications, education, honors, service) and `views/resume.yaml`.
2. Diff against the pages and JSON listed above. List every difference and
   classify it: safe to copy (title wording, dates, a newly accepted paper),
   needs a decision (anything under review, honours, awards, service,
   mentoring, new sections the site does not have), or out of bounds.
3. Ask about the second group before editing. Apply the first group,
   update tests, run the checks, and summarise what changed and what was
   deliberately left out.

## Writing style

Short declarative sentences, no marketing adjectives, no exclamation marks,
British or American spelling consistent within a page (the site uses
"visualization" with a z throughout, matching the papers). Avoid em dashes;
use a comma, a colon or a full stop. Years as `2019 to 2022` in sentences
and `2019–2022` in the mono timeline column.
