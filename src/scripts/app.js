const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const dueDateInput = document.getElementById("dueDate");
const themeToggle = document.getElementById("themeToggle");
const themeColor = document.getElementById("themeColor");
const filterButtons = document.querySelectorAll(".filters button");
const searchInput = document.getElementById("searchInput");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");

const completeAllBtn = document.getElementById("completeAllBtn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let searchQuery = "";
let draggedItem = null;


themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

themeColor.addEventListener("input", (e) => {
  document.documentElement.style.setProperty("--primary", e.target.value);
});


function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});


searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase();
  renderTasks();
});


function animateNumber(element, value) {
  element.style.transform = "scale(1.2)";
  element.textContent = value;
  setTimeout(() => {
    element.style.transform = "scale(1)";
  }, 200);
}


function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  animateNumber(totalTasksEl, total);
  animateNumber(completedTasksEl, completed);

  const circle = document.querySelector(".progress-circle");
  circle.textContent = percent + "%";
  circle.style.background =
    `conic-gradient(var(--primary) ${percent * 3.6}deg, #444 0deg)`;
}


function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks.filter(task => {

    const matchFilter =
      currentFilter === "all" ? true :
      currentFilter === "active" ? !task.completed :
      task.completed;

    const matchSearch =
      task.text.toLowerCase().includes(searchQuery);

    return matchFilter && matchSearch;
  });

  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.draggable = true;

    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <div class="task-text">${task.text}</div>
      <div class="task-meta">
        📅 ${task.dueDate || "No due date"}
      </div>
    `;

    li.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    li.addEventListener("dragstart", () => draggedItem = task);
    li.addEventListener("dragover", e => e.preventDefault());
    li.addEventListener("drop", () => {
      tasks = tasks.filter(t => t !== draggedItem);
      const index = tasks.indexOf(task);
      tasks.splice(index, 0, draggedItem);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });

  updateProgress();
}


addBtn.addEventListener("click", () => {
  if (!taskInput.value.trim()) return;

  tasks.unshift({
    id: Date.now(),
    text: taskInput.value,
    completed: false,
    dueDate: dueDateInput.value
  });

  taskInput.value = "";
  dueDateInput.value = "";

  saveTasks();
  renderTasks();
});


completeAllBtn.addEventListener("click", () => {
  tasks.forEach(task => task.completed = true);
  saveTasks();
  renderTasks();
});


downloadPdfBtn.addEventListener("click", () => {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;

  let y = 20;

  doc.setFontSize(18);
  doc.text("Task Report", 20, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Total Tasks: ${total}`, 20, y);
  y += 8;
  doc.text(`Completed Tasks: ${completed}`, 20, y);
  y += 8;
  doc.text(`Active Tasks: ${active}`, 20, y);
  y += 15;

  doc.setFontSize(14);
  doc.text("Task List:", 20, y);
  y += 10;

  doc.setFontSize(11);

  tasks.forEach((task, index) => {
    const status = task.completed ? "Completed" : "Active";
    const due = task.dueDate || "No due date";

    const text = `${index + 1}. ${task.text} | ${status} | Due: ${due}`;

    doc.text(text, 20, y);
    y += 8;

    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("Task_Report.pdf");
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});


renderTasks();