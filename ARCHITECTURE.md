# Architecture

How Invest 101 is put together, and what each piece does.

## The one-paragraph version

A **multi-page vanilla HTML/CSS/JS site**: every topic is a real `.html` file, styling is one
CSS file of design tokens and components, and the only JavaScript is (a) a shared
header/footer injector, (b) three calculator modules of pure math with thin page bindings,
and (c) a small hand-rolled SVG chart helper. No framework, no build step, no external
dependencies, no backend, no data collection.

## Pages (multi-page, not single-page)

Each topic is its own file under `pages/`, each calculator under `calculators/`. Clicking a
topic box on the home page navigates to a real page — the browser's back button, reload and
link-sharing all just work. This mirrors how the content is organised (one lesson at a time)
and keeps every page understandable in isolation.

## The design system (`css/styles.css`)

One stylesheet, organised top-down:

1. **Tokens** (`:root`) — ink colour, pastel card palette, the hard-offset shadow, radius.
   Change `--accent` once and every button/highlight follows.
2. **Typography** — system font stack; headings are heavy-weight uppercase (the
   neo-brutalist look from the design references).
3. **Components** — header, ticker, buttons, topic cards, content cards, callouts, data
   tables, steps, calculator layout, footer. Pages compose these classes; pages contain no
   styling of their own.

Responsive by default: card grids use `auto-fill/minmax`, the calculator layout collapses to
one column under 860px, and the nav becomes a MENU toggle under 760px.

## Shared header/footer (`js/components.js`)

Every page has the same header and footer. They are defined **once** in `components.js` and
injected on page load; each page passes its path depth via `data-root` so links resolve from
any folder. Editing the nav means editing one file. (Why injection instead of copy-paste or
fetch — see DECISIONS.md.)

## Calculators: pure math + thin binding

Each calculator is split in two:

- **`js/calculators/*.js`** — pure functions: numbers in, numbers out. No DOM, no page
  knowledge. `compoundCalc()`, `sipCalc()`, `returnsCalc()`.
- **A small `<script type="module">` in the page** — reads inputs, calls the function,
  writes results, draws the chart. Recomputes instantly on every keystroke (`input` event).

Because the math has no page code in it, it can be unit-tested directly with Node
(`tests/calculators.test.mjs`) and explained in isolation: the SIP formula is six lines.

Formulas:

| Calculator | Formula |
|---|---|
| Compound | A = P(1 + r/n)^(n·t), with simple-interest path P(1 + r·t) for comparison |
| SIP | FV = M · [((1+i)^nm − 1)/i] · (1+i), i = annual/12, nm = months |
| Returns | absolute = sell − buy; % = abs/buy·100; CAGR = (sell/buy)^(1/years) − 1 |

## Charts (`js/charts.js`)

A single `drawLineChart()` function builds an SVG string: axis ticks, grid lines, an area
fill for the first series, a line per series. ~140 lines, no library. Rupee axis labels
abbreviate Indian-style (k / L / Cr).

It also draws an **optional cursor-hover layer** (`interactive`, on by default; `compareDiff`
adds a gap readout when there are exactly two series). On mouse-move or touch over the plot, it
maps the pointer to the nearest year, drops a guide line and a dot on each curve, and shows a
tooltip with each series' value — and, for the compound calculator, the gap between compound and
simple interest. All in viewBox/SVG coordinates plus one positioned HTML tooltip, no library.

## Data-driven glossary

`pages/glossary.html` fetches `data/glossary.json` and renders the list, with live filtering.
Adding a term = adding one JSON entry. (This is the same pattern a CMS would do server-side,
in 30 lines of client code.)

## Data-driven quizzes (`pages/quiz.html` + `js/quiz.js` + `data/quizzes.json`)

Same idea as the glossary, one step up. `data/quizzes.json` holds the three quizzes (the
questions, with a 0-based correct-answer index per question). `pages/quiz.html` fetches it,
shows a chooser of three cards, and on pick hands the chosen quiz to `mountQuiz()` in
`js/quiz.js`. The engine renders accessible radio-group questions, locks them on submit, marks
every question (correct in green, your wrong pick in pink), and scores **out of 100**
(`correct / total × 100`). Editing or adding a quiz = editing one JSON file; the engine never
changes. Linked from the end of the calculator section, the nav, and the footer.

## Video embeds (`pages/how-to-start.html`)

The 18+ "learn basics" block shows YouTube videos as thumbnail cards (`.video-grid`): one
`<img>` from YouTube's thumbnail CDN plus a link that opens the video on YouTube **in a new
tab**. No iframe player, no third-party scripts — consistent with the no-tracking, educational
-only stance. (Why new-tab over inline — see DECISIONS.md #12.)

## Hosting

GitHub Pages serving the repo root from `main`. The site is pure static files, so hosting is
free, has no servers to maintain, and nothing to leak — there are no secrets, no accounts and
no stored user data anywhere in the project.
