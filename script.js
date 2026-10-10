
const subjectForm = document.getElementById("subjectForm");
const subjectInput = document.getElementById("subject");
const subjectList = document.getElementById("subjectList");
const subjectCount = document.getElementById("subjectCount");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("task");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const completedCount = document.getElementById("completedCount");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const examForm = document.getElementById("examForm");
const examName = document.getElementById("examName");
const examDate = document.getElementById("examDate");
const examList = document.getElementById("examList");

let subjects = JSON.parse(localStorage.getItem("plannerSubjects") || "[]");
let tasks = JSON.parse(localStorage.getItem("plannerTasks") || "[]");
let exams = JSON.parse(localStorage.getItem("plannerExams") || "[]");

function saveData() {
    localStorage.setItem("plannerSubjects", JSON.stringify(subjects));
    localStorage.setItem("plannerTasks", JSON.stringify(tasks));
    localStorage.setItem("plannerExams", JSON.stringify(exams));
}

function makeItem(text, deleteAction) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    const del = document.createElement("button");

    span.textContent = text;
    del.textContent = "Delete";
    del.className = "delete-btn";
    del.type = "button";
    del.addEventListener("click", deleteAction);

    li.append(span, del);
    return li;
}

function renderSubjects() {
    subjectList.replaceChildren();
    subjectCount.textContent = subjects.length;

    subjects.forEach((subject, index) => {
        subjectList.appendChild(
            makeItem(subject, () => {
                subjects.splice(index, 1);
                saveData();
                renderSubjects();
            })
        );
    });
}

function updateProgress() {
    const completed = tasks.filter(task => task.done).length;
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round(completed / total * 100);

    taskCount.textContent = total;
    completedCount.textContent = completed;
    progressFill.style.width = percent + "%";
    progressText.textContent = "Your progress: " + percent + "%";
}

function renderTasks() {
    taskList.replaceChildren();

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        const span = document.createElement("span");
        const del = document.createElement("button");

        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        span.textContent = task.text;

        if (task.done) span.classList.add("done");

        checkbox.addEventListener("change", () => {
            tasks[index].done = checkbox.checked;
            saveData();
            renderTasks();
        });

        del.textContent = "Delete";
        del.className = "delete-btn";
        del.type = "button";
        del.addEventListener("click", () => {
            tasks.splice(index, 1);
            saveData();
            renderTasks();
        });

        li.append(checkbox, span, del);
        taskList.appendChild(li);
    });

    updateProgress();
}

function renderExams() {
    examList.replaceChildren();

    exams.forEach((exam, index) => {
        examList.appendChild(
            makeItem(exam.name + " — " + exam.date, () => {
                exams.splice(index, 1);
                saveData();
                renderExams();
            })
        );
    });
}

subjectForm.addEventListener("submit", event => {
    event.preventDefault();
    const value = subjectInput.value.trim();

    if (!value) return;

    subjects.push(value);
    saveData();
    renderSubjects();
    subjectInput.value = "";
    subjectInput.focus();
});

taskForm.addEventListener("submit", event => {
    event.preventDefault();
    const value = taskInput.value.trim();

    if (!value) return;

    tasks.push({ text: value, done: false });
    saveData();
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
});

examForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = examName.value.trim();
    const date = examDate.value;

    if (!name || !date) return;

    exams.push({ name, date });
    saveData();
    renderExams();
    examName.value = "";
    examDate.value = "";
});

renderSubjects();
renderTasks();
renderExams();
    
