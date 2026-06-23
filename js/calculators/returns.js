/* Returns calculator — pure math, no DOM.
   Looks BACKWARD at an investment you already made:
     absolute return = sell − buy
     % return        = (sell − buy) / buy · 100
     CAGR            = (sell / buy)^(1/years) − 1
   CAGR ("annualised return") is what lets you compare investments held
   for different lengths of time. */

export function returnsCalc(input) {
  var buy = Number(input.buyValue);
  var sell = Number(input.sellValue);
  var years = Number(input.years);

  if (!(buy > 0) || !(sell >= 0) || !(years > 0)) {
    return null;
  }

  var absolute = sell - buy;
  var pct = (absolute / buy) * 100;
  var cagr = (Math.pow(sell / buy, 1 / years) - 1) * 100;

  return {
    absolute: absolute,
    pct: pct,
    cagrPct: cagr,
    isGain: absolute >= 0,
  };
}
