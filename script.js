
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
    renderProgressChart();
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

function renderProgressChart() {
    const chartArea = document.getElementById("chartArea");

    if (!chartArea) return;

    chartArea.replaceChildren();

    const total = tasks.length;
    const completed = tasks.filter(task => task.done).length;
    const remaining = total - completed;

    if (total === 0) {
        chartArea.textContent = "Add tasks to see your progress chart.";
        return;
    }

    const data = [
        { label: "Completed", value: completed },
        { label: "Remaining", value: remaining }
    ];

    data.forEach(item => {
        const column = document.createElement("div");
        column.className = "bar-column";

        const number = document.createElement("strong");
        number.textContent = item.value;

        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = Math.max(
    4,
    (item.value / total) * 90
) + "px";

bar.style.flexShrink = "0";

        const label = document.createElement("span");
        label.textContent = item.label;

        column.append(number, bar, label);
        chartArea.appendChild(column);
    });
}

renderProgressChart();

/* AUTOMATIC STUDY PLAN GENERATOR */

const autoPlanDate = document.getElementById("planDate");
const autoPlanHours = document.getElementById("planHours");
const autoPlanButton = document.getElementById("generatePlan");
const autoPlanList = document.getElementById("autoPlanList");
const autoPlanMessage = document.getElementById("planMessage");

const autoPlanStorageKey = "plannerAutomaticPlan";

function autoPlanLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

autoPlanDate.value = autoPlanLocalDate(new Date());

function generateAutomaticStudyPlan() {
    autoPlanList.replaceChildren();

    if (subjects.length === 0) {
        autoPlanMessage.textContent =
            "Please add your subjects in My Subjects first.";
        return;
    }

    if (exams.length === 0) {
        autoPlanMessage.textContent =
            "Please add exam names and dates in Exam Dates first.";
        return;
    }

    const chosenDate = autoPlanDate.value;

    if (!chosenDate) {
        autoPlanMessage.textContent = "Please choose a planning date.";
        return;
    }

    // Match exam names to subjects.
    // Use the same name in My Subjects and Exam Dates.
    const examMap = new Map();

    exams.forEach(exam => {
        const key = exam.name.trim().toLowerCase();

        if (!examMap.has(key) || exam.date < examMap.get(key)) {
            examMap.set(key, exam.date);
        }
    });

    const orderedSubjects = subjects
        .map((subject, index) => ({
            name: subject,
            originalIndex: index,
            examDate: examMap.get(subject.trim().toLowerCase()) || "9999-12-31"
        }))
        .sort((a, b) =>
            a.examDate.localeCompare(b.examDate) ||
            a.originalIndex - b.originalIndex
        );

    const studyMinutes = Number(autoPlanHours.value) * 60;
    const sessionCount = Math.min(
        orderedSubjects.length,
        Math.floor(studyMinutes / 30)
    );

    const plan = [];

    for (let i = 0; i < sessionCount; i++) {
        const subject = orderedSubjects[i];

        let activity = "Revise important concepts";

        if (i % 3 === 1) {
            activity = "Practice questions";
        } else if (i % 3 === 2) {
            activity = "Review notes and mistakes";
        }

        plan.push({
            subject: subject.name,
            activity,
            minutes: 30,
            done: false
        });
    }

    // If there are fewer subjects than sessions,
    // use the remaining time for revision.
    let remainingMinutes = studyMinutes -
        plan.reduce((sum, item) => sum + item.minutes, 0);

    let extraIndex = 0;

    while (remainingMinutes >= 30 && orderedSubjects.length > 0) {
        const subject = orderedSubjects[
            extraIndex % orderedSubjects.length
        ];

        plan.push({
            subject: subject.name,
            activity: "Revision and practice",
            minutes: 30,
            done: false
        });

        remainingMinutes -= 30;
        extraIndex++;
    }

    const saved = {
        date: chosenDate,
        items: plan
    };

    localStorage.setItem(
        autoPlanStorageKey,
        JSON.stringify(saved)
    );

    displayAutomaticStudyPlan(saved);

    autoPlanMessage.textContent =
        "Your plan is ready! Complete each session as you study.";
}

function displayAutomaticStudyPlan(plan) {
    autoPlanList.replaceChildren();

    if (!plan || !Array.isArray(plan.items) || plan.items.length === 0) {
        autoPlanMessage.textContent = "No sessions in this plan yet.";
        return;
    }

    plan.items.forEach((item, index) => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.alignItems = "flex-start";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.done;
        checkbox.style.marginTop = "5px";

        const details = document.createElement("div");
        details.style.flex = "1";

        const heading = document.createElement("strong");
        heading.textContent = item.subject;

        const description = document.createElement("p");
        description.style.margin = "6px 0 0";
        description.textContent =
            item.activity + " · " + item.minutes + " minutes";

        if (item.done) {
            heading.style.textDecoration = "line-through";
            description.style.opacity = "0.65";
        }

        checkbox.addEventListener("change", () => {
            item.done = checkbox.checked;

            localStorage.setItem(
                autoPlanStorageKey,
                JSON.stringify(plan)
            );

            displayAutomaticStudyPlan(plan);
        });

        details.append(heading, description);
        li.append(checkbox, details);
        autoPlanList.appendChild(li);
    });

    const finished = plan.items.filter(item => item.done).length;

    autoPlanMessage.textContent =
        "Completed " + finished + " of " + plan.items.length +
        " study sessions.";
}

autoPlanButton.addEventListener(
    "click",
    generateAutomaticStudyPlan
);

// Restore today's previously saved plan, if available.
const savedAutomaticPlan = JSON.parse(
    localStorage.getItem(autoPlanStorageKey) || "null"
);

if (savedAutomaticPlan &&
    savedAutomaticPlan.date === autoPlanDate.value) {
    displayAutomaticStudyPlan(savedAutomaticPlan);
            }


const scheduleForm = document.getElementById("scheduleForm");
const scheduleList = document.getElementById("scheduleList");
const scheduleDay = document.getElementById("scheduleDay");
const scheduleTime = document.getElementById("scheduleTime");
const scheduleSubject = document.getElementById("scheduleSubject");
const dayTabs = document.getElementById("dayTabs");

let schedules = JSON.parse(
    localStorage.getItem("plannerSchedules") || "[]"
);

let selectedDay = "Monday";

function renderSchedule() {
    scheduleList.replaceChildren();

    const daySchedules = schedules
        .filter(item => item.day === selectedDay)
        .sort((a, b) => a.time.localeCompare(b.time));

    if (daySchedules.length === 0) {
        const message = document.createElement("li");
        message.textContent = "No study sessions planned for " + selectedDay + ".";
        scheduleList.appendChild(message);
    }

    daySchedules.forEach(item => {
        const li = document.createElement("li");
        const text = document.createElement("span");
        const del = document.createElement("button");

        text.textContent = item.time + " — " + item.subject;
        del.textContent = "Delete";
        del.type = "button";
        del.className = "delete-btn";

        del.addEventListener("click", () => {
            schedules = schedules.filter(s => s.id !== item.id);
            localStorage.setItem("plannerSchedules", JSON.stringify(schedules));
            renderSchedule();
        });

        li.append(text, del);
        scheduleList.appendChild(li);
    });
}

scheduleForm.addEventListener("submit", event => {
    event.preventDefault();

    const subject = scheduleSubject.value.trim();
    const time = scheduleTime.value;
    const day = scheduleDay.value;

    if (!subject || !time) {
        alert("Please enter a subject and study time.");
        return;
    }

    schedules.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        day,
        time,
        subject
    });

    localStorage.setItem("plannerSchedules", JSON.stringify(schedules));

    selectedDay = day;
    dayTabs.querySelectorAll(".day-btn").forEach(button => {
        button.classList.toggle("active", button.dataset.day === selectedDay);
    });

    renderSchedule();
    scheduleSubject.value = "";
});

dayTabs.querySelectorAll(".day-btn").forEach(button => {
    button.addEventListener("click", () => {
        selectedDay = button.dataset.day;

        dayTabs.querySelectorAll(".day-btn").forEach(tab => {
            tab.classList.toggle("active", tab === button);
        });

        renderSchedule();
    });
});

renderSchedule();
            
    
