const calendar = document.getElementById("calendar");
const nameInput = document.getElementById("nameInput");
const amBtn = document.getElementById("amBtn");
const pmBtn = document.getElementById("pmBtn");

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

let selectedDate = new Date(year, month, today.getDate());

// 各日の記録（午前・午後）を保持するMap
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

    // 表示用内容作成
    let content = `${i}`;
    const record = wateringRecords.get(key);
    if (record) {
      if (record.am) content += `<br>午前：${record.am}`;
      if (record.pm) content += `<br>午後：${record.pm}`;
    }

    day.innerHTML = content;

    // 選択ハイライト
    if (
      thisDate.getDate() === selectedDate.getDate() &&
      thisDate.getMonth() === selectedDate.getMonth() &&
      thisDate.getFullYear() === selectedDate.getFullYear()
    ) {
      day.classList.add("selected");
    }

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
  alert(`${selectedDate.toLocaleDateString()} の${time === "am" ? "午前" : "午後"}に ${name} さんが水やりしました！`);
}

amBtn.addEventListener("click", () => handleWatering("am"));
pmBtn.addEventListener("click", () => handleWatering("pm"));

renderCalendar(selectedDate);
