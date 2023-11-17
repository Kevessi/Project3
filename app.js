document.addEventListener("DOMContentLoaded", () => {
  const startQuizForm = document.getElementById("start-quiz-form");
  const quizContainer = document.getElementById("quiz-container");
  const userNameInput = document.getElementById("user-name");
  const quizSelector = document.getElementById("quiz-selector");
  let currentQuestionIndex = 0;
  let score = 0;
  let userName = "";
  let currentQuizId = "";
  let currentQuestionData;
  let currentQuizData = null;
  let totalQuestions;

  loadQuizzes();

  startQuizForm.addEventListener("submit", function (event) {
    event.preventDefault();
    userName = userNameInput.value.trim();
    currentQuizId = quizSelector.value;
    if (currentQuizId) {
      loadQuiz(currentQuizId, userName);
    }
  });

  function loadQuizzes() {
    fetch("https://my-json-server.typicode.com/Kevessi/Project3/quizzes")
      .then((response) => response.json())
      .then((quizzes) => {
        quizzes.forEach((quiz) => {
          let option = document.createElement("option");
          option.value = quiz.id;
          option.textContent = quiz.title;
          quizSelector.appendChild(option);
        });
      });
  }
  function fetchQuizData(quizId) {
    let url = `https://my-json-server.typicode.com/Kevessi/Project3/quizzes/${quizId}`;
    return fetch(url)
      .then((response) => response.json())
      .then((quiz) => {
        currentQuizData = quiz;
      })
      .catch((error) => console.error("Fetch error:", error.message));
  }

  function loadQuiz(quizId, userName) {
    startQuizForm.style.display = "none";
    quizContainer.style.display = "block";

    fetchQuizData(quizId).then(() => {
      if (currentQuizData && currentQuizData.questions) {
        totalQuestions = currentQuizData.questions.length;
        console.log("Total questions set to:", totalQuestions);
        fetchQuestion(quizId, currentQuestionIndex);
      } else {
        console.error("Failed to load quiz data or quiz data is invalid.");
      }
    });
  }

  function fetchQuestion(quizId, questionIndex) {
    if (!currentQuizData) {
      let url = `https://my-json-server.typicode.com/Kevessi/Project3/quizzes/${quizId}`;
      console.log("Fetching quiz from URL:", url);

      fetch(url)
        .then((response) => response.json())
        .then((quiz) => {
          currentQuizData = quiz;
          processQuestionData(questionIndex);
        })
        .catch((error) => console.error("Fetch error:", error.message));
    } else {
      processQuestionData(questionIndex);
    }
  }

  function processQuestionData(questionIndex) {
    if (questionIndex < currentQuizData.questions.length) {
      currentQuestionData = currentQuizData.questions[questionIndex];
      renderQuestion(currentQuestionData);
      attachAnswerHandlers();
    } else {
      console.error("Question index out of range");
    }
  }

  function renderQuestion(questionData) {
    const templateId = `${questionData.type}-template`;
    const templateSource = document.getElementById(templateId)?.innerHTML;
    if (templateSource) {
      const template = Handlebars.compile(templateSource);
      quizContainer.innerHTML = template(questionData);
    }
  }

  function attachAnswerHandlers() {
    const mcqAnswerButtons = document.querySelectorAll(".mcq .answer");
    mcqAnswerButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        const selectedAnswer = event.target.getAttribute("data-answer");
        processAnswer(selectedAnswer);
      });
    });

    const narrativeSubmitButton = document.getElementById("submit-narrative");
    if (narrativeSubmitButton) {
      narrativeSubmitButton.addEventListener("click", function () {
        const narrativeAnswer = document
          .getElementById("narrative-answer")
          .value.trim();
        processAnswer(narrativeAnswer);
      });
    }

    const imageOptions = document.querySelectorAll(
      ".image-selection .image-option"
    );
    imageOptions.forEach((image) => {
      image.addEventListener("click", function (event) {
        const selectedAnswer = event.target.getAttribute("data-answer");
        processAnswer(selectedAnswer);
      });
    });
  }

  function processAnswer(selectedAnswer) {
    let isCorrect = false;

    if (currentQuestionData.type === "narrative") {
      isCorrect =
        selectedAnswer.toLowerCase() ===
        currentQuestionData.answer.toLowerCase();
    } else {
      isCorrect = selectedAnswer === currentQuestionData.answer;
    }

    if (isCorrect) {
      score++;
      console.log("Correct answer. Score: ", score);
    } else {
      console.log("Incorrect answer. Score: ", score);
    }

    currentQuestionIndex++;
    console.log("Next question index: ", currentQuestionIndex);

    if (currentQuestionIndex < totalQuestions) {
      processQuestionData(currentQuestionIndex);
    } else {
      endQuiz();
    }
  }

  function displayFeedback(isCorrect, correctAnswer = "") {
    let feedbackMessage = isCorrect
      ? "Correct! Well done."
      : `Incorrect. The right answer was: ${correctAnswer}`;
  }

  function endQuiz() {
    console.log("Quiz ended. Final Score: ", score); // Debugging line
    let finalScore = (score / totalQuestions) * 100;
    let finalMessage =
      finalScore >= 80
        ? `Congratulations ${userName}! You passed the quiz with ${finalScore.toFixed(
            2
          )}%!`
        : `Sorry ${userName}, you failed the quiz. Your score: ${finalScore.toFixed(
            2
          )}%`;

    document.getElementById("final-message").innerHTML = finalMessage;
    document.getElementById("final-message").style.display = "block";
    quizContainer.style.display = "none";
  }
});
