# Invest 101 — investing, explained for Indian teens

An educational website that teaches Indian teenagers the *why*, *where* and *how* of saving
and investing — in simple words, with three interactive calculators. Built by **Aarav Mittal**.

**Educational only.** No real money, no KYC, no brokerage, no SEBI/RBI-registered services.

## What's here

```
index.html            home — topic cards + calculator cards + "test yourself"
pages/                content pages (intro → terms → … → glossary) + quiz.html
calculators/          compound.html · sip.html · returns.html
js/calculators/       the calculator MATH — pure functions, no page code
js/charts.js          hand-rolled SVG chart helper, incl. the hover comparison (no libraries)
js/quiz.js            the quiz engine — renders + scores out of 100
js/components.js      shared header/footer, injected on every page
css/styles.css        the whole design system (one file)
data/glossary.json    glossary terms — edit this to add a term
data/quizzes.json     the three quizzes — edit this to change questions/answers
tests/                unit tests for the calculator math
ARCHITECTURE.md       how the site is put together
DECISIONS.md          why it's built this way (trade-offs)
CHALLENGES.md         what was hard during the build, and how it was solved
docs/                 interview talking points
```

## Run it locally

You need any static file server (module scripts don't run from `file://`):

```
cd <this folder>
python3 -m http.server 8000
```

Then open <http://localhost:8000>. No build step, no installation, no dependencies.

## Run the tests

```
node tests/calculators.test.mjs
```

Tests check the three calculators against hand-computed anchor values
(e.g. ₹10,000 at 10% for 10 years = ₹25,937.42).

## Edit content

- Page text lives directly in each `pages/*.html` file — open, edit, save, refresh.
- Glossary terms live in `data/glossary.json` — one entry per term.
- Quiz questions live in `data/quizzes.json` — `answer` is the 0-based index of the correct option.
- The header/footer (every page) live in ONE place: `js/components.js`. The working name
  "Invest 101" is the `SITE_NAME` constant there — change it once, every page follows.
- Colours, spacing and card styles live in `css/styles.css` under `:root`.

## Deploy

The site is static files — any static host works. It is deployed on **GitHub Pages**:
push to `main` and Pages serves the result. Settings → Pages → Deploy from branch → `main` / root.
