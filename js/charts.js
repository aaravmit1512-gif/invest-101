/* Tiny self-contained SVG chart helper — no external dependencies.
   One exported function: drawLineChart(el, options)
   options = {
     series: [{ name, color, points: [{x, y}] }],   // x = year, y = INR
     xLabel, ariaLabel,
     interactive,   // default true — adds a cursor-hover readout
     compareDiff    // default false — when true (and exactly 2 series), the
                    // tooltip also shows the gap between them (e.g. compound vs.
                    // simple interest)
   }
   Renders a responsive area/line chart with axis ticks, plus an optional
   cursor-tracking guide line + tooltip. Hand-rolled on purpose: zero
   dependencies, every line explainable. See DECISIONS.md. */

var SVGNS = "http://www.w3.org/2000/svg";

function fmtINR(n) {
  if (n >= 1e7) return (n / 1e7).toFixed(1).replace(/\.0$/, "") + " Cr";
  if (n >= 1e5) return (n / 1e5).toFixed(1).replace(/\.0$/, "") + " L";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
  return String(Math.round(n));
}

export function drawLineChart(el, options) {
  var W = 640, H = 360;
  var pad = { top: 18, right: 18, bottom: 44, left: 76 };
  var iw = W - pad.left - pad.right;
  var ih = H - pad.top - pad.bottom;

  var series = options.series.filter(function (s) { return s.points.length > 0; });
  if (series.length === 0) { el.innerHTML = ""; return; }

  var xs = [], ys = [];
  series.forEach(function (s) {
    s.points.forEach(function (p) { xs.push(p.x); ys.push(p.y); });
  });
  var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
  var yMax = Math.max.apply(null, ys) * 1.06 || 1;
  if (xMax === xMin) xMax = xMin + 1;

  function sx(x) { return pad.left + ((x - xMin) / (xMax - xMin)) * iw; }
  function sy(y) { return pad.top + ih - (y / yMax) * ih; }

  var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' +
    (options.ariaLabel || "Chart") + '" xmlns="http://www.w3.org/2000/svg">';

  // y grid + ticks (4 divisions)
  for (var i = 0; i <= 4; i++) {
    var yVal = (yMax / 4) * i;
    var y = sy(yVal);
    svg += '<line x1="' + pad.left + '" y1="' + y + '" x2="' + (W - pad.right) +
      '" y2="' + y + '" stroke="#ddd" stroke-width="1"/>';
    svg += '<text x="' + (pad.left - 8) + '" y="' + (y + 4) +
      '" text-anchor="end" font-size="11" font-weight="700" fill="#555">' +
      "₹" + fmtINR(yVal) + "</text>";
  }

  // x ticks (at most 8)
  var span = xMax - xMin;
  var stepX = Math.max(1, Math.ceil(span / 8));
  for (var x = xMin; x <= xMax; x += stepX) {
    svg += '<text x="' + sx(x) + '" y="' + (H - pad.bottom + 18) +
      '" text-anchor="middle" font-size="11" font-weight="700" fill="#555">' + x + "</text>";
  }
  svg += '<text x="' + (pad.left + iw / 2) + '" y="' + (H - 6) +
    '" text-anchor="middle" font-size="11" font-weight="800" fill="#111" letter-spacing="1">' +
    (options.xLabel || "") + "</text>";

  // series: area fill (first series only) then lines
  series.forEach(function (s, idx) {
    var line = s.points.map(function (p, i) {
      return (i === 0 ? "M" : "L") + sx(p.x).toFixed(1) + " " + sy(p.y).toFixed(1);
    }).join(" ");

    if (idx === 0) {
      var area = line +
        " L" + sx(s.points[s.points.length - 1].x).toFixed(1) + " " + sy(0).toFixed(1) +
        " L" + sx(s.points[0].x).toFixed(1) + " " + sy(0).toFixed(1) + " Z";
      svg += '<path d="' + area + '" fill="' + s.color + '" opacity="0.35"/>';
    }
    svg += '<path d="' + line + '" fill="none" stroke="' + s.color +
      '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>';
  });

  // interactive hover layer (guide line + a dot per series), hidden until hover
  var interactive = options.interactive !== false;
  if (interactive) {
    svg += '<g class="hoverlayer" style="display:none">';
    svg += '<line class="guide" x1="0" y1="' + pad.top + '" x2="0" y2="' + (pad.top + ih) +
      '" stroke="#111" stroke-width="1.5" stroke-dasharray="4 4"/>';
    series.forEach(function (s) {
      svg += '<circle r="5" cx="0" cy="0" fill="' + s.color + '" stroke="#111" stroke-width="2"/>';
    });
    svg += "</g>";
  }

  // frame
  svg += '<rect x="' + pad.left + '" y="' + pad.top + '" width="' + iw +
    '" height="' + ih + '" fill="none" stroke="#111" stroke-width="2.5"/>';

  // transparent capture surface (last so it sits on top)
  if (interactive) {
    svg += '<rect class="capture" x="' + pad.left + '" y="' + pad.top + '" width="' + iw +
      '" height="' + ih + '" fill="transparent" style="cursor:crosshair"/>';
  }

  svg += "</svg>";
  el.innerHTML = svg;

  if (!interactive) return;
  wireHover(el, series, options, { sx: sx, sy: sy, xMin: xMin, xMax: xMax, pad: pad, iw: iw, W: W });
}

function wireHover(el, series, options, geo) {
  var svgEl = el.querySelector("svg");
  var layer = el.querySelector(".hoverlayer");
  var guide = el.querySelector(".guide");
  var dots = el.querySelectorAll(".hoverlayer circle");
  var capture = el.querySelector(".capture");
  if (!svgEl || !layer || !capture) return;

  // sorted unique year values, from the densest series
  var base = series.reduce(function (a, b) { return b.points.length >= a.points.length ? b : a; });
  var years = base.points.map(function (p) { return p.x; });

  // tooltip lives in the .chart-card (position:relative); recreated each draw.
  // el.innerHTML only clears #chart, not its sibling tip in .chart-card, so we
  // must remove the previous tip or one accumulates per keystroke.
  var card = el.closest(".chart-card") || el;
  var prevTip = card.querySelector(".chart-tip");
  if (prevTip) prevTip.remove();
  var tip = document.createElement("div");
  tip.className = "chart-tip";
  card.appendChild(tip);

  function valueAt(s, year) {
    for (var i = 0; i < s.points.length; i++) {
      if (s.points[i].x === year) return s.points[i].y;
    }
    // fall back to nearest point by x
    var best = s.points[0];
    s.points.forEach(function (p) {
      if (Math.abs(p.x - year) < Math.abs(best.x - year)) best = p;
    });
    return best.y;
  }

  function move(clientX) {
    var rect = svgEl.getBoundingClientRect();
    if (rect.width === 0) return;
    var vx = ((clientX - rect.left) / rect.width) * geo.W;             // px -> viewBox x
    var dataX = geo.xMin + ((vx - geo.pad.left) / geo.iw) * (geo.xMax - geo.xMin);
    // nearest available year
    var year = years[0];
    years.forEach(function (yv) { if (Math.abs(yv - dataX) < Math.abs(year - dataX)) year = yv; });

    var gx = geo.sx(year);
    layer.style.display = "";
    guide.setAttribute("x1", gx);
    guide.setAttribute("x2", gx);

    var rows = "";
    var vals = [];
    series.forEach(function (s, i) {
      var v = valueAt(s, year);
      vals.push(v);
      if (dots[i]) { dots[i].setAttribute("cx", gx); dots[i].setAttribute("cy", geo.sy(v)); }
      rows += '<div class="row"><span class="sw" style="background:' + s.color + '"></span>' +
        s.name + ": " + inr(v) + "</div>";
    });

    var diffHtml = "";
    if (options.compareDiff && vals.length === 2) {
      var gap = Math.abs(vals[0] - vals[1]);
      diffHtml = '<div class="diff">Difference: ' + inr(gap) + "</div>";
    }

    tip.innerHTML = '<div class="yr">Year ' + year + "</div>" + rows + diffHtml;
    tip.classList.add("show");

    // position the tooltip near the cursor, clamped inside the card
    var cardRect = card.getBoundingClientRect();
    var left = clientX - cardRect.left + 14;
    var maxLeft = cardRect.width - tip.offsetWidth - 8;
    if (left > maxLeft) left = clientX - cardRect.left - tip.offsetWidth - 14; // flip to left side
    if (left < 4) left = 4;
    tip.style.left = left + "px";
    tip.style.top = "12px";
  }

  function hide() {
    layer.style.display = "none";
    tip.classList.remove("show");
  }

  capture.addEventListener("mousemove", function (e) { move(e.clientX); });
  capture.addEventListener("mouseleave", hide);
  capture.addEventListener("touchstart", function (e) { if (e.touches[0]) move(e.touches[0].clientX); }, { passive: true });
  capture.addEventListener("touchmove", function (e) { if (e.touches[0]) move(e.touches[0].clientX); }, { passive: true });
  capture.addEventListener("touchend", hide);
}

/* Format a number as Indian-grouped rupees, e.g. 464678 -> "₹4,64,678" */
export function inr(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
