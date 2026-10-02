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
