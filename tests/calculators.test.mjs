/* Unit tests for the three calculator modules (pure functions).
   Run: node tests/calculators.test.mjs
   Anchors are hand-computed expected values, recomputed and locked here. */

import assert from "node:assert/strict";
import { compoundCalc } from "../js/calculators/compound.js";
import { sipCalc } from "../js/calculators/sip.js";
import { returnsCalc } from "../js/calculators/returns.js";

function approx(actual, expected, tol, label) {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    label + ": expected ~" + expected + ", got " + actual
  );
}

/* ---- compound: P=10000, r=10%, n=1 (annual), t=10 ---- */
{
  const r = compoundCalc({ principal: 10000, annualRatePct: 10, years: 10, compoundsPerYear: 1 });
  approx(r.maturity, 25937.42, 0.01, "compound maturity");          // 10000 · 1.1^10
  approx(r.totalInterest, 15937.42, 0.01, "compound interest");
  approx(r.simpleMaturity, 20000, 0.01, "simple comparison");        // 10000 · (1 + 0.1·10)
  assert.equal(r.series.length, 11, "compound series years 0..10");
  approx(r.series[0].compound, 10000, 0.001, "series year 0");
  approx(r.series[10].compound, 25937.42, 0.01, "series year 10");
}

/* monthly compounding grows faster than annual */
{
  const annual = compoundCalc({ principal: 10000, annualRatePct: 10, years: 10, compoundsPerYear: 1 });
  const monthly = compoundCalc({ principal: 10000, annualRatePct: 10, years: 10, compoundsPerYear: 12 });
  assert.ok(monthly.maturity > annual.maturity, "monthly > annual compounding");
}

/* ---- SIP: M=2000, 12% annual, 10 years (annuity-due) ---- */
{
  const r = sipCalc({ monthly: 2000, annualReturnPct: 12, years: 10 });
  approx(r.invested, 240000, 0.001, "SIP invested");                 // 2000 · 120
  approx(r.maturity, 464678, 1, "SIP maturity");                     // 2000·[(1.01^120−1)/0.01]·1.01
  approx(r.gains, 224678, 1, "SIP gains");
  assert.equal(r.series.length, 11, "SIP series years 0..10");
}

/* SIP zero-rate edge: FV = invested */
{
  const r = sipCalc({ monthly: 1000, annualReturnPct: 0, years: 5 });
  approx(r.maturity, 60000, 0.001, "SIP zero-rate maturity = invested");
}

/* ---- returns: buy=10000, sell=15000, 3 years ---- */
{
  const r = returnsCalc({ buyValue: 10000, sellValue: 15000, years: 3 });
  approx(r.absolute, 5000, 0.001, "returns absolute");
  approx(r.pct, 50, 0.001, "returns pct");
  approx(r.cagrPct, 14.47, 0.01, "returns CAGR");                    // 1.5^(1/3) − 1
  assert.equal(r.isGain, true, "returns isGain");
}

/* returns loss case */
{
  const r = returnsCalc({ buyValue: 10000, sellValue: 8000, years: 2 });
  approx(r.absolute, -2000, 0.001, "loss absolute");
  approx(r.pct, -20, 0.001, "loss pct");
  assert.ok(r.cagrPct < 0, "loss CAGR negative");
  assert.equal(r.isGain, false, "loss isGain false");
}

/* ---- invalid input returns null, never NaN ---- */
{
  assert.equal(compoundCalc({ principal: -5, annualRatePct: 10, years: 1, compoundsPerYear: 1 }), null);
  assert.equal(sipCalc({ monthly: "abc", annualReturnPct: 12, years: 10 }), null);
  assert.equal(returnsCalc({ buyValue: 0, sellValue: 100, years: 1 }), null);
  assert.equal(returnsCalc({ buyValue: 100, sellValue: 100, years: 0 }), null);
}

console.log("All calculator tests passed.");
