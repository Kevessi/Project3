document.addEventListener("DOMContentLoaded", () => {
  const startQuizForm = document.getElementById("start-quiz-form");
  const quizContainer = document.getElementById("quiz-container");
  const userNameInput = document.getElementById("user-name");
  const quizSelector = document.getElementById("quiz-selector");
  let currentQuestionIndex = 0;
  let score = 0;
  let userName = "";
  let currentQuizId = ""; // Add a variable to store the current quiz ID

  // Load quizzes when the page loads
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
    // Fetch the quizzes from the API
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

  function loadQuiz(quizId, userName) {
    startQuizForm.style.display = "none";
    quizContainer.style.display = "block";
    fetchQuestion(quizId, currentQuestionIndex);
  }

  function fetchQuestion(quizId, questionIndex) {
    fetch(
      `https://my-json-server.typicode.com/Kevessi/Project3/quizzes/${quizId}/questions/${questionIndex}`
    )
      .then((response) => response.json())
      .then((questionData) => {
        if (questionData) {
          renderQuestion(questionData);
          attachAnswerHandlers();
        }
      })
      .catch((error) => console.error("Error:", error));
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
    const answerButtons = document.querySelectorAll(".answer");
    answerButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        const selectedAnswer = event.target.getAttribute("data-answer");
        processAnswer(selectedAnswer);
      });
    });
  }

  function processAnswer(selectedAnswer) {
    // Check if the selected answer is correct
    // This part of the code will depend on how your question data is structured
    // For simplicity, let's assume each questionData has a 'correctAnswer' field
    if (selectedAnswer === questionData.correctAnswer) {
      score++;
      // Display a success message
      displayFeedback(true);
    } else {
      // Display an error message with the correct answer
      displayFeedback(false, questionData.correctAnswer);
    }

    currentQuestionIndex++;
    // Check if there are more questions
    if (currentQuestionIndex < totalQuestions) {
      // Fetch the next question
      fetchQuestion(currentQuizId, currentQuestionIndex);
    } else {
      // End the quiz
      endQuiz();
    }
  }

  function displayFeedback(isCorrect, correctAnswer = "") {
    let feedbackMessage = isCorrect
      ? "Correct! Well done."
      : `Incorrect. The right answer was: ${correctAnswer}`;
    // Code to display feedback message
    // Hide feedback after a certain time and proceed to next question
  }

  function endQuiz() {
    // Calculate the final score and display the final message
    let finalScore = (score / totalQuestions) * 100;
    let finalMessage =
      finalScore >= 80
        ? `Congratulations ${userName}! You passed the quiz with ${finalScore}%!`
        : `Sorry ${userName}, you failed the quiz. Your score: ${finalScore}%`;
    document.getElementById("final-message").innerHTML = finalMessage;
    document.getElementById("final-message").style.display = "block";
    // Hide the quiz container
    quizContainer.style.display = "none";
  }

  // Additional functions to initialize the quiz, load quizzes, etc.
});
