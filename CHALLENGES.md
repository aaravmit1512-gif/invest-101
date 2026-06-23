# Challenges & resolutions

The real problems this project ran into, and how each got solved. (The *why* behind each design
choice is in `DECISIONS.md`; this is the what-broke-and-how-I-fixed-it companion.)

## 1. Identical header/footer on every page, without a framework

**Hard because:** the site is 14 separate HTML files that all need the same nav and footer.
Copy-pasting means 14 edits and 13 chances to miss one. The obvious fix — `fetch()` a shared
partial — silently breaks the moment you open a page directly from disk (`file://`), which is
exactly how you first open a project (browsers block `fetch` on `file://`).

**Solved by:** a ~70-line component injector (`js/components.js`) that builds the header and footer
from template strings and inserts them on load. One file to edit; works from disk and from any
static host. (Trade-off — DECISIONS.md #3.)

## 2. Getting the SIP formula right — and proving it

**Hard because:** the SIP future-value formula is an *annuity-due* (each month's contribution
earns one extra period of growth), and it's easy to write a version that's off by a multiplier
without noticing — the number still "looks plausible."

**Solved by:** splitting the math into pure functions (`js/calculators/`) with **no page code**,
then unit-testing them against hand-computed anchors before wiring any UI — e.g. ₹2,000/month at
12% for 10 years must come out to ₹4,64,678. Tests have to pass first
(`node tests/calculators.test.mjs`). The split also means each formula can be explained on its
own, separate from the interface.

## 3. Charts with zero dependencies

**Hard because:** a charting library is ~200 KB of someone else's code to draw two lines — and I
wanted to be able to explain every line on the page.

**Solved by:** a ~140-line hand-rolled SVG helper (`js/charts.js`) that draws exactly what's
needed and nothing more. A later step raised the bar: an *interactive* simple-vs-compound
comparison (the "IPL-style" hover). The hard part was mapping the cursor's pixel position back to
the nearest data-year on a chart that scales responsively, and reading both curves at that point.
I solved it by converting the pointer position into the SVG's own coordinate space (via the
rendered bounding box), snapping to the nearest year, and drawing a guide line, a dot on each
curve, and a tooltip with both values and the gap. Testing it then caught a subtle bug — a fresh
tooltip element was being created on every keystroke and never removed — fixed by clearing the
previous one on each redraw.

## 4. Content that changes shouldn't mean touching code

**Hard because:** the glossary and the quizzes are the parts most likely to grow, and editing
markup by hand to add a term or a question is exactly where mistakes creep in.

**Solved by:** making both data-driven. The glossary reads `data/glossary.json`; the quizzes read
`data/quizzes.json`. Adding a term or a question is editing one line of data — the rendering code
never changes. (One consequence: data-driven pages need to be *served* over http, not opened from
disk, because they fetch their JSON.)

## 5. Turning a prototype look into a maintainable design system

**Hard because:** my prototype set a specific bold-pastel, heavy-border ("neo-brutalist") look,
and reproducing it ad-hoc on every page would have made later changes a nightmare.

**Solved by:** encoding the look as CSS custom-property tokens (the ink colour, the pastel card
palette, the hard offset shadow, the border weight) plus a small set of component classes. Change
`--accent` once and every button and highlight follows. Pages compose classes; they carry no
styling of their own.

## 6. Fixing typos without rewriting my own content

**Hard because:** the site renders my written content word-for-word — keeping it in my voice is
the whole point — but the source had a few typos and the odd factual slip.

**Solved by:** rendering everything verbatim first, then doing the corrections in one pass at the
end — keeping the originals noted so any change could be undone, and leaving anything that was a
judgement call (a quiz answer key, an unfinished sentence) for me to decide rather than guessing.

## 7. Making all of it work on a phone

**Hard because:** the calculators are a two-column form-plus-chart layout, the quiz is a long
form, the nav is a horizontal bar, and the comparison tooltip all have to behave at 375 px wide.

**Solved by:** a mobile-first CSS grid that collapses the calculator layout to one column under
860 px, a MENU toggle that replaces the nav bar under 760 px, and touch handlers on the chart so
the hover comparison works by tapping. Verified at desktop and 375 px.
