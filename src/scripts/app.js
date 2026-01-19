const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll(".filters button");
const categorySelect = document.getElementById("categorySelect");
const dailyProgress = document.getElementById("dailyProgress");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function getDateTime() {
  const now = new Date();
  return now.toLocaleDateString() + " • " + now.toLocaleTimeString();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateCounter() {
  counter.textContent = `${tasks.length} tasks`;
}

function updateDailyTracker() {
  const today = new Date().toLocaleDateString();
  const todayTasks = tasks.filter(task =>
    task.time.startsWith(today)
  );

  const completed = todayTasks.filter(task => task.completed).length;
  dailyProgress.textContent =
    `${completed} / ${todayTasks.length} tasks completed`;
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks
    .filter(task => {
      if (currentFilter === "active") return !task.completed;
      if (currentFilter === "completed") return task.completed;
      return true;
    })
    .forEach((task, index) => {
      const li = document.createElement("li");
      if (task.completed) li.classList.add("completed");

      li.innerHTML = `
        <div>
          <strong>${task.text}</strong>
          <div class="task-time">${task.time}</div>
          <div class="category ${task.category}">${task.category}</div>
        </div>
        <button>✕</button>
      `;

      li.addEventListener("click", () => {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
      });

      li.querySelector("button").addEventListener("click", (e) => {
        e.stopPropagation();
        li.classList.add("removing");

        setTimeout(() => {
          tasks.splice(index, 1);
          saveTasks();
          renderTasks();
        }, 300);
      });

      taskList.appendChild(li);
    });

  updateCounter();
  updateDailyTracker();
}

addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    text,
    completed: false,
    time: getDateTime(),
    category: categorySelect.value
  });

  taskInput.value = "";
  saveTasks();
  renderTasks();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

renderTasks();
