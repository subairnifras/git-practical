const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterButtons = document.querySelectorAll(".filters button");
const categorySelect = document.getElementById("categorySelect");
const prioritySelect = document.getElementById("prioritySelect");
const searchInput = document.getElementById("searchInput");
const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const progressFill = document.getElementById("progressFill");
const completeAllBtn = document.getElementById("completeAllBtn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let searchQuery = "";
let editingId = null;

function getDateTime() {
  const now = new Date();
  return now.toLocaleDateString() + " • " + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  progressFill.style.width = percentage + "%";
}

function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      currentFilter === "all" ? true :
      currentFilter === "active" ? !task.completed :
      task.completed;

    const matchesSearch = 
      task.text.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div>No tasks found</div>
      </div>
    `;
    updateStats();
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.classList.add(`priority-${task.priority}`);
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <div class="task-header">
        <div class="task-text">${task.text}</div>
        <div class="task-actions">
          <button class="edit-btn" onclick="editTask('${task.id}')">Edit</button>
          <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
      </div>
      <div class="task-meta">
        <span class="task-badge category-${task.category.toLowerCase()}">${task.category}</span>
        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        <span class="task-time">${task.time}</span>
      </div>
    `;

    li.querySelector(".task-text").addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });

  updateStats();
}

window.editTask = function(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  taskInput.value = task.text;
  categorySelect.value = task.category;
  prioritySelect.value = task.priority;
  editingId = id;
  addBtn.textContent = "Update Task";
  taskInput.focus();
};

window.deleteTask = function(id) {
  const li = Array.from(taskList.children).find(
    el => el.querySelector('.delete-btn')?.onclick?.toString().includes(id)
  );
  
  if (li) {
    li.classList.add("removing");
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    }, 300);
  }
};

function addOrUpdateTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  if (editingId) {
    const task = tasks.find(t => t.id === editingId);
    if (task) {
      task.text = text;
      task.category = categorySelect.value;
      task.priority = prioritySelect.value;
    }
    editingId = null;
    addBtn.textContent = "Add Task";
  } else {
    tasks.unshift({
      id: Date.now().toString(),
      text,
      completed: false,
      time: getDateTime(),
      category: categorySelect.value,
      priority: prioritySelect.value
    });
  }

  taskInput.value = "";
  saveTasks();
  renderTasks();
}

addBtn.addEventListener("click", addOrUpdateTask);

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addOrUpdateTask();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderTasks();
});

completeAllBtn.addEventListener("click", () => {
  tasks.forEach(task => task.completed = true);
  saveTasks();
  renderTasks();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();