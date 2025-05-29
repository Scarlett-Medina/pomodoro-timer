let workDuration = 25 * 60; // 25 minutes in seconds
let breakDuration = 5 * 60; // 5 minutes in seconds
let longBreakDuration = 15 * 60; // 15 minutes in seconds

let timeLeft = workDuration;
let timer;
let isRunning = false;
let sessionCount = 0;
let currentSession = "work";

const timerDisplay = document.getElementById("timer");
const sessionType = document.getElementById("session-type");
const sessionCounter = document.getElementById("session-count");
const alarm = document.getElementById("alarm");

const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resumeBtn = document.getElementById("resume");
const resetBtn = document.getElementById("reset");

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  isRunning = true;
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      endSession();
    }
  }, 1000);

  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
}

function resumeTimer() {
  startTimer();
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = workDuration;
  currentSession = "work";
  sessionType.textContent = "Work Session";
  updateTimerDisplay();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
}

function endSession() {
  clearInterval(timer);
  alarm.play();

  if (currentSession === "work") {
    sessionCount++;
    sessionCounter.textContent = `Completed Pomodoros: ${sessionCount}`;
    currentSession = sessionCount % 4 === 0 ? "longBreak" : "shortBreak";
    timeLeft = currentSession === "longBreak" ? longBreakDuration : breakDuration;
  } else {
    currentSession = "work";
    timeLeft = workDuration;
  }

  sessionType.textContent = currentSession === "work" ? "Work Session" :
                            currentSession === "shortBreak" ? "Short Break" : "Long Break";
  updateTimerDisplay();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resumeBtn.addEventListener("click", resumeTimer);
resetBtn.addEventListener("click", resetTimer);

updateTimerDisplay(); // initialize
