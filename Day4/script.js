let timeLeft = 25 * 60;
let isRunning = false;
let isFocusTime = true;
let timer = null;

const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
  statusDisplay.textContent = isFocusTime ? 'Focus Time' : 'Break Time';
}

function switchMode() {
  isFocusTime = !isFocusTime;
  timeLeft = isFocusTime ? 25 * 60 : 5 * 60;
  updateDisplay();
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay();
  } else {
    switchMode();
  }
}

startBtn.addEventListener('click', () => {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(tick, 1000);
  }
});

pauseBtn.addEventListener('click', () => {
  if (isRunning) {
    isRunning = false;
    clearInterval(timer);
  }
});

resetBtn.addEventListener('click', () => {
  isRunning = false;
  clearInterval(timer);
  timeLeft = 25 * 60;
  isFocusTime = true;
  updateDisplay();
});

updateDisplay();
