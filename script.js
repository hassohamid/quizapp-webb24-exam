// Hämtar viktiga element
const startButton = document.getElementById("start-button");
const quizContainer = document.getElementById("quiz-container");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const nextButton = document.getElementById("next-button");
const feedbackElement = document.getElementById("feedback");
const scoreDisplay = document.getElementById("score-display");
const highScoreDisplay = document.getElementById("high-score-display");
const timerElement = document.getElementById("time-left");
const categorySelect = document.getElementById("category");
const resultContainer = document.getElementById("result-container");
const resultText = document.getElementById("result-text");
const nameInput = document.getElementById("name-input");
const saveScoreButton = document.getElementById("save-score-button");
const restartButton = document.getElementById("restart-button");
const highScoresButton = document.getElementById("high-scores-button");
const highScoresContainer = document.getElementById("high-scores-container");
const highScoresList = document.getElementById("high-scores-list");
const backButton = document.getElementById("back-button");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
const localStorageKey = "highScores";

// Eventlyssnare för mina knappar
startButton.addEventListener("click", startQuiz);
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});
restartButton.addEventListener("click", restartQuiz);
highScoresButton.addEventListener("click", viewHighScores);
saveScoreButton.addEventListener("click", saveScore);
backButton.addEventListener("click", () => {
  highScoresContainer.classList.add("hidden");
  document.getElementById("difficulty-container").classList.remove("hidden");
});

// Hämtar kategorier från API och fyller dropdown
async function fetchCategories() {
  const response = await fetch("https://opentdb.com/api_category.php");
  const data = await response.json();
  const categories = data.trivia_categories;

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

// Funktion för att starta quizet
async function startQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  scoreDisplay.textContent = "";
  highScoreDisplay.textContent = "";

  document.getElementById("difficulty-container").classList.add("hidden");
  quizContainer.classList.remove("hidden");
  resultContainer.classList.add("hidden");
  highScoresContainer.classList.add("hidden");

  await fetchQuestions();
  setNextQuestion();
}

// Funktion för att hämta frågor från API baserat på kategori
async function fetchQuestions() {
  const category = categorySelect.value; // Hämtar vald kategori
  const response = await fetch(
    `https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`
  );
  const data = await response.json();
  questions = data.results;
}

// Funktioner för att ställa in frågor och visa resultat osv. (ingen ändring nedan)
function setNextQuestion() {
  resetState();
  if (currentQuestionIndex < questions.length) {
    showQuestion(questions[currentQuestionIndex]);
    startTimer();
  } else {
    endQuiz();
  }
}

function showQuestion(question) {
  questionElement.innerHTML = question.question;
  const answers = [...question.incorrect_answers];
  answers.splice(
    Math.floor(Math.random() * (answers.length + 1)),
    0,
    question.correct_answer
  );

  answers.forEach((answer, index) => {
    const letter = String.fromCharCode(65 + index);
    const optionContainer = document.createElement("div");
    optionContainer.classList.add("option-container");
    optionContainer.setAttribute("data-answer", answer);
    optionContainer.innerHTML = `<strong>${letter}.</strong> <span>${answer}</span>`;
    optionContainer.addEventListener("click", selectAnswer);
    optionsElement.appendChild(optionContainer);
  });
}

function resetState() {
  nextButton.classList.add("hidden");
  feedbackElement.textContent = "";
  timeLeft = 15;
  timerElement.textContent = timeLeft;
  clearInterval(timer);

  while (optionsElement.firstChild) {
    optionsElement.removeChild(optionsElement.firstChild);
  }
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      feedbackElement.textContent = "Time is up!";
      nextButton.classList.remove("hidden");
      disableOptions();
    }
  }, 1000);
}

function selectAnswer(e) {
  clearInterval(timer);
  const selectedContainer = e.currentTarget;
  const selectedAnswer = selectedContainer.getAttribute("data-answer");
  const correct = questions[currentQuestionIndex].correct_answer;

  selectedContainer.classList.add(
    selectedAnswer === correct ? "correct" : "incorrect"
  );

  if (selectedAnswer === correct) {
    feedbackElement.textContent = "Correct!";
    score++;
  } else {
    feedbackElement.textContent = "Incorrect!";
    highlightCorrectAnswer(correct);
  }

  scoreDisplay.textContent = `Score: ${score}`;
  nextButton.classList.remove("hidden");
  disableOptions();
}

function disableOptions() {
  const optionContainers = document.querySelectorAll(".option-container");
  optionContainers.forEach((container) => {
    container.removeEventListener("click", selectAnswer);
  });
}

function highlightCorrectAnswer(correct) {
  const optionContainers = document.querySelectorAll(".option-container");
  optionContainers.forEach((container) => {
    if (container.getAttribute("data-answer") === correct) {
      container.classList.add("correct");
    }
  });
}

function endQuiz() {
  quizContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  resultText.textContent = `You got ${score} out of ${questions.length} questions right!`;
  nameInput.value = "";
}

function saveScore() {
  const name = nameInput.value.trim();
  if (name === "") {
    alert("Please enter your name!");
    return;
  }

  const highScores = JSON.parse(localStorage.getItem(localStorageKey)) || [];
  highScores.push({ name, score });
  highScores.sort((a, b) => b.score - a.score);
  localStorage.setItem(localStorageKey, JSON.stringify(highScores));

  highScoreDisplay.textContent = `High Score: ${score}`;
  viewHighScores();
}

function viewHighScores() {
  resultContainer.classList.add("hidden");
  highScoresContainer.classList.remove("hidden");

  while (highScoresList.firstChild) {
    highScoresList.removeChild(highScoresList.firstChild);
  }

  const highScores = JSON.parse(localStorage.getItem(localStorageKey)) || [];
  highScores.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    highScoresList.appendChild(li);
  });
}

function restartQuiz() {
  resultContainer.classList.add("hidden");
  document.getElementById("difficulty-container").classList.remove("hidden");
  scoreDisplay.textContent = "";
  highScoreDisplay.textContent = "";
}

// Hämta kategorier när sidan laddas
fetchCategories();
