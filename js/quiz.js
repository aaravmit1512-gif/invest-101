/* Quiz engine — data-driven, zero dependencies.
   Questions live in data/quizzes.json. One exported
   function, mountQuiz(rootEl, quiz), renders a quiz, scores it out of 100 on
   submit, and marks every question. Kept deliberately small and readable so the
   logic (one mark per question, score = correct / total × 100) is explainable.
   See ARCHITECTURE.md / DECISIONS.md. */

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

export function mountQuiz(root, quiz) {
  var total = quiz.questions.length;

  var html = '<form class="quiz" novalidate aria-label="' + esc(quiz.title) + ' quiz">';
  quiz.questions.forEach(function (q, i) {
    html +=
      '<fieldset class="quiz-q">' +
      '<legend><span class="quiz-qnum">Q' + (i + 1) + "</span>" +
      (q.topic ? '<span class="quiz-topic">' + esc(q.topic) + "</span>" : "") +
      '<span class="quiz-prompt">' + esc(q.q) + "</span></legend>" +
      (q.scenario ? '<p class="quiz-scenario">' + esc(q.scenario) + "</p>" : "");
    q.options.forEach(function (opt, j) {
      var id = quiz.id + "-q" + i + "-o" + j;
      html +=
        '<label class="quiz-opt" for="' + id + '">' +
        '<input type="radio" id="' + id + '" name="' + quiz.id + "-q" + i + '" value="' + j + '">' +
        '<span class="quiz-opt-text">' + esc(opt) + "</span>" +
        "</label>";
    });
    html += "</fieldset>";
  });
  html +=
    '<div class="quiz-actions">' +
    '<button type="submit" class="btn green">Submit answers</button>' +
    '<button type="button" class="btn ghost quiz-reset" hidden>Try again</button>' +
    "</div>" +
    '<div class="quiz-result" role="status" aria-live="polite" hidden></div>' +
    "</form>";
  root.innerHTML = html;

  var form = root.querySelector("form");
  var fieldsets = form.querySelectorAll("fieldset.quiz-q");
  var resultEl = form.querySelector(".quiz-result");
  var submitBtn = form.querySelector('button[type="submit"]');
  var resetBtn = form.querySelector(".quiz-reset");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var correct = 0, blank = 0;

    quiz.questions.forEach(function (q, i) {
      var fs = fieldsets[i];
      var opts = fs.querySelectorAll(".quiz-opt");
      var chosen = form.querySelector('input[name="' + quiz.id + "-q" + i + '"]:checked');

      opts.forEach(function (o, j) {
        o.classList.remove("correct", "wrong");
        o.querySelector("input").disabled = true;       // lock answers after submit
        if (j === q.answer) o.classList.add("correct");  // always reveal the right one
      });

      if (!chosen) {
        blank++;
        fs.classList.add("quiz-blank");
      } else if (Number(chosen.value) === q.answer) {
        correct++;
      } else {
        opts[Number(chosen.value)].classList.add("wrong");
      }
    });

    var score = Math.round((correct / total) * 100);
    var good = score >= 60;
    resultEl.hidden = false;
    resultEl.className = "quiz-result " + (good ? "pass" : "tryagain");
    resultEl.innerHTML =
      '<div class="quiz-score">' + score + "<span>/100</span></div>" +
      "<p>You got <strong>" + correct + " of " + total + "</strong> right" +
      (blank ? " (" + blank + " left blank)" : "") + ". " +
      (good
        ? "Nicely done — the correct answer to each question is marked in green."
        : "Have another look — the correct answers are marked in green, your wrong picks in pink.") +
      "</p>";

    submitBtn.hidden = true;
    resetBtn.hidden = false;
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  resetBtn.addEventListener("click", function () {
    mountQuiz(root, quiz);   // fresh render = clean retry
    var firstLegend = root.querySelector("legend");
    if (firstLegend) { firstLegend.setAttribute("tabindex", "-1"); firstLegend.focus(); }
  });
}
