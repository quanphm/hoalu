/* Hoalu lessons — reusable quiz widget.
   Usage: a container with [data-quiz], containing one or more .quiz-item.
   Each .quiz-item has:
     - data-answer="X"      (the correct choice value)
     - .quiz-prompt         (the question text)
     - .quiz-options > button[data-choice="X"]
     - .quiz-feedback       (filled in with feedback text)
   Optional: .quiz-score (shows progress) and .quiz-complete (final score line).
   Choices can be anything (stock/flow, yes/no, a/b/c...) — the widget is generic.
   On click: immediate feedback, lock the item, and update the running score. */
(function () {
	"use strict";
	function init(root) {
		var quizzes = (root || document).querySelectorAll("[data-quiz]");
		quizzes.forEach(function (quiz) {
			var items = quiz.querySelectorAll(".quiz-item");
			var answered = 0;
			var correct = 0;
			items.forEach(function (item) {
				var answer = (item.getAttribute("data-answer") || "").trim();
				var buttons = item.querySelectorAll(".quiz-options button");
				var feedback = item.querySelector(".quiz-feedback");
				var reason = (item.getAttribute("data-reason") || "").trim();
				buttons.forEach(function (btn) {
					btn.addEventListener("click", function () {
						if (item.classList.contains("answered")) return;
						var choice = (btn.getAttribute("data-choice") || "").trim();
						var isCorrect = choice === answer;
						item.classList.add("answered");
						buttons.forEach(function (b) {
							b.disabled = true;
							if ((b.getAttribute("data-choice") || "").trim() === answer) b.classList.add("correct");
						});
						if (!isCorrect) btn.classList.add("wrong");
						if (feedback) {
							feedback.classList.toggle("correct", isCorrect);
							feedback.classList.toggle("wrong", !isCorrect);
							feedback.textContent = isCorrect
								? "Correct." + (reason ? " " + reason : "")
								: "Not quite — the answer is " + answer + "." + (reason ? " " + reason : "");
						}
						answered++;
						if (isCorrect) correct++;
						updateScore();
					});
				});
			});
			function updateScore() {
				var score = quiz.querySelector(".quiz-score");
				if (score) {
					score.textContent = answered + " of " + items.length + " answered · " + correct + " correct";
				}
				if (answered === items.length) {
					var done = quiz.querySelector(".quiz-complete");
					if (done) {
						var pct = Math.round((correct / items.length) * 100);
						var perfect = quiz.getAttribute("data-msg-perfect") || "All correct.";
						var good = quiz.getAttribute("data-msg-good") || "Good — " + correct + "/" + items.length + ". Review the misses below.";
						var retry = quiz.getAttribute("data-msg-retry") || "Re-read the section above, then retry — " + correct + "/" + items.length + ".";
						var msg = correct === items.length ? perfect : pct >= 60 ? good : retry;
						done.textContent = msg;
					}
				}
			}
			updateScore();
		});
	}
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", function () { init(document); });
	} else {
		init(document);
	}
	window.HoaluQuiz = { init: init };
})();
