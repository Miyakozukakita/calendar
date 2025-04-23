const calendar = document.getElementById("calendar");
const nameInput = document.getElementById("nameInput");
const amBtn = document.getElementById("amBtn");
const pmBtn = document.getElementById("pmBtn");
const amDeleteBtn = document.getElementById("amDeleteBtn");
const pmDeleteBtn = document.getElementById("pmDeleteBtn");

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

let selectedDate = new Date(year, month, today.getDate());
const wateringRecords = new Map();

function renderCalendar(targetDate) {
  calendar.innerHTML = "";
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.classList.add("day");
    const thisDate = new Date(y, m, i);
    const key = thisDate.toDateString();

    let content = `${i}`;
    const record = wateringRecords.get(key);
    if (record) {
      if (record.am) content += `<br>午前：${record.am}`;
      if (record.pm) content += `<br>午後：${record.pm}`;
    }

    if (
      thisDate.getDate() === selectedDate.getDate() &&
      thisDate.getMonth() === selectedDate.getMonth() &&
      thisDate.getFullYear() === selectedDate.getFullYear()
    ) {
      day.classList.add("selected");
    }

    day.innerHTML = content;
    day.addEventListener("click", () => {
      selectedDate = thisDate;
      renderCalendar(selectedDate);
    });

    calendar.appendChild(day);
  }
}

function handleWatering(time) {
  const name = nameInput.value.trim();
  if (name === "") {
    alert("名前を入力してください！");
    return;
  }

  const key = selectedDate.toDateString();
  const record = wateringRecords.get(key) || {};
  record[time] = name;
  wateringRecords.set(key, record);
  renderCalendar(selectedDate);
}

function handleDelete(time) {
  const key = selectedDate.toDateString();
  const record = wateringRecords.get(key);
  if (record && record[time]) {
    delete record[time];
    if (!record.am && !record.pm) {
      wateringRecords.delete(key);
    } else {
      wateringRecords.set(key, record);
    }
    renderCalendar(selectedDate);
  }
}

amBtn.addEventListener("click", () => handleWatering("am"));
pmBtn.addEventListener("click", () => handleWatering("pm"));
amDeleteBtn.addEventListener("click", () => handleDelete("am"));
pmDeleteBtn.addEventListener("click", () => handleDelete("pm"));

renderCalendar(selectedDate);
