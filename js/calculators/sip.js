/* SIP (Systematic Investment Plan) calculator — pure math, no DOM.
   Monthly rate i = annual/12, months nm = years·12.
   Future value of a monthly SIP (payments at the start of each month):
     FV = M · [((1+i)^nm − 1) / i] · (1+i)
   This is the standard formula Indian SIP calculators use. */

export function sipCalc(input) {
  var M = Number(input.monthly);
  var annual = Number(input.annualReturnPct) / 100;
  var years = Number(input.years);

  if (!(M >= 0) || !(annual >= 0) || !(years >= 0)) {
    return null;
  }

  var i = annual / 12;
  var nm = Math.round(years * 12);

  function fvAfterMonths(months) {
    if (months === 0) return 0;
    if (i === 0) return M * months;
    return M * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  }

  var maturity = fvAfterMonths(nm);
  var invested = M * nm;

  // year-by-year series for the chart
  var series = [];
  for (var y = 0; y * 12 <= nm; y++) {
    series.push({
      year: y,
      invested: M * y * 12,
      value: fvAfterMonths(y * 12),
    });
  }
  if (nm % 12 !== 0) {
    series.push({ year: years, invested: invested, value: maturity });
  }

  return {
    invested: invested,
    maturity: maturity,
    gains: maturity - invested,
    series: series,
  };
}
