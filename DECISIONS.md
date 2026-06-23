# Decisions & trade-offs

Why Invest 101 is built the way it is. Each decision lists what was chosen, what was
rejected, and the honest trade-off — the reasoning behind each one.

## 1. Vanilla HTML/CSS/JS — no framework

**Chosen:** plain HTML pages, one CSS file, small JS modules.
**Rejected:** React + Vite (SPA), Astro (static site generator).

A framework earns its complexity when an app has lots of shared state and dynamic screens.
This site is nine lessons and three calculators — content, not state. Vanilla means: no build
step, no `node_modules`, free hosting anywhere, and every line on the site is a line a person
can read. The trade-off: shared layout needs its own solution (see #3) and there's no
component ecosystem to lean on.

*Considered honestly:* React would look more "impressive" but would be thousands of lines of
other people's code I couldn't explain. Astro was the closest call (real HTML output,
shared layouts) but adds a build step and a learning curve for no feature this site needs.

## 2. Multi-page, not single-page

Each topic is a real page with a real URL. Back button, refresh, and "send this link to a
friend" work with zero code. A single-page app would need a router — solving a problem this
site doesn't have.

## 3. Shared header/footer via JS injection — not fetch, not copy-paste

The header/footer must be identical on 14 pages. Three options:

- **Copy-paste into every file** — simple, but editing the nav means 14 edits and 13 chances
  to miss one.
- **`fetch()` partial HTML files** — DRY, but breaks when a page is opened directly from disk
  (browsers block fetch on `file://`), which is exactly how a beginner first opens a project.
- **Template strings in `components.js`** *(chosen)* — DRY, works from disk and from any
  static host, one file to edit.

Trade-off: the header markup lives in a JS string rather than an HTML file, and a user with
JavaScript disabled sees no nav (they can still read every page — content is plain HTML).

## 4. Calculator math as pure functions

The math (`js/calculators/`) never touches the page; the page scripts only read inputs and
display outputs. This is the standard "separate logic from presentation" move, in miniature.
It means the formulas are unit-testable (`tests/`), reusable, and explainable on their own.

## 5. Hand-rolled SVG charts — no Chart.js

A charting library is ~200KB to draw two lines. `js/charts.js` is ~140 lines and draws
exactly what the site needs, with no external requests — including the cursor-hover comparison
readout (see #10). Trade-off: no animations, and the hover is a mouse/touch enhancement (a
keyboard-only user gets the chart's text summary, not the tooltip) — acceptable for an
educational illustration. (If richer charts are ever needed, Chart.js via CDN is the documented
fallback.)

## 6. GitHub Pages for hosting

Static files need a static host. GitHub Pages is free, has no servers or accounts to manage,
deploys on every push, and the repo IS the deployment — nothing can drift. Trade-off: no
server-side anything, which this project deliberately doesn't need. (Netlify would work
identically; Pages keeps everything in one place with the source.)

## 7. Quizzes — added once the questions existed; no progress dashboard

Quizzes need an **authored question bank**, and the questions are content — they had to be
written, not generated. Once the three quizzes (31 questions) were written, the feature went in:
a data-driven quiz hub at the end of the calculator section (see ARCHITECTURE.md). A
**progress/points dashboard** stays out — it needs persistent client-side state for no learning
gain the score-out-of-100 doesn't already give.

## 8. System fonts, no webfonts

The neo-brutalist look comes from weight, case and borders — achievable with the system font
stack at zero network cost. Trade-off: typography varies slightly across OSes; acceptable.

## 9. Educational-only by design

No real money, no KYC, no brokerage links that execute anything, no user accounts, no
analytics that collect personal data. This keeps the site fully outside SEBI/RBI regulatory
scope and honest to its purpose: teaching. The footer disclaimer on every page states it.

## 10. The SIP return slider is NOT capped

**Considered and rejected.** Capping the SIP calculator's expected annual return (it goes to 50%)
at ~35% was on the table — very high returns are unrealistic. I kept it open on purpose: letting
someone plug in a wild number, see a huge figure, and *then* reason back to a realistic one is
itself the lesson. The honest trade-off: a naive user could read 40% as a normal expectation, so
the input hint frames 10–14% as the historical range.

## 11. The compound chart's simple-vs-compound comparison is interactive

The compound graph has an IPL-style cursor comparison: a hover (or tap) readout with a guide
line, a dot on each curve, and a tooltip showing the compound value, the simple value, and the
**gap** at that year. The honest trade-off: for small inputs the two lines sit close and the gap
looks unimpressive — that's not a bug, it's literally what little compounding does over a short
horizon, and it makes the long-horizon gap land harder.

## 12. YouTube videos open in a new tab, not inline

The video thumbnails open on YouTube in a new tab rather than as an embedded iframe player.
That's the better engineering call too: no third-party iframe loading tracking cookies into an
educational-only page, no autoplay, and the thumbnail is one `<img>` and one link. The featured
videos are a starter set and can be swapped by editing the link list.
