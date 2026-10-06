# PNG living review: how to edit

The page at `/review/png/` is a static page, served by Jekyll as-is with no theme layout. Everything you edit is data or Markdown; you should not need to touch the JavaScript.

## Preview locally

From the repo root run `bundle exec jekyll serve` and open <http://127.0.0.1:4000/review/png/>. Alternatively run `python3 -m http.server` from `_site/` or from the repo root. Opening `index.html` straight from disk does not work, because the browser blocks `fetch` on `file://`.

## Files

| File | What it holds |
|---|---|
| `data/meta.json` | Version number, last-revised date, BibTeX key, GitHub links. Bump `version` and `revised` when you publish a revision. |
| `data/matrix.json` | Atlas rows, columns and every cell: `title`, `status` (`open`, `outline`, `draft`, `written`), `updated`, `refs`, `outline`, `open` (open problems), `body` (true if a Markdown file exists). |
| `content/cells/<row>-<col>.md` | Text of one cell, e.g. `theory-source.md`. Only read when the cell has `"body": true`. |
| `content/intro.md` | Introduction. |
| `data/timeline.json` | Change log. `kind` is `revision`, `literature` or `site`; `cells` lists the atlas cells the entry touches; `papers` lists reference ids. Remove every entry with `"sample": true` before launch. |
| `data/references.json` | Bibliography keyed by id. Set `verified: true` once the arXiv id, title and year have been checked. A `review` field puts the paper on the review timeline in the introduction. |
| `data/constraints.json` | Points for the f_NL chart. Set `"demo": false` once the values are verified. |

Shared code lives in `../assets/` (`review.css`, `review.js`, `shapes.js`), so a parity/chirality review can later sit at `/review/parity/` with its own `data/` and `content/`.

## Markdown conventions

- Inline math `$…$` and display math `$$…$$` are rendered by KaTeX.
- Cite with `[@id]` or `[@id1; @id2]`, using ids from `references.json`. Cited papers are added to the cell's reference list automatically.
- Embed a figure with `<div data-widget="fnl-constraints"></div>` or `<div data-widget="review-strip"></div>`.
- Do not add YAML front matter to these `.md` files. Jekyll would convert them to HTML and the page could no longer fetch them.

## Deep links

`/review/png/#/theory/lss` opens that cell directly.
