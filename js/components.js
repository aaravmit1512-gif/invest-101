/* Shared header + footer, one source of truth.
   Every page loads this with:  <script src="<root>/js/components.js" data-root="<root>"></script>
   where <root> is the relative path back to the site root ("." on index,
   ".." inside pages/ and calculators/).
   Built as JS template injection (not fetch) so pages also work opened
   directly from disk — no server, no CORS. See DECISIONS.md. */

(function () {
  var script = document.currentScript;
  var root = (script && script.getAttribute("data-root")) || ".";

  /* Working site name — change this one constant and every page follows. */
  var SITE_NAME = "Invest 101";

  var NAV_LINKS = [
    { href: root + "/index.html", label: "Home" },
    { href: root + "/index.html#topics", label: "Topics" },
    { href: root + "/index.html#calculators", label: "Calculators" },
    { href: root + "/pages/quiz.html", label: "Quiz" },
    { href: root + "/pages/faq.html", label: "FAQ" },
  ];

  var header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML =
    '<div class="bar">' +
    '<a class="logo" href="' + root + '/index.html">' +
    '<span class="mark" aria-hidden="true">&#8599;</span>' +
    "<span>" + SITE_NAME + "</span>" +
    "</a>" +
    '<button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">MENU</button>' +
    '<nav class="site-nav" id="site-nav" aria-label="Main">' +
    NAV_LINKS.map(function (l) {
      return '<a href="' + l.href + '">' + l.label + "</a>";
    }).join("") +
    '<a class="cta" href="' + root + '/pages/how-to-start.html">Get started</a>' +
    "</nav>" +
    "</div>";

  var footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML =
    '<div class="inner">' +
    '<div class="brand">' + SITE_NAME + "</div>" +
    '<nav aria-label="Footer">' +
    '<a href="' + root + '/index.html#topics">Topics</a>' +
    '<a href="' + root + '/calculators/compound.html">Compound</a>' +
    '<a href="' + root + '/calculators/sip.html">SIP</a>' +
    '<a href="' + root + '/calculators/returns.html">Returns</a>' +
    '<a href="' + root + '/pages/quiz.html">Quiz</a>' +
    '<a href="' + root + '/pages/glossary.html">Glossary</a>' +
    '<a href="' + root + '/pages/faq.html">FAQ</a>' +
    "</nav>" +
    '<p class="disclaimer"><strong>Educational purposes only.</strong> This site teaches concepts. ' +
    "It is not investment advice, handles no real money, opens no accounts, and is not " +
    "registered with SEBI or any regulator. Always involve a parent or guardian and do your " +
    "own research before investing real money.</p>" +
    '<p class="fine">Built by Aarav Mittal &middot; ' + new Date().getFullYear() + "</p>" +
    "</div>";

  document.body.insertBefore(header, document.body.firstChild);
  document.body.appendChild(footer);

  var toggle = header.querySelector(".nav-toggle");
  var nav = header.querySelector(".site-nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();
