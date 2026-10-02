function addSubject() {
    let subject = document.getElementById("subject").value;

    if (subject === "") {
        alert("Please enter a subject.");
        return;
    }

    let list = document.getElementById("subjectList");

    let item = document.createElement("li");
    item.textContent = subject;

    list.appendChild(item);

    document.getElementById("subject").value = "";
}
function addTask() {
    let task = document.getElementById("task").value;

    if (task === "") {
        alert("Please enter a study task.");
        return;
    }

    let list = document.getElementById("taskList");

    let item = document.createElement("li");

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    let text = document.createElement("span");
    text.textContent = task;

    checkbox.style.flexShrink = "0";
    text.style.flex = "1";

    item.appendChild(checkbox);
    item.appendChild(text);

    list.appendChild(item);

    document.getElementById("task").value = "";
}
