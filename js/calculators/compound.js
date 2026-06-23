/* Compound-interest calculator — pure math, no DOM.
   Formula: A = P · (1 + r/n)^(n·t)
   Also computes the simple-interest path (A = P · (1 + r·t)) so the page
   can show WHY compounding beats simple interest over time. */

export function compoundCalc(input) {
  var P = Number(input.principal);
  var r = Number(input.annualRatePct) / 100;
  var t = Number(input.years);
  var n = Number(input.compoundsPerYear);

  if (!(P >= 0) || !(r >= 0) || !(t >= 0) || !(n >= 1)) {
    return null;
  }

  var maturity = P * Math.pow(1 + r / n, n * t);
  var simpleMaturity = P * (1 + r * t);

  // year-by-year series for the chart (year 0 .. t, whole years)
  var series = [];
  var wholeYears = Math.floor(t);
  for (var y = 0; y <= wholeYears; y++) {
    series.push({
      year: y,
      compound: P * Math.pow(1 + r / n, n * y),
      simple: P * (1 + r * y),
    });
  }
  if (t > wholeYears) {
    series.push({
      year: t,
      compound: maturity,
      simple: simpleMaturity,
    });
  }

  return {
    maturity: maturity,
    totalInterest: maturity - P,
    simpleMaturity: simpleMaturity,
    simpleInterest: simpleMaturity - P,
    compoundAdvantage: maturity - simpleMaturity,
    series: series,
  };
}
