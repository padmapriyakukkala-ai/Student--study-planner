
const STORAGE_KEY = "studentStudyPlannerData";

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (saved &&
            Array.isArray(saved.subjects) &&
            Array.isArray(saved.tasks) &&
            Array.isArray(saved.exams)) {
            return saved;
        }
    } catch (error) {
        console.log("Starting with an empty planner.");
    }

    return {
        subjects: [],
        tasks: [],
        exams: []
    };
}

let data = loadData();

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        alert("Unable to save data in this browser.");
    }
}

function safe(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function makeId() {
    return Date.now().toString() +
        Math.random().toString(36).slice(2);
}

// Add subject
document.getElementById("subjectForm").addEventListener("submit", event => {
    event.preventDefault();

    const input = document.getElementById("subject");
    const name = input.value.trim();

    if (!name) return;

    if (data.subjects.some(s =>
        s.name.toLowerCase() === name.toLowerCase())) {
        alert("This subject is already added.");
        return;
    }

    data.subjects.push({
        id: makeId(),
        name: name
    });

    input.value = "";
    saveData();
    render();
});

// Add task
document.getElementById("taskForm").addEventListener("submit", event => {
    event.preventDefault();

    const input = document.getElementById("task");
    const name = input.value.trim();

    if (!name) return;

    data.tasks.push({
        id: makeId(),
        name: name,
        completed: false
    });

    input.value = "";
    saveData();
    render();
});

// Add exam date
document.getElementById("examForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("examName").value.trim();
    const date = document.getElementById("examDate").value;

    if (!name || !date) return;

    data.exams.push({
        id: makeId(),
        name: name,
        date: date
    });

    document.getElementById("examName").value = "";
    document.getElementById("examDate").value = "";

    saveData();
    render();
});

// Tick and untick tasks
document.addEventListener("change", event => {
    if (!event.target.matches("[data-task-id]")) return;

    const task = data.tasks.find(
        t => t.id === event.target.dataset.taskId
    );

    if (task) {
        task.completed = event.target.checked;
        saveData();
        render();
    }
});

// Delete subjects, tasks or exams
document.addEventListener("click", event => {
    const button = event.target.closest("[data-delete-type]");
    if (!button) return;

    const id = button.dataset.id;
    const type = button.dataset.deleteType;

    if (type === "subject") {
        data.subjects = data.subjects.filter(s => s.id !== id);
    }

    if (type === "task") {
        data.tasks = data.tasks.filter(t => t.id !== id);
    }

    if (type === "exam") {
        data.exams = data.exams.filter(e => e.id !== id);
    }

    saveData();
    render();
});

function render() {
    const completed = data.tasks.filter(t => t.completed).length;

    const percentage = data.tasks.length
        ? Math.round(completed / data.tasks.length * 100)
        : 0;

    document.getElementById("subjectCount").textContent =
        data.subjects.length;

    document.getElementById("taskCount").textContent =
        data.tasks.length;

    document.getElementById("completedCount").textContent =
        completed;

    document.getElementById("progressFill").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        "Your progress: " + percentage + "% (" +
        completed + " of " + data.tasks.length + " completed)";

    // Show subjects
    document.getElementById("subjectList").innerHTML =
        data.subjects.length
            ? data.subjects.map(s => `
                <li>
                    <span>📘 ${safe(s.name)}</span>
                    <button type="button" class="delete-btn"
                        data-delete-type="subject"
                        data-id="${safe(s.id)}">Delete</button>
                </li>
            `).join("")
            : '<li class="empty">Add your first subject!</li>';

    // Show study tasks
    document.getElementById("taskList").innerHTML =
        data.tasks.length
            ? data.tasks.map(t => `
                <li>
                    <input type="checkbox"
                        data-task-id="${safe(t.id)}"
                        aria-label="Mark task complete"
                        ${t.completed ? "checked" : ""}>
                    <span class="${t.completed ? "done" : ""}">
                        ${safe(t.name)}
                    </span>
                    <button type="button" class="delete-btn"
                        data-delete-type="task"
                        data-id="${safe(t.id)}">Delete</button>
                </li>
            `).join("")
            : '<li class="empty">Add your first study task!</li>';

    // Show exams in date order
    const exams = [...data.exams].sort(
        (a, b) => a.date.localeCompare(b.date)
    );

    document.getElementById("examList").innerHTML =
        exams.length
            ? exams.map(e => `
                <li>
                    <span>📝 ${safe(e.name)}
                        <br>
                        <small>${safe(e.date)}</small>
                    </span>
                    <button type="button" class="delete-btn"
                        data-delete-type="exam"
                        data-id="${safe(e.id)}">Delete</button>
                </li>
            `).join("")
            : '<li class="empty">Add your exam dates!</li>';
}

render();
        
