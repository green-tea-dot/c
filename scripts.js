// --- グローバル変数 ---
let quizData = [];
let currentBatch = [];
let currentIndex = 0;
let batchSize = 10;
let currentMode = ''; // 'new', 'correct', 'wrong'

let correctAnswers = [];
let wrongAnswers = [];

let usedQuestionsNew = new Set();
let usedQuestionsCorrect = new Set();
let usedQuestionsWrong = new Set();

const homeScreen = document.getElementById('home');
const quizScreen = document.getElementById('quiz');
const resultScreen = document.getElementById('result-screen');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const nextButton = document.getElementById('next');
const resultEl = document.getElementById('result');

nextButton.disabled = true;

// クイズデータを読み込む
async function loadQuizData() {
  const res1 = await fetch('quiz_part1.json');
  const res2 = await fetch('quiz_part2.json');
  const data1 = await res1.json();
  const data2 = await res2.json();
  quizData = [...data1, ...data2];
  showHome();
}

function showHome() {
  homeScreen.style.display = 'block';
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'none';
  correctAnswers = [];
  wrongAnswers = [];
  usedQuestionsNew.clear();
  usedQuestionsCorrect.clear();
  usedQuestionsWrong.clear();
}

function startQuiz(mode) {
  currentMode = mode;
  currentIndex = 0;
  currentBatch = [];

  if (mode === 'new') {
    correctAnswers = [];
    wrongAnswers = [];
    usedQuestionsNew = new Set();
  } else if (mode === 'correct') {
    usedQuestionsCorrect = new Set();
  } else if (mode === 'wrong') {
    usedQuestionsWrong = new Set();
  }

  homeScreen.style.display = 'none';
  quizScreen.style.display = 'block';
  resultScreen.style.display = 'none';

  loadNextBatchFromList();
}

function getNextBatch(dataList, usedSet, batchSize) {
  const remaining = dataList.filter(q => !usedSet.has(q.word));
  if (remaining.length === 0) {
    return [];
  }
  const nextBatch = [];
  while (nextBatch.length < batchSize && remaining.length > 0) {
    const idx = Math.floor(Math.random() * remaining.length);
    const q = remaining.splice(idx, 1)[0];
    nextBatch.push(q);
    usedSet.add(q.word);
  }
  return nextBatch;
}

function loadNextBatchFromList() {
  if (currentMode === 'new') {
    currentBatch = getNextBatch(quizData, usedQuestionsNew, batchSize);
  } else if (currentMode === 'correct') {
    currentBatch = getNextBatch(correctAnswers, usedQuestionsCorrect, batchSize);
  } else if (currentMode === 'wrong') {
    currentBatch = getNextBatch(wrongAnswers, usedQuestionsWrong, batchSize);
  }
  currentIndex = 0;

  if (currentBatch.length === 0) {
    showCompletion();
  } else {
    showQuestion();
    nextButton.disabled = false;
  }
}

function showQuestion() {
  const q = currentBatch[currentIndex];
  questionEl.textContent = `単語: ${q.word}`;
  choicesEl.innerHTML = '';

  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.className = 'choice';
    btn.onclick = () => selectAnswer(choice, q.correct, q);
    choicesEl.appendChild(btn);
  });
}

function selectAnswer(selected, correct, q) {
  const isCorrect = selected === correct;
  if (isCorrect) {
    resultEl.textContent = '⭕ 正解！';
    if (!correctAnswers.includes(q)) correctAnswers.push(q);
  } else {
    resultEl.textContent = `❌ 不正解… 正解は: ${correct}`;
    if (!wrongAnswers.includes(q)) wrongAnswers.push(q);
  }

  Array.from(document.getElementsByClassName('choice')).forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.classList.add('correct');
    } else if (btn.textContent === selected) {
      btn.classList.add('wrong');
    }
  });
}

nextButton.addEventListener('click', () => {
  resultEl.textContent = '';
  currentIndex++;
  if (currentIndex < currentBatch.length) {
    showQuestion();
  } else {
    showCompletion();
  }
});

function showCompletion() {
  questionEl.textContent = '🎉 お疲れさまでした！';
  choicesEl.innerHTML = '';
  resultEl.textContent = '';
  nextButton.disabled = true;

  setTimeout(() => {
    showHome();
  }, 2000);
}

document.getElementById('start-new').addEventListener('click', () => startQuiz('new'));
document.getElementById('start-correct').addEventListener('click', () => startQuiz('correct'));
document.getElementById('start-wrong').addEventListener('click', () => startQuiz('wrong'));

// 読み込み開始
loadQuizData();
