let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let longBreakDuration = 15 * 60;

let timeLeft = workDuration;
let timer;
let isRunning = false;
let sessionCount = 0;
let currentSession = "work";
let taskMode = "pending";

// DOM elements
const timerDisplay = document.getElementById("timer");
const sessionType = document.getElementById("session-type");
const sessionCounter = document.getElementById("session-count");
const alarm = document.getElementById("alarm");

const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resumeBtn = document.getElementById("resume");
const resetBtn = document.getElementById("reset");

const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const saveSettingsBtn = document.getElementById("save-settings");

const toggleBtn = document.getElementById("toggle-tasks");
const restoreBtn = document.getElementById("toggle-tasks-show");
const app = document.querySelector(".app");

// --- TIMER FUNCTIONS ---
function getSessionDuration() {
  return currentSession === "work" ? workDuration :
         currentSession === "shortBreak" ? breakDuration :
         longBreakDuration;
}

function getSessionName() {
  return currentSession === "work" ? "Work Session" :
         currentSession === "shortBreak" ? "Short Break" : "Long Break";
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function toggleButtons(state) {
  startBtn.classList.add("hidden");
  pauseBtn.classList.add("hidden");
  resumeBtn.classList.add("hidden");
  resetBtn.classList.add("hidden");

  if (state === "initial") startBtn.classList.remove("hidden");
  else if (state === "running") {
    pauseBtn.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
  } else if (state === "paused") {
    resumeBtn.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
  }
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      endSession();
    }
  }, 1000);
  toggleButtons("running");
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  toggleButtons("paused");
}

function resumeTimer() {
  startTimer();
  toggleButtons("running");
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = getSessionDuration();
  sessionType.textContent = getSessionName();
  updateTimerDisplay();
  toggleButtons("initial");
}

function endSession() {
  clearInterval(timer);
  isRunning = false;
  alarm.play();

  if (currentSession === "work") {
    sessionCount++;
    sessionCounter.textContent = `Completed Pomodoros: ${sessionCount}`;
    updateTaskPomodoro();
    currentSession = sessionCount % 4 === 0 ? "longBreak" : "shortBreak";
  } else {
    currentSession = "work";
  }

  timeLeft = getSessionDuration();
  sessionType.textContent = getSessionName();
  updateTimerDisplay();
  toggleButtons("initial");
  updateTabStyles();
}

// --- TASKS ---
function renderTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const filtered = tasks.filter(t => t.completed === (taskMode === "completed"));
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  if (filtered.length === 0) {
    document.querySelector(".no-tasks").classList.remove("hidden");
  } else {
    document.querySelector(".no-tasks").classList.add("hidden");
    filtered.forEach((task, i) => {
      const li = document.createElement("li");
      li.className = "task-item" + (task.completed ? " completed" : "");
      li.innerHTML = `
        <span>${task.name} (${task.pomodoros})</span>
        <div>
          <button onclick="toggleComplete(${i})">✔</button>
          <button onclick="removeTask(${i})">🗑</button>
        </div>
      `;
      taskList.appendChild(li);
    });
  }
}

function updateTaskDropdown() {
  const select = document.getElementById("selected-task");
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  select.innerHTML = '<option value="">-- Select Task --</option>';
  tasks.forEach((task, i) => {
    if (!task.completed) {
      select.innerHTML += `<option value="${i}">${task.name}</option>`;
    }
  });
}

function toggleComplete(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks[index].completed = !tasks[index].completed;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  updateTaskDropdown();
}

function removeTask(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  updateTaskDropdown();
}

function updateTaskPomodoro() {
  const taskIndex = document.getElementById("selected-task").value;
  if (taskIndex !== "") {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks[taskIndex].pomodoros++;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateTaskDropdown();
  }
}

// --- SETTINGS MODAL ---
settingsBtn.addEventListener("click", () => {
  document.getElementById("pomodoro-input").value = workDuration / 60;
  document.getElementById("short-input").value = breakDuration / 60;
  document.getElementById("long-input").value = longBreakDuration / 60;
  settingsModal.classList.remove("hidden");
});

saveSettingsBtn.addEventListener("click", () => {
  workDuration = parseInt(document.getElementById("pomodoro-input").value) * 60;
  breakDuration = parseInt(document.getElementById("short-input").value) * 60;
  longBreakDuration = parseInt(document.getElementById("long-input").value) * 60;
  timeLeft = getSessionDuration();
  updateTimerDisplay();
  settingsModal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add("hidden");
  }
});

// --- TASK EVENTS ---
document.getElementById("add-task-link").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("task-form").classList.remove("hidden");
  document.querySelector(".no-tasks").classList.add("hidden");
  document.getElementById("task-input").focus();
});

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("task-input").value.trim();
  if (!name) return;
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push({ name, pomodoros: 0, completed: false });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  document.getElementById("task-input").value = "";
  document.getElementById("task-form").classList.add("hidden");
  renderTasks();
  updateTaskDropdown();
});

// --- TABS + ADD TIME ---
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    currentSession = tab.dataset.type;
    timeLeft = getSessionDuration();
    sessionType.textContent = getSessionName();
    resetTimer();
    updateTabStyles();
  });
});

document.querySelectorAll(".add-time").forEach(btn => {
  btn.addEventListener("click", () => {
    const addSec = parseInt(btn.dataset.minutes) * 60;
    timeLeft += addSec;
    updateTimerDisplay();
  });
});

// --- TOGGLE PANEL ---
toggleBtn.addEventListener("click", () => {
  app.classList.add("collapsed");
  restoreBtn.classList.remove("hidden");
});

restoreBtn.addEventListener("click", () => {
  app.classList.remove("collapsed");
  restoreBtn.classList.add("hidden");
});

// --- TAB MODE SWITCH ---
document.getElementById("pending-tab").addEventListener("click", () => {
  taskMode = "pending";
  document.getElementById("pending-tab").classList.add("active");
  document.getElementById("completed-tab").classList.remove("active");
  renderTasks();
});
document.getElementById("completed-tab").addEventListener("click", () => {
  taskMode = "completed";
  document.getElementById("completed-tab").classList.add("active");
  document.getElementById("pending-tab").classList.remove("active");
  renderTasks();
});

// --- CONTROLS ---
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resumeBtn.addEventListener("click", resumeTimer);
resetBtn.addEventListener("click", resetTimer);

// --- INIT ---
updateTimerDisplay();
renderTasks();
updateTaskDropdown();
toggleButtons("initial");
