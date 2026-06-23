# Interview talking points — Invest 101

*The questions an interviewer is likely to ask about this project, and a starting answer for
each. Say them in your own words — the point is that you can explain every choice, not recite
these. Don't claim anything here you can't actually walk through.*

## "Why did you build this?"

Frame: the personal story (account-opening as a 16-year-old) + the research. *I tried to learn
investing and every site assumed I already knew the words and already had an account. I
interviewed friends — same wall. So I built the site I wished existed: starts at zero, simple
words, and it actually tells you how a minor in India can begin.*

## "Why these three calculators?"

- **Compound** — looks forward, one lump sum: teaches *why* money grows in a curve.
- **SIP** — looks forward, monthly habit: teaches you don't need a lump sum, you need
  consistency (the ₹2,000/month story).
- **Returns/CAGR** — looks **backward**: teaches how to honestly measure what you earned and
  compare investments of different lengths.

## "Why is your site different from Zerodha Varsity / Investopedia?"

From the peer research (3 recorded interviews): jargon, scattered information, and the missing
"how do I actually open an account as a minor" step. The differentiator is
**beginner-accessibility, validated by real interviews** — not a guess.

## "What was technically hard?"

Honest candidates: keeping the header/footer identical across every page without a framework
(and why fetch-based includes break from disk); getting the SIP annuity-due formula right and
proving it with unit tests; making SVG charts from scratch; adding the cursor-hover comparison
to the compound chart (mapping a mouse position back to the nearest year and reading both
curves); and the quiz engine that scores and marks answers from a plain JSON file. Making all of
it work on mobile.

## "Why no framework? Isn't that less impressive?"

*A framework solves problems my site doesn't have. I can explain every line of mine — that
felt more valuable than shipping 10,000 lines I couldn't.* (Full reasoning: DECISIONS.md #1.)

## "You added a quiz — why, and how does it work?"

Peers in the interviews wanted a way to check what stuck, so I wrote three short quizzes
(fundamentals, risk/diversification, and real-world scenarios). I wrote the questions; the site
loads them from one data file and scores you out of 100, marking the right answer on each. Adding
a question is editing one line of JSON — the engine never changes. (ARCHITECTURE.md.)

## "Why does the SIP calculator let you enter unrealistic returns?"

*Deliberate.* You can type 40% and see a huge number — and that's the teaching moment: you see
the big figure, realise nobody reliably earns that, and dial back to a realistic 10–14% (which
the hint shows). Capping it would have hidden the lesson. I can defend leaving it open *and* the
risk of doing so. (DECISIONS.md #10 — this is a "show your reasoning" answer, not a feature.)

## "Why make the compound graph interactive?"

A static gap is abstract; hovering the graph shows the exact rupee gap between simple and
compound interest at each year, so the curve becomes a number you can feel. I also know its
limit: for small inputs the two lines sit close — which is honest, because little compounding
*does* little over a short horizon. (DECISIONS.md #11.)

## "What would you build next?"

A progress tracker that remembers a visitor across visits — that needs stored state, which a
static, no-accounts site deliberately doesn't have, so it would be the next real feature to think
through. After that, more quizzes and worked examples as the content grows.

## "How do you know the calculators are right?"

Unit tests against hand-computed anchors (`tests/calculators.test.mjs`): ₹10,000 at 10% for
10 years = ₹25,937.42; ₹2,000/month at 12% for 10 years = ₹4,64,678; 50% over 3 years =
14.47% CAGR. Run `node tests/calculators.test.mjs`.
